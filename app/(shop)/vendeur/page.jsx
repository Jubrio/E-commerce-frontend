'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';
import { produitsAPI, commandesAPI } from '@/lib/api';

const TABS = ['Vue d\'ensemble', 'Mes produits', 'Commissions'];

export default function VendeurPage() {
  const router = useRouter();
  const { user, isAuthenticated, isVendeur, isAdmin, _hydrated } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [produits, setProduits] = useState([]);
  const [stats, setStats] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isVendeur() && !isAdmin()) {
      router.push('/');
      return;
    }
    loadData();
  }, [_hydrated, isAuthenticated, isVendeur, isAdmin, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rp, rc] = await Promise.all([
        produitsAPI.getAll({ vendeur_id: user?.id, limit: 100 }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/commissions/mes-commissions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` },
        }).then(r => r.json()),
      ]);
      setProduits(rp.data?.rows || []);
      setCommissions(rc.data?.rows || []);
      setStats({
        total_produits: rp.data?.total || 0,
        total_ventes: rc.data?.total?.total_ventes || 0,
        commissions_en_attente: rc.data?.total?.commissions_en_attente || 0,
        commissions_versees: rc.data?.total?.commissions_versees || 0,
      });
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (id, actif) => {
    const produit = produits.find(p => p.id === id);
    if (!produit) return;
    await produitsAPI.update(id, { ...produit, actif: !actif });
    setProduits(prev => prev.map(p => (p.id === id ? { ...p, actif: !actif } : p)));
  };

  const handleDeleteProduit = async (id) => {
    if (!confirm('Désactiver ce produit ?')) return;
    await produitsAPI.remove(id);
    setProduits(prev => prev.filter(p => p.id !== id));
  };

  if (!_hydrated) return <Skeleton />;
  if (loading) return <Skeleton />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>
            Espace Vendeur
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Bienvenue, {user?.nom}
          </p>
        </div>
        <Link
          href="/vendeur/produits/nouveau"
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          + Ajouter un produit
        </Link>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Produits',           value: stats.total_produits,              icon: '📦', color: '#2563eb' },
            { label: 'Total ventes',        value: `${Number(stats.total_ventes || 0).toFixed(2)} €`, icon: '💰', color: '#16a34a' },
            { label: 'Commissions dues',   value: `${Number(stats.commissions_en_attente || 0).toFixed(2)} €`, icon: '⏳', color: '#ca8a04' },
            { label: 'Commissions versées',value: `${Number(stats.commissions_versees || 0).toFixed(2)} €`, icon: '✅', color: '#7c3aed' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{s.icon}</span>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex rounded-xl overflow-hidden mb-6"
        style={{ backgroundColor: 'var(--bg-input)', padding: '4px', gap: '4px' }}
      >
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              backgroundColor: tab === i ? 'var(--bg-card)' : 'transparent',
              color:           tab === i ? 'var(--text)'    : 'var(--text-muted)',
              boxShadow:       tab === i ? 'var(--shadow)'  : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 0 : Vue d'ensemble ── */}
      {tab === 0 && (
        <div className="space-y-4">
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h2 className="font-bold mb-4" style={{ color: 'var(--text)' }}>
              Derniers produits
            </h2>
            {produits.slice(0, 5).length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Vous n'avez pas encore de produits.{' '}
                <Link href="/vendeur/produits/nouveau" style={{ color: 'var(--primary)' }}>
                  Ajouter votre premier produit
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {produits.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-input)' }}
                    >
                      {p.image_principale
                        ? <img src={p.image_principale} alt={p.nom} className="w-full h-full object-contain p-1" />
                        : <span>📦</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.nom}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Stock : {p.stock}</p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text)' }}>
                      {Number(p.prix).toFixed(2)} €
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      style={{
                        backgroundColor: p.actif ? '#dcfce7' : '#fee2e2',
                        color:           p.actif ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {p.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertes stock bas */}
          {produits.filter(p => p.stock <= 5 && p.actif).length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{ backgroundColor: '#fef9c3', border: '1px solid #fde68a' }}
            >
              <h3 className="text-sm font-bold mb-2" style={{ color: '#92400e' }}>
                ⚠️ Stock bas
              </h3>
              <div className="space-y-1">
                {produits.filter(p => p.stock <= 5 && p.actif).map(p => (
                  <p key={p.id} className="text-xs" style={{ color: '#92400e' }}>
                    {p.nom} — <strong>{p.stock} restant{p.stock > 1 ? 's' : ''}</strong>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 1 : Mes produits ── */}
      {tab === 1 && (
        <div>
          {produits.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p className="text-4xl mb-3">📦</p>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Aucun produit
              </p>
              <Link
                href="/vendeur/produits/nouveau"
                className="px-5 py-2 rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Ajouter un produit
              </Link>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                    {['Produit', 'Prix', 'Stock', 'État', 'Statut', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {produits.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-input)',
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: 'var(--bg-input)' }}
                          >
                            {p.image_principale
                              ? <img src={p.image_principale} alt="" className="w-full h-full object-contain" />
                              : <span className="text-xs">📦</span>
                            }
                          </div>
                          <span className="font-medium truncate max-w-32" style={{ color: 'var(--text)' }}>
                            {p.nom}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--text)' }}>
                        {Number(p.prix).toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-semibold"
                          style={{ color: p.stock <= 5 ? '#dc2626' : p.stock <= 10 ? '#ca8a04' : '#16a34a' }}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                          {p.etat}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActif(p.id, p.actif)}
                          className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{
                            backgroundColor: p.actif ? '#dcfce7' : '#fee2e2',
                            color:           p.actif ? '#16a34a' : '#dc2626',
                          }}
                        >
                          {p.actif ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/vendeur/produits/${p.id}/modifier`}
                            className="text-xs hover:underline"
                            style={{ color: 'var(--primary)' }}
                          >
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDeleteProduit(p.id)}
                            className="text-xs hover:underline"
                            style={{ color: '#dc2626' }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2 : Commissions ── */}
      {tab === 2 && (
        <div>
          {commissions.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucune commission pour le moment.
            </p>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                    {['Commande', 'Vente', 'Taux', 'Commission', 'Statut'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-input)',
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text)' }}>
                        {c.reference_commande}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>
                        {Number(c.montant_vente).toFixed(2)} €
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                        {c.taux}%
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: '#dc2626' }}>
                        -{Number(c.montant_commission).toFixed(2)} €
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            backgroundColor: c.statut === 'versee' ? '#dcfce7' : '#fef9c3',
                            color:           c.statut === 'versee' ? '#16a34a' : '#ca8a04',
                          }}
                        >
                          {c.statut === 'versee' ? 'Versée' : 'En attente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />)}
      </div>
      <div className="h-64 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
    </div>
  );
}
