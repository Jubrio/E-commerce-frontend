'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

const API  = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('guyagod_token')}`, 'Content-Type': 'application/json' });
const authMultipart = () => ({ Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` });

export default function MarquesAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, _hydrated } = useAuthStore();
  const [marques,  setMarques]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ nom: '', slug: '', logo: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [preview,  setPreview]  = useState('');
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const fileRef = useRef(null);

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
    fetchMarques(); // ✅ Correction : appel de fetchMarques au lieu de fetchCategories
  }, [_hydrated, isAuthenticated, isAdmin, router]);

  const fetchMarques = async () => {
    setLoading(true);
    const r    = await fetch(`${API}/api/marques`, { headers: auth() });
    const data = await r.json();
    setMarques(data.data || []);
    setLoading(false);
  };

  const handleNomChange = (val) => {
    const slug = val.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    setForm(f => ({ ...f, nom: val, slug }));
  };

  const handleLogoFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEdit = (m) => {
    setEditId(m.id);
    setForm({ nom: m.nom, slug: m.slug, logo: m.logo || '' });
    setPreview(m.logo || '');
    setLogoFile(null);
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ nom: '', slug: '', logo: '' });
    setPreview('');
    setLogoFile(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nom || !form.slug) return setError('Nom et slug requis');
    setSaving(true);
    try {
      let logoUrl = form.logo;

      if (logoFile) {
        const fd = new FormData();
        fd.append('photo', logoFile);
        const r = await fetch(`${API}/api/upload/profil`, {
          method: 'POST', headers: authMultipart(), body: fd,
        });
        const d = await r.json();
        if (d.success) logoUrl = d.data.photo_profil;
      }

      const body   = { nom: form.nom, slug: form.slug, logo: logoUrl || null };
      const url    = editId ? `${API}/api/marques/${editId}` : `${API}/api/marques`;
      const method = editId ? 'PUT' : 'POST';
      const r      = await fetch(url, { method, headers: auth(), body: JSON.stringify(body) });
      const data   = await r.json();
      if (!data.success) throw new Error(data.message);
      handleCancel();
      fetchMarques();
    } catch (err) {
      setError(err.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette marque ?')) return;
    await fetch(`${API}/api/marques/${id}`, { method: 'DELETE', headers: auth() });
    fetchMarques();
  };

  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };
  const inputClass = "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none";

  // Pendant l'hydratation, on peut afficher un loader
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
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Marques</h1>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-5 mb-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
          {editId ? 'Modifier la marque' : 'Ajouter une marque'}
        </h2>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>{error}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Nom *</label>
            <input value={form.nom} onChange={e => handleNomChange(e.target.value)} placeholder="ex: Apple" required className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Slug * (auto-généré)</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="apple" required className={inputClass} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text)' }}>Logo de la marque</label>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            >
              {preview
                ? <img src={preview} alt="Logo" className="w-full h-full object-contain p-1" />
                : <span className="text-2xl">🏷️</span>
              }
            </div>
            <div className="flex-1 space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-4 h-9 rounded-lg border text-sm font-medium hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
              >
                📁 Choisir un fichier
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Ou coller une URL :
              </p>
              <input
                value={form.logo}
                onChange={e => { setForm(f => ({ ...f, logo: e.target.value })); setPreview(e.target.value); setLogoFile(null); }}
                placeholder="https://..."
                className="w-full h-9 px-3 rounded-lg border text-xs focus:outline-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={saving}
            className="px-5 h-9 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {saving ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
          </button>
          {editId && (
            <button type="button" onClick={handleCancel}
              className="px-5 h-9 rounded-lg text-sm border hover:opacity-70"
              style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
            >Annuler</button>
          )}
        </div>
      </form>

      {/* Liste marques */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />)}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                {['Logo', 'Nom', 'Slug', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marques.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Aucune marque</td></tr>
              ) : marques.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 !== 0 ? 'var(--bg-input)' : 'transparent' }}>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-input)' }}>
                      {m.logo
                        ? <img src={m.logo} alt={m.nom} className="w-full h-full object-contain p-1" />
                        : <span className="text-lg">🏷️</span>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>{m.nom}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{m.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(m)} className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>Modifier</button>
                      <button onClick={() => handleDelete(m.id)} className="text-xs hover:underline" style={{ color: '#dc2626' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}