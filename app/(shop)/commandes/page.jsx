'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore    from '@/store/useAuthStore';
import { commandesAPI } from '@/lib/api';

const STATUT_CONFIG = {
  en_attente: { label: 'En attente',  color: '#ca8a04', bg: '#fef9c3' },
  payee:      { label: 'Payée',       color: '#16a34a', bg: '#dcfce7' },
  expediee:   { label: 'Expédiée',    color: '#2563eb', bg: '#dbeafe' },
  livree:     { label: 'Livrée',      color: '#16a34a', bg: '#dcfce7' },
  annulee:    { label: 'Annulée',     color: '#dc2626', bg: '#fee2e2' },
  remboursee: { label: 'Remboursée',  color: '#7c3aed', bg: '#ede9fe' },
};

export default function MesCommandesPage() {
  const router = useRouter();
  const { isAuthenticated, _hydrated } = useAuthStore();
  const [commandes, setCommandes] = useState([]);
  const [loading,   setLoading]   = useState(true);

   useEffect(() => {
    // ⬅️ Attendre la fin de l'hydratation avant toute décision
    if (!_hydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    commandesAPI.getMesCommandes()
      .then(r => setCommandes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [_hydrated, isAuthenticated, router])

  if (loading) return <Skeleton />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>
        Mes commandes
      </h1>

      {commandes.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            Aucune commande
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Vous n'avez pas encore passé de commande.
          </p>
          <Link
            href="/catalogue"
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {commandes.map(c => {
            const st = STATUT_CONFIG[c.statut] || STATUT_CONFIG.en_attente;
            return (
              <Link
                key={c.id}
                href={`/commandes/${c.id}`}
                className="block rounded-xl p-5 transition-all hover:shadow-lg-theme"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {c.reference_commande}
                      </span>
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                      {c.statut_livraison && c.statut_livraison !== 'preparation' && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                          🚚 {c.statut_livraison}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(c.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                    {c.numero_suivi && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Suivi : <span className="font-mono" style={{ color: 'var(--primary)' }}>{c.numero_suivi}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-lg" style={{ color: 'var(--text)' }}>
                      {Number(c.total).toFixed(2)} €
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>
                      Voir le détail →
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: 'var(--bg-card)' }} />
      {[1,2,3].map(i => (
        <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
      ))}
    </div>
  );
}
