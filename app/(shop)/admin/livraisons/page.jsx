'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

const API  = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('guyagod_token')}`, 'Content-Type': 'application/json' });

const STATUT_LIV = {
  preparation:  { label: 'En préparation', color: '#ca8a04', bg: '#fef9c3' },
  expedie:      { label: 'Expédiée',       color: '#2563eb', bg: '#dbeafe' },
  en_transit:   { label: 'En transit',     color: '#7c3aed', bg: '#ede9fe' },
  livre:        { label: 'Livrée',         color: '#16a34a', bg: '#dcfce7' },
  echec:        { label: 'Échec',          color: '#dc2626', bg: '#fee2e2' },
};

export default function LivraisonsAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, _hydrated } = useAuthStore();

  const [commandes,  setCommandes]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);  
  const [modalOpen,  setModalOpen]  = useState(false);
  const [form,       setForm]       = useState({ transporteur: '', numero_suivi: '', date_livraison_estimee: '' });
  const [saving,     setSaving]     = useState(false);
  const [filterSt,   setFilterSt]   = useState('');

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
    fetchCommandes(); 
  }, [_hydrated, isAuthenticated, isAdmin, router]);

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const r    = await fetch(`${API}/api/commandes/all?limit=100`, { headers: auth() });
      const data = await r.json();
      const cmds = (data.data || []).filter(c => ['payee','expediee','livree'].includes(c.statut));
      const enriched = await Promise.all(
        cmds.map(async (c) => {
          try {
            const rl   = await fetch(`${API}/api/livraisons/commande/${c.id}`, { headers: auth() });
            const dl   = await rl.json();
            return { ...c, livraison: dl.data };
          } catch { return { ...c, livraison: null }; }
        })
      );
      setCommandes(enriched);
    } catch {}
    finally { setLoading(false); }
  };

  const openModal = (commande) => {
    setSelected(commande);
    setForm({
      transporteur:           commande.livraison?.transporteur           || '',
      numero_suivi:           commande.livraison?.numero_suivi           || '',
      date_livraison_estimee: commande.livraison?.date_livraison_estimee || '',
    });
    setModalOpen(true);
  };

  const handleExpedier = async () => {
    if (!form.transporteur || !form.numero_suivi) return alert('Transporteur et numéro de suivi requis');
    setSaving(true);
    try {
      await fetch(`${API}/api/livraisons/commande/${selected.id}/expedier`, {
        method: 'PUT', headers: auth(), body: JSON.stringify(form),
      });
      setModalOpen(false);
      fetchCommandes();
    } catch {}
    finally { setSaving(false); }
  };

  const handleLivree = async (commandeId) => {
    if (!confirm('Marquer cette commande comme livrée ?')) return;
    await fetch(`${API}/api/livraisons/commande/${commandeId}/livree`, { method: 'PUT', headers: auth() });
    fetchCommandes();
  };

  const filtered = filterSt
    ? commandes.filter(c => c.livraison?.statut === filterSt || (!c.livraison && filterSt === 'preparation'))
    : commandes;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Link href="/admin" className="text-sm hover:underline mb-1 block" style={{ color: 'var(--primary)' }}>← Admin</Link>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Gestion des livraisons</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterSt}
            onChange={e => setFilterSt(e.target.value)}
            className="h-9 px-3 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text)', borderColor: 'var(--border)' }}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_LIV).map(([v, s]) => (
              <option key={v} value={v}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(STATUT_LIV).map(([key, s]) => {
          const count = commandes.filter(c =>
            c.livraison?.statut === key || (!c.livraison && key === 'preparation')
          ).length;
          return (
            <button
              key={key}
              onClick={() => setFilterSt(filterSt === key ? '' : key)}
              className="rounded-xl p-3 text-left transition-all hover:opacity-80"
              style={{
                backgroundColor: filterSt === key ? s.bg : 'var(--bg-card)',
                border:          `1px solid ${filterSt === key ? s.color : 'var(--border)'}`,
              }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Tableau */}
      {loading ? (
        <Skeleton />
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                {['Commande', 'Client', 'Total', 'Statut livraison', 'Transporteur / Suivi', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Aucune commande</td></tr>
              ) : filtered.map((c, i) => {
                const liv = c.livraison;
                const st  = STATUT_LIV[liv?.statut || 'preparation'];
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 !== 0 ? 'var(--bg-input)' : 'transparent' }}>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-bold" style={{ color: 'var(--text)' }}>{c.reference_commande}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{c.client_nom}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.client_email}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-sm" style={{ color: 'var(--text)' }}>
                      {Number(c.total).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {liv?.transporteur ? (
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{liv.transporteur}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--primary)' }}>{liv.numero_suivi}</p>
                          {liv.date_livraison_estimee && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Estimée : {new Date(liv.date_livraison_estimee).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {liv?.statut !== 'livre' && (
                          <button
                            onClick={() => openModal(c)}
                            className="text-xs px-2.5 py-1.5 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: 'var(--primary)' }}
                          >
                            {liv?.statut === 'expedie' || liv?.statut === 'en_transit' ? 'Modifier suivi' : 'Marquer expédiée'}
                          </button>
                        )}
                        {(liv?.statut === 'expedie' || liv?.statut === 'en_transit') && (
                          <button
                            onClick={() => handleLivree(c.id)}
                            className="text-xs px-2.5 py-1.5 rounded-lg font-semibold hover:opacity-90"
                            style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
                          >
                            ✓ Marquer livrée
                          </button>
                        )}
                        <Link
                          href={`/commandes/${c.id}`}
                          className="text-xs hover:underline text-center"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Voir détail
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal expédition ── */}
      {modalOpen && selected && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setModalOpen(false)} />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6 shadow-lg-theme"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-lg font-black mb-1" style={{ color: 'var(--text)' }}>
                Informations d'expédition
              </h2>
              <p className="text-xs mb-5 font-mono" style={{ color: 'var(--text-muted)' }}>
                {selected.reference_commande}
              </p>

              <div className="space-y-4">
                {[
                  { name: 'transporteur',           label: 'Transporteur *',        placeholder: 'ex: Colissimo, Chronopost' },
                  { name: 'numero_suivi',            label: 'Numéro de suivi *',     placeholder: 'ex: 6Q00100000000' },
                  { name: 'date_livraison_estimee',  label: 'Livraison estimée',     placeholder: '', type: 'date' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={e => setForm(x => ({ ...x, [f.name]: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none"
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 h-11 rounded-xl border font-semibold text-sm hover:opacity-70"
                  style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleExpedier}
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl font-bold text-sm text-white hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {saving ? 'Enregistrement...' : '🚚 Confirmer l\'expédition'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const Skeleton = () => (
  <div className="rounded-xl overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
    {[1,2,3,4,5].map(i => <div key={i} className="h-16 border-b" style={{ borderColor: 'var(--border)' }} />)}
  </div>
);
