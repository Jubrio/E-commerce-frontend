'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore  from '@/store/useAuthStore';
import useCartStore  from '@/store/useCartStore';
import useFavorisStore from '@/store/useFavorisStore';
import { favorisAPI } from '@/lib/api';

export default function FavorisPage() {
  const router = useRouter();
  const { isAuthenticated, _hydrated }  = useAuthStore();
  const { addItem }          = useCartStore();
  const { fetchFavoris }     = useFavorisStore();
  const [favoris,  setFavoris]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    // ⬅️ Attendre la fin de l'hydratation avant toute décision
    if (!_hydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    favorisAPI.getAll()
      .then(r => setFavoris(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [_hydrated, isAuthenticated, router]);

  const handleRemove = async (produit_id) => {
    setRemoving(produit_id);
    try {
      await favorisAPI.remove(produit_id);
      setFavoris(f => f.filter(x => x.id !== produit_id));
      // Mettre à jour le store global
      await fetchFavoris();
    } catch {}
    finally { setRemoving(null); }
  };

  const handleAddCart = async (produit_id) => {
    try { await addItem(produit_id, 1); }
    catch {}
  };

  if (loading) return <Skeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>
        Mes favoris ({favoris.length})
      </h1>

      {favoris.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="text-5xl mb-4">❤️</div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
            Aucun favori
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Ajoutez des produits à vos favoris pour les retrouver facilement.
          </p>
          <Link
            href="/catalogue"
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoris.map(p => (
            <div
              key={p.id}
              className="flex gap-4 p-4 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <Link href={`/produit/${p.id}`} className="flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  {p.image
                    ? <img src={p.image} alt={p.nom} className="w-full h-full object-contain p-1" />
                    : <span className="text-3xl">📦</span>
                  }
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/produit/${p.id}`}
                  className="text-sm font-semibold line-clamp-2 hover:underline"
                  style={{ color: 'var(--text)' }}
                >
                  {p.nom}
                </Link>
                <p className="text-base font-black mt-1" style={{ color: 'var(--text)' }}>
                  {Number(p.prix).toFixed(2)} €
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleAddCart(p.id)}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold text-white hover:opacity-90"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    🛒 Ajouter
                  </button>
                  <button
                    onClick={() => handleRemove(p.id)}
                    disabled={removing === p.id}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border hover:opacity-70 transition-opacity disabled:opacity-40"
                    style={{ borderColor: '#fecaca', color: '#dc2626' }}
                  >
                    {removing === p.id ? '...' : '✕'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-40 rounded mb-6" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-28 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
        ))}
      </div>
    </div>
  );
}