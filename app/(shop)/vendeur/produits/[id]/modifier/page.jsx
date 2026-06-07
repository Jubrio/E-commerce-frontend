'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useAuthStore  from '@/store/useAuthStore';
import { produitsAPI, categoriesAPI, marquesAPI } from '@/lib/api';
import ImageUploader from '@/components/upload/ImageUploader';



export default function ModifierProduitPage() {
  const { id }    = useParams();
  const router    = useRouter();
  const { isAuthenticated, isVendeur, isAdmin, user, _hydrated } = useAuthStore(); // ← AJOUT _hydrated

  const [categories, setCategories] = useState([]);
  const [marques,    setMarques]    = useState([]);
  const [images,     setImages]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [specs,      setSpecs]      = useState([{ cle: '', valeur: '' }]);

  const [form, setForm] = useState({
    nom: '', description: '', prix: '', stock: '', sku: '',
    etat: 'neuf', category_id: '', marque_id: '', actif: true,
  });

  useEffect(() => {
    if (!_hydrated) return;

    if (!isAuthenticated || (!isVendeur() && !isAdmin())) {
      router.push('/');
      return;
    }

    Promise.all([
      produitsAPI.getOne(id),
      categoriesAPI.getAll(),
      marquesAPI.getAll(),
    ]).then(([rp, rc, rm]) => {
      const p = rp.data;
      if (p.vendeur_id !== user?.id && !isAdmin()) {
        router.push('/vendeur');
        return;
      }
      setForm({
        nom:         p.nom         || '',
        description: p.description || '',
        prix:        p.prix        || '',
        stock:       p.stock       || '',
        sku:         p.sku         || '',
        etat:        p.etat        || 'neuf',
        category_id: p.category_id || '',
        marque_id:   p.marque_id   || '',
        actif:       p.actif ?? true,
      });
      setSpecs(p.specifications?.length
        ? p.specifications
        : [{ cle: '', valeur: '' }]
      );
      setImages(p.images || []);
      setCategories(rc.data);
      setMarques(rm.data);
    }).catch(() => router.push('/vendeur'))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, isVendeur, isAdmin, user, router, _hydrated]);

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
  };

  const handleSpecChange = (i, key, val) =>
    setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [key]: val } : sp));

  const addSpec    = () => setSpecs(s => [...s, { cle: '', valeur: '' }]);
  const removeSpec = (i) => setSpecs(s => s.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await produitsAPI.update(id, {
        ...form,
        prix:           parseFloat(form.prix),
        stock:          parseInt(form.stock) || 0,
        category_id:    form.category_id || null,
        marque_id:      form.marque_id   || null,
        specifications: specs.filter(s => s.cle && s.valeur),
      });
      setSuccess('Produit mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally { setSaving(false); }
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none transition-colors";
  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };
  const focusProps = {
    onFocus: e => e.target.style.borderColor = 'var(--primary)',
    onBlur:  e => e.target.style.borderColor = 'var(--border)',
  };

  // Pendant l'hydratation, afficher un squelette
  if (!_hydrated) return <Skeleton />;
  if (loading) return <Skeleton />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="text-sm mb-6 hover:underline" style={{ color: 'var(--primary)' }}>
        ← Retour
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Modifier le produit</h1>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Actif</span>
          <div
            onClick={() => setForm(f => ({ ...f, actif: !f.actif }))}
            className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
            style={{ backgroundColor: form.actif ? 'var(--primary)' : 'var(--border)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              style={{ transform: form.actif ? 'translateX(20px)' : 'translateX(2px)' }}
            />
          </div>
        </label>
      </div>

      {/* Messages */}
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
          ✓ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Images du produit">
          <ImageUploader
            produitId={id}
            images={images}
            onImagesChange={setImages}
          />
        </Section>

        <Section title="Informations générales">
          <div>
            <Label>Nom du produit *</Label>
            <input name="nom" value={form.nom} onChange={handleChange} required
              className={inputClass} style={inputStyle} {...focusProps} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              name="description" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none"
              style={inputStyle} {...focusProps}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Prix (€) *</Label>
              <input type="number" step="0.01" min="0" name="prix" value={form.prix} onChange={handleChange} required
                className={inputClass} style={inputStyle} {...focusProps} />
            </div>
            <div>
              <Label>Stock</Label>
              <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange}
                className={inputClass} style={inputStyle} {...focusProps} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>SKU</Label>
                <input name="sku" value={form.sku} readOnly disabled className={`${inputClass} bg-gray-100 cursor-not-allowed`} style={inputStyle} />
            </div>
            <div>
              <Label>État</Label>
              <select name="etat" value={form.etat} onChange={handleChange} className={inputClass} style={inputStyle}>
                <option value="neuf">Neuf</option>
                <option value="occasion">Occasion</option>
                <option value="reconditionne">Reconditionné</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Classification">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Catégorie</Label>
              <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass} style={inputStyle}>
                <option value="">Aucune</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <Label>Marque</Label>
              <select name="marque_id" value={form.marque_id} onChange={handleChange} className={inputClass} style={inputStyle}>
                <option value="">Aucune</option>
                {marques.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section title="Caractéristiques techniques">
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  placeholder="Clé (ex: RAM)"
                  value={s.cle}
                  onChange={e => handleSpecChange(i, 'cle', e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border text-sm focus:outline-none"
                  style={inputStyle} {...focusProps}
                />
                <input
                  placeholder="Valeur (ex: 8 Go)"
                  value={s.valeur}
                  onChange={e => handleSpecChange(i, 'valeur', e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border text-sm focus:outline-none"
                  style={inputStyle} {...focusProps}
                />
                {specs.length > 1 && (
                  <button type="button" onClick={() => removeSpec(i)}
                    className="w-9 h-9 rounded-lg text-sm flex items-center justify-center hover:opacity-70"
                    style={{ color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}
                  >✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addSpec} className="text-sm font-medium hover:underline mt-1" style={{ color: 'var(--primary)' }}>
            + Ajouter une caractéristique
          </button>
        </Section>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-6 h-12 rounded-xl font-semibold border text-sm hover:opacity-70"
            style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
          >
            Annuler
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 h-12 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}

const Label    = ({ children }) => <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{children}</label>;
const Section  = ({ title, children }) => (
  <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
    <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
    {children}
  </div>
);
const Skeleton = () => (
  <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 animate-pulse">
    <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
    {[1,2,3].map(i => <div key={i} className="h-40 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />)}
  </div>
);