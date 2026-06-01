'use client';
// app/(shop)/admin/utilisateurs/page.jsx — VERSION CORRIGÉE
// Fix : data.data.rows → data.data (le backend retourne { data: { rows, total } })
// Fix : chemin correct pour lire les utilisateurs

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

const API  = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({
  Authorization:  `Bearer ${localStorage.getItem('guyagod_token')}`,
  'Content-Type': 'application/json',
});

export default function UtilisateursAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, _hydrated ,user: moi } = useAuthStore();

  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showForm,   setShowForm]   = useState(false);

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    mot_de_passe: '', role_id: '3',
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
  fetchUsers(); 
}, [_hydrated, isAuthenticated, isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r    = await fetch(`${API}/api/users?limit=200`, { headers: auth() });
      const data = await r.json();

      // FIX : la réponse est { success, data: { rows, total } }
      const rows = data.data?.rows || data.data || [];
      const tot  = data.data?.total || rows.length;

      setUsers(Array.isArray(rows) ? rows : []);
      setTotal(tot);
    } catch (err) {
      console.error('fetchUsers error:', err);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.nom || !form.email || !form.mot_de_passe)
      return setError('Nom, email et mot de passe requis');
    if (form.mot_de_passe.length < 8)
      return setError('Mot de passe minimum 8 caractères');
    setSaving(true);
    try {
      const r    = await fetch(`${API}/api/users/creer`, {
        method: 'POST', headers: auth(), body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!data.success) throw new Error(data.message);
      setSuccess(`Compte ${form.role_id === '2' ? 'vendeur' : 'client'} créé pour ${form.email}`);
      setForm({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', role_id: '3' });
      setShowForm(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id, actif) => {
    const route = actif ? 'desactiver' : 'reactiver';
    try {
      await fetch(`${API}/api/users/${id}/${route}`, { method: 'PUT', headers: auth() });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, actif: !actif } : u));
    } catch {}
  };

  const ROLES = {
    admin:   { label: 'Admin',   color: '#7c3aed', bg: '#ede9fe' },
    vendeur: { label: 'Vendeur', color: '#2563eb', bg: '#dbeafe' },
    client:  { label: 'Client',  color: '#16a34a', bg: '#dcfce7' },
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole   = !filterRole || u.nom_role === filterRole;
    return matchSearch && matchRole;
  });

  const inputClass = "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none";
  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };
  const focus = {
    onFocus: e => e.target.style.borderColor = 'var(--primary)',
    onBlur:  e => e.target.style.borderColor = 'var(--border)',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm hover:underline mb-2 block" style={{ color: 'var(--primary)' }}>
        ← Admin
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>
          Utilisateurs ({total})
        </h1>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {showForm ? '✕ Annuler' : '+ Créer un compte'}
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="text-sm px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
          ✓ {success}
        </div>
      )}

      {/* ── Formulaire création ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-5 mb-6 space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--primary)' }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Créer un compte</h2>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              {[
                { val: '3', label: '👤 Client' },
                { val: '2', label: '🏪 Vendeur' },
              ].map(r => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role_id: r.val }))}
                  className="px-4 py-1.5 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: form.role_id === r.val ? 'var(--primary)' : 'var(--bg-input)',
                    color:           form.role_id === r.val ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Nom *</label>
              <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Dupont" required className={inputClass} style={inputStyle} {...focus} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Prénom</label>
              <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                placeholder="Jean" className={inputClass} style={inputStyle} {...focus} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jean@email.com" required className={inputClass} style={inputStyle} {...focus} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Téléphone</label>
              <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+594 694 00 00 00" className={inputClass} style={inputStyle} {...focus} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
              Mot de passe * (min. 8 caractères)
            </label>
            <input type="password" value={form.mot_de_passe}
              onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
              placeholder="••••••••" required className={inputClass} style={inputStyle} {...focus} />
          </div>

          <div className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            ℹ️ Compte {form.role_id === '2' ? 'vendeur' : 'client'} — communiquez les identifiants à l'utilisateur.
          </div>

          <button type="submit" disabled={saving}
            className="w-full h-11 rounded-xl font-bold text-sm text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {saving ? 'Création...' : `Créer le compte ${form.role_id === '2' ? 'vendeur' : 'client'}`}
          </button>
        </form>
      )}

      {/* Filtres */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="flex-1 h-9 px-3 rounded-lg border text-sm focus:outline-none min-w-48"
          style={inputStyle}
          {...focus}
        />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="h-9 px-3 rounded-lg border text-sm focus:outline-none" style={inputStyle}
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="vendeur">Vendeur</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Admins',   count: users.filter(u => u.nom_role === 'admin').length,   color: '#7c3aed' },
          { label: 'Vendeurs', count: users.filter(u => u.nom_role === 'vendeur').length, color: '#2563eb' },
          { label: 'Clients',  count: users.filter(u => u.nom_role === 'client').length,  color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.count}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-14 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                {['Utilisateur', 'Email', 'Tél.', 'Rôle', 'Statut', 'Inscrit le', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {users.length === 0 ? 'Aucun utilisateur trouvé' : 'Aucun résultat pour cette recherche'}
                  </td>
                </tr>
              ) : filtered.map((u, i) => {
                const r = ROLES[u.nom_role] || ROLES.client;
                return (
                  <tr key={u.id} style={{
                    borderBottom:    '1px solid var(--border)',
                    backgroundColor: i % 2 !== 0 ? 'var(--bg-input)' : 'transparent',
                  }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: r.color }}
                        >
                          {u.photo_profil
                            ? <img src={u.photo_profil} alt="" className="w-full h-full object-cover" />
                            : u.nom?.[0]?.toUpperCase()
                          }
                        </div>
                        <span className="font-medium text-xs truncate max-w-28" style={{ color: 'var(--text)' }}>
                          {u.nom} {u.prenom}
                          {u.id === moi?.id && (
                            <span className="ml-1" style={{ color: 'var(--text-muted)' }}>(vous)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{u.telephone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: r.bg, color: r.color }}
                      >{r.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: u.actif ? '#dcfce7' : '#fee2e2',
                          color:           u.actif ? '#16a34a' : '#dc2626',
                        }}
                      >{u.actif ? 'Actif' : 'Inactif'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {u.nom_role !== 'admin' && u.id !== moi?.id ? (
                        <button
                          onClick={() => handleToggle(u.id, u.actif)}
                          className="text-xs font-medium hover:underline"
                          style={{ color: u.actif ? '#dc2626' : '#16a34a' }}
                        >
                          {u.actif ? 'Désactiver' : 'Réactiver'}
                        </button>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
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
