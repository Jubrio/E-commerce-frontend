'use client';
// components/produit/ProductCard.jsx — FIX cœur avec userId
import Link            from 'next/link';
import useCartStore    from '@/store/useCartStore';
import useAuthStore    from '@/store/useAuthStore';
import useFavorisStore from '@/store/useFavorisStore';
import { useState }    from 'react';

export default function ProductCard({ produit }) {
  const { addItem }                   = useCartStore();
  const { isAuthenticated, user }     = useAuthStore();
  const { isFavori, toggleFavori }    = useFavorisStore();
  const [adding, setAdding]           = useState(false);

  const userId = user?.id;
  // FIX : on passe userId pour que isFavori regarde le bon user
  const liked  = isAuthenticated && userId ? isFavori(produit.id, userId) : false;

  const prix  = Number(produit.prix)  || 0;
  const promo = Number(produit.promo) || 0;

  const prixFinal = promo
    ? (prix * (1 - promo / 100)).toFixed(2)
    : prix.toFixed(2);

  const handleAddCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setAdding(true);
    try { await addItem(produit.id, 1); }
    finally { setAdding(false); }
  };

  const handleFavori = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !userId) return;
    // FIX : passer userId
    await toggleFavori(produit.id, userId);
  };

  return (
    <Link
      href={`/produit/${produit.id}`}
      className="group block rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--bg-card)',
        border:          '1px solid var(--border)',
        boxShadow:       'var(--shadow)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
    >
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
        {produit.image_principale ? (
          <img src={produit.image_principale} alt={produit.nom}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}

        {promo > 0 && (
          <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            -{Math.round(promo)}%
          </span>
        )}

        {produit.etat && produit.etat !== 'neuf' && (
          <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {produit.etat === 'occasion' ? 'Occasion' : 'Reconditionné'}
          </span>
        )}

        {/* FIX : visible si liké, sinon au hover. Change réellement selon l'état */}
        <button
          onClick={handleFavori}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all
            ${liked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={liked ? 'var(--primary)' : 'none'}
            stroke={liked ? 'var(--primary)' : 'var(--text-muted)'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="p-3">
        {produit.marque && (
          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--primary)' }}>
            {produit.marque}
          </p>
        )}
        <h3 className="text-sm font-medium line-clamp-2 leading-snug mb-2" style={{ color: 'var(--text)' }}>
          {produit.nom}
        </h3>

        {produit.note_moyenne && (
          <div className="flex items-center gap-1 mb-2">
            <Stars note={Number(produit.note_moyenne)} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {Number(produit.note_moyenne).toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black" style={{ color: 'var(--text)' }}>{prixFinal} €</span>
          {promo > 0 && (
            <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
              {prix.toFixed(2)} €
            </span>
          )}
        </div>

        {produit.vendeur_nom && (
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Vendu par <span style={{ color: 'var(--text)' }}>{produit.vendeur_nom}</span>
          </p>
        )}

        <button
          onClick={handleAddCart}
          disabled={adding || produit.stock === 0}
          className="w-full h-9 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: produit.stock === 0 ? 'var(--text-muted)' : 'var(--primary)' }}
        >
          {produit.stock === 0 ? 'Rupture de stock' : adding ? '...' : 'Ajouter au panier'}
        </button>
      </div>
    </Link>
  );
}

function Stars({ note }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= Math.round(note) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}
