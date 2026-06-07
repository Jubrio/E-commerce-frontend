'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

const API  = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('guyagod_token')}`, 'Content-Type': 'application/json' });

export default function PromotionsAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, _hydrated } = useAuthStore();
  const [promos,   setPromos]   = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const today = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({
    produit_id:  '',
    pourcentage: '',
    date_debut:  today,
    date_fin:    '',
  });

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
  }, [_hydrated, isAuthenticated, isAdmin, router]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [rp, rpr] = await Promise.all([
        fetch(`${API}/api/promotions/actives`, { headers: auth() }).then(r => r.json()),
        fetch(`${API}/api/produits?limit=200`,  { headers: auth() }).then(r => r.json()),
      ]);
      setPromos(rp.data   || []);
      setProduits(rpr.data?.rows || []);
    } catch (err) {
      console.error('loadAll error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.produit_id || !form.pourcentage || !form.date_fin)
      return setError('Produit, pourcentage et date de fin requis');
    if (parseFloat(form.pourcentage) <= 0 || parseFloat(form.pourcentage) > 100)
      return setError('Le pourcentage doit être entre 1 et 100');
    if (new Date(form.date_fin) <= new Date(form.date_debut))
      return setError('La date de fin doit être après la date de début');

    setSaving(true);
    try {
      const r    = await fetch(`${API}/api/promotions`, {
        method: 'POST', headers: auth(), body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!data.success) throw new Error(data.message);
      setForm({ produit_id: '', pourcentage: '', date_debut: today, date_fin: '' });
      loadAll();
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDesactiver = async (id) => {
    await fetch(`${API}/api/promotions/${id}`, {
      method: 'PUT', headers: auth(),
      body: JSON.stringify({ actif: false, pourcentage: 0, date_debut: today, date_fin: today }),
    });
    loadAll();
  };

  const handleSupprimer = async (id) => {
    if (!confirm('Supprimer cette promotion ?')) return;
    await fetch(`${API}/api/promotions/${id}`, { method: 'DELETE', headers: auth() });
    loadAll();
  };

  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };
  const inputClass = "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none";

  if (!_hydrated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 w-32 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="h-96 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm hover:underline mb-2 block" style={{ color: 'var(--primary)' }}>← Admin</Link>
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Promotions</h1>

      {/* Formulaire création */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-5 mb-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Créer une promotion</h2>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>{error}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Produit *</label>
            <select
              value={form.produit_id}
              onChange={e => setForm(f => ({ ...f, produit_id: e.target.value }))}
              required className={inputClass} style={inputStyle}
            >
              <option value="">Sélectionner un produit...</option>
              {produits.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nom} — {Number(p.prix).toFixed(2)} €
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Réduction (%) *</label>
            <input
              type="number" min="1" max="100" step="0.5"
              value={form.pourcentage}
              onChange={e => setForm(f => ({ ...f, pourcentage: e.target.value }))}
              placeholder="ex: 15" required className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Date de début *</label>
            <input
              type="datetime-local"
              value={form.date_debut}
              onChange={e => setForm(f => ({ ...f, date_debut: e.target.value }))}
              required className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Date de fin *</label>
            <input
              type="datetime-local"
              value={form.date_fin}
              onChange={e => setForm(f => ({ ...f, date_fin: e.target.value }))}
              required className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Aperçu réduction */}
        {form.produit_id && form.pourcentage && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            {(() => {
              const p = produits.find(x => String(x.id) === String(form.produit_id));
              if (!p) return null;
              const prix_reduit = (p.prix * (1 - form.pourcentage / 100)).toFixed(2);
              return `✓ ${p.nom} : ${Number(p.prix).toFixed(2)} € → ${prix_reduit} € (-${form.pourcentage}%)`;
            })()}
          </div>
        )}

        <button type="submit" disabled={saving}
          className="px-6 h-10 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {saving ? 'Création...' : '+ Créer la promotion'}
        </button>
      </form>

      {/* Liste promotions actives */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Promotions actives</h2>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />)}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                {['Produit', 'Prix original', 'Réduction', 'Prix promo', 'Période', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Aucune promotion active</td></tr>
              ) : promos.map((p, i) => {
                const prixReduit = (p.prix * (1 - p.pourcentage / 100)).toFixed(2);
                const now        = new Date();
                const debut      = new Date(p.date_debut);
                const fin        = new Date(p.date_fin);
                const encours    = now >= debut && now <= fin;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 !== 0 ? 'var(--bg-input)' : 'transparent' }}>
                    <td className="px-4 py-3 font-medium max-w-40 truncate" style={{ color: 'var(--text)' }}>{p.produit_nom}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      {Number(p.prix).toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: 'var(--primary)' }}>
                        -{p.pourcentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#16a34a' }}>{prixReduit} €</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <div>
                        {new Date(p.date_debut).toLocaleDateString('fr-FR')}
                        {' → '}
                        {new Date(p.date_fin).toLocaleDateString('fr-FR')}
                      </div>
                      <span className={`font-semibold ${encours ? 'text-green-600' : 'text-orange-500'}`}>
                        {encours ? '● En cours' : debut > now ? '○ À venir' : '○ Terminée'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleDesactiver(p.id)} className="text-xs hover:underline" style={{ color: '#ca8a04' }}>Désactiver</button>
                        <button onClick={() => handleSupprimer(p.id)} className="text-xs hover:underline" style={{ color: '#dc2626' }}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}