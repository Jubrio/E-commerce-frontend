'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import useFavorisStore from '@/store/useFavorisStore';
import { produitsAPI, avisAPI } from '@/lib/api';

export default function ProduitPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated, user, _hydrated } = useAuthStore(); // ← ajout _hydrated
  const { isFavori, toggleFavori } = useFavorisStore();

  const [produit, setProduit] = useState(null);
  const [avis, setAvis] = useState([]);
  const [imgActive, setImgActive] = useState(0);
  const [quantite, setQuantite] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState('description');

  const liked = isAuthenticated && _hydrated ? isFavori(parseInt(id)) : false;

  useEffect(() => {
    async function load() {
      try {
        const [rp, ra] = await Promise.all([
          produitsAPI.getOne(id),
          avisAPI.getByProduit(id),
        ]);
        setProduit(rp.data);
        setAvis(ra.data || []);
      } catch {
        router.push('/catalogue');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!produit) return null;

  const prixOriginal = Number(produit.prix) || 0;
  const pourcentagePromo = produit.promotion ? Number(produit.promotion.pourcentage) : 0;

  const prixFinal = produit.promotion
    ? (prixOriginal * (1 - pourcentagePromo / 100)).toFixed(2)
    : prixOriginal.toFixed(2);

  const prixBarre = produit.promotion ? prixOriginal.toFixed(2) : null;

  const handleAddCart = async () => {
    if (!isAuthenticated) return router.push('/login');
    setAdding(true);
    try { await addItem(produit.id, quantite); }
    finally { setAdding(false); }
  };

  const images = produit.images?.length
    ? produit.images
    : [{ image: null, est_principale: true }];

  const peutContacter = isAuthenticated && user?.id !== produit.vendeur_id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        <Link href="/catalogue" className="hover:underline" style={{ color: 'var(--primary)' }}>Catalogue</Link>
        <span>›</span>
        {produit.categorie && <><span>{produit.categorie}</span><span>›</span></>}
        <span className="truncate max-w-xs" style={{ color: 'var(--text)' }}>{produit.nom}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      <div>
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 flex items-center justify-center"
           style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {images[imgActive]?.image
            ? <img src={images[imgActive].image} alt={produit.nom} className="w-full h-full object-contain p-6" />
            : <span className="text-8xl">📦</span>}
            {produit.promotion && (
            <span className="absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: 'var(--primary)' }}>-{Math.round(pourcentagePromo)}%</span>)}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgActive((imgActive - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-105 transition-all duration-200 z-10" aria-label="Image précédente">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button
                  onClick={() => setImgActive((imgActive + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-sm text-white hover:bg-black/70 hover:scale-105 transition-all duration-200 z-10" aria-label="Image suivante">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgActive(i)}
                  className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all" style={{ border: `2px solid ${i === imgActive ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: 'var(--bg-card)' }}>
                  {img.image ? (
                  <img src={img.image} alt="" className="w-full h-full object-contain p-1" />) : ( <span className="text-2xl flex items-center justify-center h-full">📦</span>)}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* ── Infos produit ── */}
        <div>
          {produit.marque && (
            <p className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--primary)' }}>
              {produit.marque}
            </p>
          )}
          <h1 className="text-2xl font-black leading-snug mb-3" style={{ color: 'var(--text)' }}>
            {produit.nom}
          </h1>

          {produit.note_moyenne && (
            <div className="flex items-center gap-3 mb-4">
              <Stars note={produit.note_moyenne} size={16} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {produit.note_moyenne}/5
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ({produit.nb_avis} avis)
              </span>
            </div>
          )}

          {/* Prix */}
          <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black" style={{ color: 'var(--text)' }}>{prixFinal} €</span>
              {produit.promotion && prixBarre && (
                <>
                  <span className="text-lg line-through" style={{ color: 'var(--text-muted)' }}>
                    {prixBarre} €
                  </span>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--primary)' }}>
                    -{Math.round(pourcentagePromo)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: produit.etat === 'neuf' ? '#dcfce7' : 'var(--primary-light)',
                color:           produit.etat === 'neuf' ? '#16a34a' : 'var(--primary)',
              }}
            >
              {produit.etat === 'neuf' ? '✓ Neuf' : produit.etat === 'occasion' ? 'Occasion' : 'Reconditionné'}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                backgroundColor: produit.stock > 5 ? '#dcfce7' : produit.stock > 0 ? '#fef9c3' : '#fee2e2',
                color:           produit.stock > 5 ? '#16a34a' : produit.stock > 0 ? '#ca8a04' : '#dc2626',
              }}
            >
              {produit.stock > 5 ? `En stock (${produit.stock})` : produit.stock > 0 ? `Plus que ${produit.stock} !` : 'Rupture de stock'}
            </span>
          </div>

          {/* Vendeur */}
          {produit.vendeur_nom && (
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Vendu par <span className="font-semibold" style={{ color: 'var(--text)' }}>{produit.vendeur_nom}</span>
            </p>
          )}

          {/* Quantité */}
          {produit.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Quantité :</span>
              <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <button onClick={() => setQuantite(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:opacity-70"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)' }}
                >−</button>
                <span className="w-12 text-center text-sm font-bold" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text)' }}>
                  {quantite}
                </span>
                <button onClick={() => setQuantite(q => Math.min(produit.stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-lg font-bold hover:opacity-70"
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)' }}
                >+</button>
              </div>
            </div>
          )}

          {/* Boutons action */}
          <div className="flex gap-3 mb-3">
            <button
              onClick={handleAddCart}
              disabled={adding || produit.stock === 0}
              className="flex-1 h-12 rounded-xl font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {produit.stock === 0 ? 'Rupture de stock' : adding ? 'Ajout...' : '🛒 Ajouter au panier'}
            </button>
            <button
              onClick={() => toggleFavori(produit.id)}
              className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all hover:opacity-80"
              style={{
                borderColor:     liked ? 'var(--primary)' : 'var(--border)',
                backgroundColor: liked ? 'var(--primary-light)' : 'var(--bg-card)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill={liked ? 'var(--primary)' : 'none'}
                stroke={liked ? 'var(--primary)' : 'var(--text-muted)'}
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Bouton Contacter le vendeur */}
          {peutContacter && (
            <Link
              href={`/messages?user_id=${produit.vendeur_id}`}
              className="w-full h-11 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              💬 Contacter le vendeur
            </Link>
          )}

          {/* Specs rapides */}
          {produit.specifications?.length > 0 && (
            <div
              className="mt-5 rounded-xl p-4 grid grid-cols-2 gap-2"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {produit.specifications.slice(0, 6).map(s => (
                <div key={s.cle}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.cle}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.valeur}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: 'description', label: 'Description' },
            { key: 'specs',       label: 'Caractéristiques' },
            { key: 'avis',        label: `Avis (${avis.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-6 py-4 text-sm font-semibold transition-colors relative"
              style={{ color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              {t.label}
              {tab === t.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--primary)' }} />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'description' && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              {produit.description || 'Aucune description disponible.'}
            </p>
          )}
          {tab === 'specs' && (
            produit.specifications?.length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {produit.specifications.map((s, i) => (
                    <tr key={s.cle} style={{ backgroundColor: i % 2 === 0 ? 'var(--bg-input)' : 'transparent' }}>
                      <td className="py-2.5 px-4 font-medium rounded-l-lg w-1/3" style={{ color: 'var(--text-muted)' }}>{s.cle}</td>
                      <td className="py-2.5 px-4 rounded-r-lg" style={{ color: 'var(--text)' }}>{s.valeur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p style={{ color: 'var(--text-muted)' }}>Aucune caractéristique renseignée.</p>
          )}
          {tab === 'avis' && (
            <AvisSection avis={avis} produit_id={id} onNewAvis={a => setAvis(prev => [a, ...prev])} />
          )}
        </div>
      </div>
    </div>
  );
}

function AvisSection({ avis, produit_id, onNewAvis }) {
  const { isAuthenticated } = useAuthStore();
  const [form,    setForm]    = useState({ note: 5, titre: '', commentaire: '' });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const { avisAPI } = require('@/lib/api');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await avisAPI.create({ produit_id: parseInt(produit_id), ...form });
      setSent(true);
      onNewAvis({ ...form, created_at: new Date().toISOString() });
    } catch {}
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      {avis.length === 0 && !sent && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucun avis. Soyez le premier !</p>
      )}
      {avis.map((a, i) => (
        <div key={i} className="pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
              {a.nom?.[0]}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{a.nom} {a.prenom}</p>
              <div className="flex items-center gap-2">
                <Stars note={a.note} size={12} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </span>
                {a.verifie && <span className="text-xs font-medium" style={{ color: '#16a34a' }}>✓ Achat vérifié</span>}
              </div>
            </div>
          </div>
          {a.titre && <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{a.titre}</p>}
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{a.commentaire}</p>
        </div>
      ))}

      {isAuthenticated && !sent && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="font-bold" style={{ color: 'var(--text)' }}>Donner mon avis</h4>
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text)' }}>Note</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, note: n }))}>
                  <svg width="24" height="24" viewBox="0 0 24 24"
                    fill={n <= form.note ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <input type="text" placeholder="Titre de votre avis" value={form.titre}
            onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
            className="w-full h-10 px-4 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
          />
          <textarea placeholder="Votre commentaire..." value={form.commentaire}
            onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none resize-none"
            style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
          />
          <button type="submit" disabled={sending}
            className="px-6 h-10 rounded-lg font-semibold text-sm text-white hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {sending ? 'Envoi...' : 'Publier mon avis'}
          </button>
        </form>
      )}
      {sent && (
        <div className="text-sm px-4 py-3 rounded-lg" style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
          ✓ Avis publié. Merci !
        </div>
      )}
    </div>
  );
}

function Stars({ note, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= Math.round(note) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }} />
        <div className="space-y-4">
          {[100, 60, 80, 40, 120].map((w, i) => (
            <div key={i} className="h-5 rounded" style={{ backgroundColor: 'var(--bg-card)', width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}