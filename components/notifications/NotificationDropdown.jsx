'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';
import { Bell, Package, Truck, CheckCircle, Star, HandMetal } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` });

export default function NotificationDropdown() {
  const { isAuthenticated } = useAuthStore();
  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const dropRef = useRef(null);
  const pollRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const r    = await fetch(`${API}/api/notifications?limit=10`, { headers: auth() });
      const data = await r.json();
      if (data.success) {
        setNotifs(data.data.rows   || []);
        setNonLues(data.data.nonLues || 0);
      }
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) fetchNotifications();
  };

  const marquerLu = async (id) => {
    try {
      await fetch(`${API}/api/notifications/${id}/lire`, { method: 'PUT', headers: auth() });
      setNotifs(n => n.map(x => x.id === id ? { ...x, lu: true } : x));
      setNonLues(n => Math.max(0, n - 1));
    } catch {}
  };

  const toutLire = async () => {
    try {
      await fetch(`${API}/api/notifications/lire-tout`, { method: 'PUT', headers: auth() });
      setNotifs(n => n.map(x => ({ ...x, lu: true })));
      setNonLues(0);
    } catch {}
  };

  const getIcon = (type) => {
    const props = { size: 16, style: { color: 'var(--primary)' } };
    switch (type) {
      case 'bienvenue':         return <HandMetal {...props} />;
      case 'nouvelle_commande': return <Package {...props} />;
      case 'commande_expediee': return <Truck {...props} />;
      case 'commande_livree':   return <CheckCircle {...props} />;
      case 'nouveau_avis':      return <Star {...props} />;
      default:                  return <Bell {...props} />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={dropRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text)' }}
        title="Notifications"
      >
        <Bell size={22} />
        {nonLues > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-4 h-4 text-xs font-bold rounded-full flex items-center justify-center text-white px-0.5"
            style={{ backgroundColor: 'var(--primary)', fontSize: '10px' }}
          >
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-lg-theme overflow-hidden z-50"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              Notifications {nonLues > 0 && <span style={{ color: 'var(--primary)' }}>({nonLues})</span>}
            </p>
            {nonLues > 0 && (
              <button onClick={toutLire} className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>
                Tout lire
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune notification</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer"
                  style={{
                    borderBottom:    '1px solid var(--border)',
                    backgroundColor: n.lu ? 'transparent' : 'var(--primary-light)',
                  }}
                  onClick={() => { marquerLu(n.id); if (n.lien) window.location.href = n.lien; }}
                >
                  <span className="flex-shrink-0 mt-0.5">{getIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--text)', fontWeight: n.lu ? 400 : 600 }}
                    >
                      {n.message}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(n.created_at)}
                    </p>
                  </div>
                  {!n.lu && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--primary)' }} />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}