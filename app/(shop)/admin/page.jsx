'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

const TABS = ['Vue d\'ensemble', 'Commandes', 'Produits', 'Coupons'];

const STATUT_CONFIG = {
  en_attente: { label: 'En attente',  color: '#ca8a04', bg: '#fef9c3' },
  payee:      { label: 'Payée',       color: '#16a34a', bg: '#dcfce7' },
  expediee:   { label: 'Expédiée',    color: '#2563eb', bg: '#dbeafe' },
  livree:     { label: 'Livrée',      color: '#16a34a', bg: '#dcfce7' },
  annulee:    { label: 'Annulée',     color: '#dc2626', bg: '#fee2e2' },
  remboursee: { label: 'Remboursée',  color: '#7c3aed', bg: '#ede9fe' },
};

const API = process.env.NEXT_PUBLIC_API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('guyagod_token')}`,
  'Content-Type': 'application/json',
});

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isAdmin, _hydrated, user } = useAuthStore();

  const [tab, setTab] = useState(() => {
    const paramTab = searchParams.get('tab');
    return paramTab !== null ? parseInt(paramTab) : 0;
  });
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtres pour les commandes
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderDateStart, setOrderDateStart] = useState('');
  const [orderDateEnd, setOrderDateEnd] = useState('');

  // Filtre recherche pour les produits
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const [newCoupon, setNewCoupon] = useState({
    code: '', type_reduction: 'pourcentage', reduction: '',
    minimum_commande: '', expiration: '',
  });
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!_hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin()) {
      router.push('/');
      return;
    }
    loadAll();
  }, [_hydrated, isAuthenticated, isAdmin]);

  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab !== null) setTab(parseInt(paramTab));
  }, [searchParams]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rc, rp, ru, rco] = await Promise.all([
        fetch(`${API}/api/commandes/all?limit=50`, { headers: authHeader() }).then(r => r.json()),
        fetch(`${API}/api/produits?limit=100`, { headers: authHeader() }).then(r => r.json()),
        fetch(`${API}/api/users`, { headers: authHeader() }).then(r => r.json()),
        fetch(`${API}/api/coupons`, { headers: authHeader() }).then(r => r.json()),
      ]);
      setCommandes(rc.data || []);
      setProduits(rp.data?.rows || []);
      setCoupons(rco.data || []);

      const cmd = rc.data || [];
      setStats({
        total_commandes: cmd.length,
        ca_total: cmd.filter(c => c.statut !== 'annulee').reduce((s, c) => s + Number(c.total), 0),
        en_attente: cmd.filter(c => c.statut === 'en_attente').length,
        users_total: ru.data?.total || 0,
        produits_total: rp.data?.total || 0,
      });
    } catch (err) {
      console.error('loadAll error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (id, statut) => {
    await fetch(`${API}/api/commandes/${id}/statut`, {
      method: 'PUT', headers: authHeader(), body: JSON.stringify({ statut }),
    });
    setCommandes(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponLoading(true);
    try {
      const r = await fetch(`${API}/api/coupons`, {
        method: 'POST', headers: authHeader(), body: JSON.stringify(newCoupon),
      });
      const data = await r.json();
      if (data.success) {
        const r2 = await fetch(`${API}/api/coupons`, { headers: authHeader() }).then(r => r.json());
        setCoupons(r2.data || []);
        setNewCoupon({ code: '', type_reduction: 'pourcentage', reduction: '', minimum_commande: '', expiration: '' });
      }
    } catch { } finally {
      setCouponLoading(false);
    }
  };

  const handleEditProduit = (id) => {
    router.push(`/vendeur/produits/${id}/modifier`);
  };

  const handleDeleteProduit = async (id) => {
    if (!confirm('Supprimer définitivement ce produit ? Toutes ses données seront perdues.')) return;
    try {
      const res = await fetch(`${API}/api/produits/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        const rp = await fetch(`${API}/api/produits?limit=100`, { headers: authHeader() }).then(r => r.json());
        setProduits(rp.data?.rows || []);
        setStats(prev => ({ ...prev, produits_total: rp.data?.total || 0 }));
      } else {
        alert(data.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    }
  };

  const handleReactiverProduit = async (id) => {
    try {
      const res = await fetch(`${API}/api/produits/${id}/reactiver`, {
        method: 'PUT',
        headers: authHeader(),
      });
      const data = await res.json();
      if (data.success) {
        const rp = await fetch(`${API}/api/produits?limit=100`, { headers: authHeader() }).then(r => r.json());
        setProduits(rp.data?.rows || []);
        setStats(prev => ({ ...prev, produits_total: rp.data?.total || 0 }));
      } else {
        alert(data.message || 'Erreur lors de la réactivation');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    }
  };

  // Filtrage des commandes
  const filteredCommandes = commandes.filter(c => {
    if (orderStatusFilter && c.statut !== orderStatusFilter) return false;
    if (orderDateStart) {
      const dateCommande = new Date(c.created_at).toISOString().slice(0,10);
      if (dateCommande < orderDateStart) return false;
    }
    if (orderDateEnd) {
      const dateCommande = new Date(c.created_at).toISOString().slice(0,10);
      if (dateCommande > orderDateEnd) return false;
    }
    return true;
  });

  // Filtrage des produits par recherche (nom, SKU, vendeur)
  const filteredProduits = produits.filter(p => {
    if (!productSearchQuery.trim()) return true;
    const q = productSearchQuery.toLowerCase();
    return p.nom?.toLowerCase().includes(q) ||
           p.sku?.toLowerCase().includes(q) ||
           p.vendeur_nom?.toLowerCase().includes(q);
  });

  if (loading) return <Skeleton />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Administration</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Tableau de bord Bazar Guyane</p>
        </div>
        <Link href="/catalogue" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>← Voir la boutique</Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Commandes', value: stats.total_commandes, icon: '📦', color: '#2563eb' },
            { label: 'CA total', value: `${stats.ca_total.toFixed(2)} €`, icon: '💰', color: '#16a34a' },
            { label: 'En attente', value: stats.en_attente, icon: '⏳', color: '#ca8a04' },
            { label: 'Utilisateur', value: stats.users_total, icon: '👥', color: '#7c3aed' },
            { label: 'Produits', value: stats.produits_total, icon: '🛍️', color: '#f97316' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{s.icon}</span>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👥', desc: 'Créer vendeur/client' },
          { href: '/admin/categories', label: 'Catégories', icon: '📁', desc: 'Ajouter / modifier' },
          { href: '/admin/marques', label: 'Marques', icon: '🏷️', desc: 'Avec logos' },
          { href: '/admin/promotions', label: 'Promotions', icon: '🔥', desc: 'Gérer les promos' },
          { href: '/admin/livraisons', label: 'Livraisons', icon: '🚚', desc: 'Suivi expéditions' },
        ].map(s => (
          <Link key={s.href} href={s.href} className="rounded-xl p-4 text-left hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{s.label}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
          </Link>
        ))}
      </div>

      <div className="flex rounded-xl overflow-x-auto mb-6" style={{ backgroundColor: 'var(--bg-input)', padding: '4px', gap: '4px' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
            style={{
              backgroundColor: tab === i ? 'var(--bg-card)' : 'transparent',
              color: tab === i ? 'var(--text)' : 'var(--text-muted)',
              boxShadow: tab === i ? 'var(--shadow)' : 'none',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0 : Vue d'ensemble (inchangé) */}
      {tab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>Dernières commandes</h2>
              <button onClick={() => setTab(1)} className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>Voir tout</button>
            </div>
            <div>
              {commandes.slice(0, 6).map(c => {
                const st = STATUT_CONFIG[c.statut] || {};
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-xs font-mono font-bold" style={{ color: 'var(--text)' }}>{c.reference_commande}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.client_nom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{Number(c.total).toFixed(2)} €</p>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>⚠️ Stock critique (≤ 5)</h2>
            </div>
            {produits.filter(p => p.stock <= 5 && p.actif).length === 0 ? (
              <p className="px-4 py-8 text-sm text-center" style={{ color: 'var(--text-muted)' }}>✓ Tous les stocks sont suffisants</p>
            ) : (
              produits.filter(p => p.stock <= 5 && p.actif).slice(0, 8).map(p => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-medium truncate max-w-48" style={{ color: 'var(--text)' }}>{p.nom}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: p.stock === 0 ? '#fee2e2' : '#fef9c3', color: p.stock === 0 ? '#dc2626' : '#ca8a04' }}>
                    {p.stock === 0 ? 'Rupture' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 1 : Commandes avec filtres */}
      {tab === 1 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Statut</label>
              <select
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
              >
                <option value="">Tous</option>
                {Object.entries(STATUT_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Date début</label>
              <input
                type="date"
                value={orderDateStart}
                onChange={e => setOrderDateStart(e.target.value)}
                className="h-9 px-3 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Date fin</label>
              <input
                type="date"
                value={orderDateEnd}
                onChange={e => setOrderDateEnd(e.target.value)}
                className="h-9 px-3 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
              />
            </div>
            <button
              onClick={() => { setOrderStatusFilter(''); setOrderDateStart(''); setOrderDateEnd(''); }}
              className="h-9 px-4 rounded-lg text-sm font-semibold border hover:opacity-80"
              style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              Réinitialiser
            </button>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                  {['Référence', 'Client', 'Total', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCommandes.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Aucune commande trouvée</td></tr>
                ) : (
                  filteredCommandes.map((c, i) => {
                    const st = STATUT_CONFIG[c.statut] || {};
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 !== 0 ? 'var(--bg-input)' : 'transparent' }}>
                        <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: 'var(--text)' }}>{c.reference_commande}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{c.client_nom}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.client_email}</p>
                        </td>
                        <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>{Number(c.total).toFixed(2)} €</td>
                        <td className="px-4 py-3">
                          <select value={c.statut} onChange={e => handleUpdateStatut(c.id, e.target.value)}
                            className="text-xs px-2 py-1 rounded-lg border focus:outline-none"
                            style={{ backgroundColor: st.bg, color: st.color, borderColor: st.color }}>
                            {Object.entries(STATUT_CONFIG).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3"><Link href={`/commandes/${c.id}`} className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>Détail</Link></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2 : Produits avec recherche */}
      {tab === 2 && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher par nom, SKU ou vendeur..."
                value={productSearchQuery}
                onChange={e => setProductSearchQuery(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <Link href="/vendeur/produits/nouveau" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
              + Nouveau produit
            </Link>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                  {['Produit', 'SKU', 'Vendeur', 'Prix', 'Stock', 'État', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProduits.length === 0 ? (
                  <tr><td colSpan="8" className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Aucun produit trouvé</td></tr>
                ) : (
                  filteredProduits.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 !== 0 ? 'var(--bg-input)' : 'transparent' }}>
                      <td className="px-4 py-3 font-medium max-w-48 truncate" style={{ color: 'var(--text)' }}>{p.nom}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{p.sku || '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{p.vendeur_nom}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>{Number(p.prix).toFixed(2)} €</td>
                      <td className="px-4 py-3"><span style={{ color: p.stock <= 5 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{p.stock}</span></td>
                      <td className="px-4 py-3 text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{p.etat}</td>
                      <td className="px-4 py-3">
                        {p.actif ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>Actif</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>Inactif</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.actif ? (
                            <>
                              <button onClick={() => handleEditProduit(p.id)} className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>Modifier</button>
                              <button
                                onClick={() => {
                                  if (confirm('⚠️ Supprimer définitivement ce produit ? Toutes ses données (images, avis, etc.) seront perdues. Cette action est irréversible.')) {
                                    handleDeleteProduit(p.id);
                                  }
                                }}
                                className="text-xs hover:underline"
                                style={{ color: '#dc2626' }}
                              >
                                Supprimer
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleReactiverProduit(p.id)} className="text-xs hover:underline" style={{ color: '#16a34a' }}>Activer</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3 : Coupons (inchangé) */}
      {tab === 3 && (
        <div className="space-y-5">
          <form onSubmit={handleCreateCoupon} className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="font-bold mb-4 text-sm" style={{ color: 'var(--text)' }}>Créer un coupon</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'code', label: 'Code', placeholder: 'PROMO20', type: 'text' },
                { name: 'reduction', label: 'Réduction', placeholder: '20', type: 'number' },
                { name: 'minimum_commande', label: 'Commande min', placeholder: '0', type: 'number' },
                { name: 'expiration', label: 'Expiration', placeholder: '', type: 'datetime-local' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={newCoupon[f.name]}
                    onChange={e => setNewCoupon(x => ({ ...x, [f.name]: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border text-sm focus:outline-none"
                    style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Type</label>
                <select value={newCoupon.type_reduction} onChange={e => setNewCoupon(x => ({ ...x, type_reduction: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg border text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}>
                  <option value="pourcentage">Pourcentage (%)</option>
                  <option value="montant_fixe">Montant fixe (€)</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={couponLoading}
              className="mt-4 px-6 h-9 rounded-lg font-bold text-sm text-white hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)' }}>
              {couponLoading ? 'Création...' : 'Créer le coupon'}
            </button>
          </form>

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                  {['Code', 'Type', 'Réduction', 'Min commande', 'Utilisations', 'Expiration', 'Statut'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Aucun coupon</td></tr>
                ) : (
                  coupons.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 !== 0 ? 'var(--bg-input)' : 'transparent' }}>
                      <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--primary)' }}>{c.code}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{c.type_reduction === 'pourcentage' ? '%' : '€ fixe'}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>{c.reduction}{c.type_reduction === 'pourcentage' ? '%' : ' €'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{c.minimum_commande} €</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{c.usage_actuel} / {c.usage_max || '∞'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{c.expiration ? new Date(c.expiration).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: c.actif ? '#dcfce7' : '#fee2e2', color: c.actif ? '#16a34a' : '#dc2626' }}>
                          {c.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />)}
      </div>
      <div className="h-96 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <AdminContent />
    </Suspense>
  );
}