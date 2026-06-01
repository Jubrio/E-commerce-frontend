'use client';
// app/(shop)/admin/categories/page.jsx — NOTIFICATIONS CORRIGÉES

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

const API  = process.env.NEXT_PUBLIC_API_URL;
const auth = () => ({
  Authorization:  `Bearer ${localStorage.getItem('guyagod_token')}`,
  'Content-Type': 'application/json',
});

export default function CategoriesAdminPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, _hydrated } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [editId,     setEditId]     = useState(null);

  const emptyForm = { nom: '', slug: '', description: '', image: '', parent_id: '' };
  const [form, setForm] = useState(emptyForm);

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
    fetchCategories();
  }, [_hydrated, isAuthenticated, isAdmin]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const r    = await fetch(`${API}/api/categories`, { headers: auth() });
      const data = await r.json();
      setCategories(data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  // Notification temporaire
  const showNotification = (msg, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4000);
  };

  // Auto-slug
  const handleNomChange = (val) => {
    const slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setForm(f => ({ ...f, nom: val, slug }));
  };

  const handleEdit = (cat) => {
    setForm({
      nom:         cat.nom         || '',
      slug:        cat.slug        || '',
      description: cat.description || '',
      image:       cat.image       || '',
      parent_id:   cat.parent_id   ? String(cat.parent_id) : '',
    });
    setEditId(cat.id);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
    // Ne pas effacer les notifications ici
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.nom.trim() || !form.slug.trim())
      return setError('Nom et slug sont requis');

    setSaving(true);
    try {
      const body = {
        nom:         form.nom,
        slug:        form.slug,
        description: form.description || null,
        image:       form.image       || null,
        parent_id:   form.parent_id   ? parseInt(form.parent_id) : null,
      };

      const url    = editId
        ? `${API}/api/categories/${editId}`
        : `${API}/api/categories`;
      const method = editId ? 'PUT' : 'POST';

      const r    = await fetch(url, { method, headers: auth(), body: JSON.stringify(body) });
      const data = await r.json();

      if (!data.success) throw new Error(data.message || 'Erreur serveur');

      // Notification de succès
      showNotification(editId ? 'Catégorie modifiée avec succès' : 'Catégorie ajoutée avec succès');

      // Réinitialiser le formulaire sans effacer les notifications
      setEditId(null);
      setForm(emptyForm);
      await fetchCategories();
    } catch (err) {
      showNotification(err.message || 'Erreur lors de l\'enregistrement', true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ? Les produits associés seront déliés.')) return;
    try {
      const res = await fetch(`${API}/api/categories/${id}`, { method: 'DELETE', headers: auth() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erreur suppression');
      showNotification('Catégorie supprimée avec succès');
      await fetchCategories();
      if (editId === id) setEditId(null);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };
  const inputClass = "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none";
  const focus = {
    onFocus: e => e.target.style.borderColor = 'var(--primary)',
    onBlur:  e => e.target.style.borderColor = 'var(--border)',
  };

  const racines = categories.filter(c => !c.parent_id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm hover:underline mb-2 block" style={{ color: 'var(--primary)' }}>
        ← Admin
      </Link>
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Catégories</h1>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-5 mb-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: `2px solid ${editId ? 'var(--primary)' : 'var(--border)'}`,
        }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
          {editId ? `✏️ Modifier la catégorie #${editId}` : '+ Ajouter une catégorie'}
        </h2>

        {success && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            ✅ {success}
          </p>
        )}
        {error && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            ❌ {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Nom *</label>
            <input
              value={form.nom}
              onChange={e => handleNomChange(e.target.value)}
              placeholder="ex: Smartphones"
              required
              className={inputClass}
              style={inputStyle}
              {...focus}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
              Slug * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(auto-généré)</span>
            </label>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="smartphones"
              required
              className={inputClass}
              style={inputStyle}
              {...focus}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
              Catégorie parente
            </label>
            <select
              value={form.parent_id}
              onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
              className={inputClass}
              style={inputStyle}
            >
              <option value="">Aucune (racine)</option>
              {racines
                .filter(c => c.id !== editId)
                .map(c => (
                  <option key={c.id} value={String(c.id)}>{c.nom}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>
              Émoji / Icône
            </label>
            <input
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
              placeholder="📱 ou URL image"
              className={inputClass}
              style={inputStyle}
              {...focus}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text)' }}>Description</label>
          <input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description courte (optionnel)"
            className={inputClass}
            style={inputStyle}
            {...focus}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 h-10 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {saving ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 h-10 rounded-lg text-sm border hover:opacity-70"
              style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Liste des catégories */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="h-14 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-input)' }}>
                {['Icône', 'Nom', 'Slug', 'Parente', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Aucune catégorie — ajoutez-en une ci-dessus
                  </td>
                </tr>
              ) : (
                categories.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom:    '1px solid var(--border)',
                      backgroundColor: editId === c.id
                        ? 'var(--primary-light)'
                        : i % 2 !== 0 ? 'var(--bg-input)' : 'transparent',
                    }}
                  >
                    <td className="px-4 py-3 text-xl">{c.image || '📁'}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text)' }}>
                      {c.parent_id && (
                        <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>└</span>
                      )}
                      {c.nom}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {c.slug}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {c.parent_nom || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(c)}
                          className="text-xs font-medium hover:underline"
                          style={{ color: 'var(--primary)' }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs font-medium hover:underline"
                          style={{ color: '#dc2626' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}