'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

const API  = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` });

const ICONES = {
  bienvenue:        '👋',
  nouvelle_commande:'📦',
  commande_expediee:'🚚',
  commande_livree:  '✅',
  nouveau_avis:     '⭐',
  info:             'ℹ️',
  default:          '🔔',
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, _hydrated } = useAuthStore();
  const [notifs,   setNotifs]   = useState([]);
  const [nonLues,  setNonLues]  = useState(0);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    // ⬅️ Attendre la fin de l'hydratation avant toute décision
    if (!_hydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchNotifs();
  }, [_hydrated, isAuthenticated, router]);

  const fetchNotifs = async () => {
    try {
      const r    = await fetch(`${API}/api/notifications?limit=50`, { headers: auth() });
      const data = await r.json();
      if (data.success) {
        setNotifs(data.data.rows   || []);
        setNonLues(data.data.nonLues || 0);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const marquerLu = async (id) => {
    await fetch(`${API}/api/notifications/${id}/lire`, { method: 'PUT', headers: auth() });
    setNotifs(n => n.map(x => x.id === id ? { ...x, lu: true } : x));
    setNonLues(n => Math.max(0, n - 1));
  };

  const toutLire = async () => {
    await fetch(`${API}/api/notifications/lire-tout`, { method: 'PUT', headers: auth() });
    setNotifs(n => n.map(x => ({ ...x, lu: true })));
    setNonLues(0);
  };

  const supprimer = async (id) => {
    await fetch(`${API}/api/notifications/${id}`, { method: 'DELETE', headers: auth() });
    setNotifs(n => n.filter(x => x.id !== id));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60)    return 'À l\'instant';
    if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) return <Skeleton />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>
            Notifications
          </h1>
          {nonLues > 0 && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {nonLues} non lue{nonLues > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {nonLues > 0 && (
          <button
            onClick={toutLire}
            className="text-sm font-medium px-4 py-2 rounded-lg border hover:opacity-70 transition-opacity"
            style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste */}
      {notifs.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="text-4xl mb-3">🔔</p>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            Aucune notification
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Vous serez notifié ici de l'activité de votre compte.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div
              key={n.id}
              className="flex items-start gap-4 p-4 rounded-xl transition-all"
              style={{
                backgroundColor: n.lu ? 'var(--bg-card)' : 'var(--primary-light)',
                border:          `1px solid ${n.lu ? 'var(--border)' : 'var(--border)'}`,
              }}
            >
              {/* Icône */}
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {ICONES[n.type] || ICONES.default}
              </span>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text)', fontWeight: n.lu ? 400 : 600 }}
                >
                  {n.message}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(n.created_at)}
                </p>
                {n.lien && (
                  <a
                    href={n.lien}
                    className="text-xs font-medium mt-1 inline-block hover:underline"
                    style={{ color: 'var(--primary)' }}
                  >
                    Voir →
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.lu && (
                  <button
                    onClick={() => marquerLu(n.id)}
                    className="text-xs px-2 py-1 rounded-lg hover:opacity-70"
                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                    title="Marquer comme lu"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => supprimer(n.id)}
                  className="text-xs px-2 py-1 rounded-lg hover:opacity-70"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Skeleton = () => (
  <div className="max-w-2xl mx-auto px-4 py-8 space-y-3 animate-pulse">
    <div className="h-8 w-48 rounded mb-6" style={{ backgroundColor: 'var(--bg-card)' }} />
    {[1,2,3,4,5].map(i => (
      <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
    ))}
  </div>
);
