'use client';
// app/(shop)/vendeur/produits/nouveau/page.jsx
// Génération automatique du SKU (backend). Redirection admin → admin avec onglet Produits

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { produitsAPI, categoriesAPI, marquesAPI } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function NouveauProduitPage() {
  const router = useRouter();
  const { isAuthenticated, isVendeur, isAdmin, _hydrated } = useAuthStore();

  const [categories, setCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specs, setSpecs] = useState([{ cle: '', valeur: '' }]);
  const [fichiers, setFichiers] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadPct, setUploadPct] = useState(0);
  const inputRef = useRef(null);

  const [form, setForm] = useState({
    nom: '', description: '', prix: '', stock: '',
    etat: 'neuf', category_id: '', marque_id: '',
  });

  useEffect(() => {
    if (!_hydrated) return;
    if (!isAuthenticated || (!isVendeur() && !isAdmin())) {
      router.push('/');
      return;
    }
    categoriesAPI.getAll().then(r => setCategories(r.data)).catch(() => {});
    marquesAPI.getAll().then(r => setMarques(r.data)).catch(() => {});
  }, [_hydrated, isAuthenticated, isVendeur, isAdmin, router]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSpecChange = (i, key, val) =>
    setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [key]: val } : sp));
  const addSpec = () => setSpecs(s => [...s, { cle: '', valeur: '' }]);
  const removeSpec = (i) => setSpecs(s => s.filter((_, idx) => idx !== i));

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFichiers(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (i) => {
    setFichiers(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nom || !form.prix) return setError('Nom et prix sont requis');

    setLoading(true);
    try {
      setUploadPct(10);
      const payload = {
        ...form,
        prix: parseFloat(form.prix),
        stock: parseInt(form.stock) || 0,
        category_id: form.category_id || null,
        marque_id: form.marque_id || null,
        specifications: specs.filter(s => s.cle && s.valeur),
      };
      const res = await produitsAPI.create(payload);
      const produit_id = res.data.id;
      setUploadPct(40);

      if (fichiers.length > 0) {
        const formData = new FormData();
        fichiers.forEach(f => formData.append('images', f));
        formData.append('est_principale', 'true');
        await fetch(`${API}/api/upload/produit/${produit_id}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` },
          body: formData,
        });
      }
      setUploadPct(100);
      // Redirection selon le rôle
      if (isAdmin()) {
        router.push('/admin?tab=2');   // onglet Produits (index 2)
      } else {
        router.push(`/vendeur?created=${produit_id}`);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
      setUploadPct(0);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none transition-colors";
  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' };
  const focus = {
    onFocus: e => e.target.style.borderColor = 'var(--primary)',
    onBlur: e => e.target.style.borderColor = 'var(--border)',
  };

  if (!_hydrated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="h-96 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="text-sm mb-6 hover:underline" style={{ color: 'var(--primary)' }}>
        ← Retour
      </button>
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Ajouter un produit</h1>

      {error && (
        <div className="text-sm px-4 py-3 rounded-xl mb-4" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Images du produit">
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Sélectionnez jusqu'à 5 images. Elles seront uploadées automatiquement après la création du produit.
          </p>
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-input)' }}
          >
            <span className="text-2xl mb-1">📷</span>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Cliquer pour sélectionner des images</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />

          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-1 left-1 text-xs px-1 py-0.5 rounded font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>★</div>
                  )}
                  <button type="button" onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {loading && uploadPct > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>{uploadPct < 40 ? 'Création du produit...' : uploadPct < 100 ? 'Upload des images...' : 'Terminé !'}</span>
                <span>{uploadPct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${uploadPct}%`, backgroundColor: 'var(--primary)' }} />
              </div>
            </div>
          )}
        </Section>

        <Section title="Informations générales">
          <div><Label>Nom du produit *</Label><input name="nom" value={form.nom} onChange={handleChange} required placeholder="ex: Samsung Galaxy S24" className={inputClass} style={inputStyle} {...focus} /></div>
          <div><Label>Description</Label><textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Décrivez votre produit..." rows={4} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none" style={inputStyle} {...focus} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Prix (€) *</Label><input type="number" step="0.01" min="0" name="prix" value={form.prix} onChange={handleChange} required placeholder="0.00" className={inputClass} style={inputStyle} {...focus} /></div>
            <div><Label>Stock</Label><input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} placeholder="0" className={inputClass} style={inputStyle} {...focus} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>État</Label><select name="etat" value={form.etat} onChange={handleChange} className={inputClass} style={inputStyle}><option value="neuf">Neuf</option><option value="occasion">Occasion</option><option value="reconditionne">Reconditionné</option></select></div>
          </div>
        </Section>

        <Section title="Classification">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Catégorie</Label><select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass} style={inputStyle}><option value="">Choisir...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
            <div><Label>Marque</Label><select name="marque_id" value={form.marque_id} onChange={handleChange} className={inputClass} style={inputStyle}><option value="">Choisir...</option>{marques.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          </div>
        </Section>

        <Section title="Caractéristiques techniques">
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input placeholder="Clé (ex: RAM)" value={s.cle} onChange={e => handleSpecChange(i, 'cle', e.target.value)} className="flex-1 h-9 px-3 rounded-lg border text-sm focus:outline-none" style={inputStyle} {...focus} />
                <input placeholder="Valeur (ex: 8 Go)" value={s.valeur} onChange={e => handleSpecChange(i, 'valeur', e.target.value)} className="flex-1 h-9 px-3 rounded-lg border text-sm focus:outline-none" style={inputStyle} {...focus} />
                {specs.length > 1 && <button type="button" onClick={() => removeSpec(i)} className="w-9 h-9 rounded-lg text-sm flex items-center justify-center hover:opacity-70" style={{ color: '#dc2626', backgroundColor: '#fee2e2', border: '1px solid #fecaca' }}>✕</button>}
              </div>
            ))}
          </div>
          <button type="button" onClick={addSpec} className="text-sm font-medium hover:underline mt-1" style={{ color: 'var(--primary)' }}>+ Ajouter une caractéristique</button>
        </Section>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()} className="px-6 h-12 rounded-xl font-semibold border text-sm hover:opacity-70" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>Annuler</button>
          <button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl font-bold text-white text-sm hover:opacity-90 disabled:opacity-60 transition-opacity" style={{ backgroundColor: 'var(--primary)' }}>{loading ? (fichiers.length > 0 ? 'Création + upload...' : 'Création...') : 'Créer le produit'}</button>
        </div>
      </form>
    </div>
  );
}

const Label = ({ children }) => <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{children}</label>;
const Section = ({ title, children }) => (
  <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
    <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
    {children}
  </div>
);