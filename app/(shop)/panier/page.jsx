'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCartStore  from '@/store/useCartStore';
import useAuthStore  from '@/store/useAuthStore';
import { couponsAPI } from '@/lib/api';

export default function PanierPage() {
  const router = useRouter();
  const { items, total, fetchCart, updateItem, removeItem, clearCart, loading } = useCartStore();
  const { isAuthenticated, _hydrated } = useAuthStore(); // ← AJOUT _hydrated

  const [couponCode,    setCouponCode]    = useState('');
  const [couponData,    setCouponData]    = useState(null);
  const [couponError,   setCouponError]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Attendre que le store soit hydraté avant toute décision
  useEffect(() => {
    if (!_hydrated) return;
    if (isAuthenticated) fetchCart();
  }, [_hydrated, isAuthenticated, fetchCart]);

  // Pendant l'hydratation, afficher un squelette
  if (!_hydrated) return <PanierSkeleton />;

  // Non authentifié
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Votre panier vous attend</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Connectez-vous pour voir votre panier
        </p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Se connecter
        </Link>
      </div>
    );
  }

  if (loading) return <PanierSkeleton />;

  if (!items.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Votre panier est vide</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Découvrez nos produits et ajoutez-en à votre panier
        </p>
        <Link
          href="/catalogue"
          className="px-6 py-3 rounded-xl font-semibold text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Voir le catalogue
        </Link>
      </div>
    );
  }

  // Calcul du total et réduction
  const totalNumber = typeof total === 'number' ? total : parseFloat(total) || 0;
  const totalAvecRemise = couponData
    ? (totalNumber - (couponData.reduction || 0)).toFixed(2)
    : totalNumber.toFixed(2);

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await couponsAPI.verifier(couponCode, totalNumber);
      setCouponData(res.data);
    } catch (err) {
      setCouponError(err.message || 'Coupon invalide');
      setCouponData(null);
    } finally { setCouponLoading(false); }
  };

  const handleCommander = () => {
    router.push('/commande');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>
        Mon panier ({items.reduce((s, i) => s + i.quantite, 0)} article{items.length > 1 ? 's' : ''})
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Liste des items */}
        <div className="flex-1 space-y-3">
          {items.map(item => {
            const prixNumber = typeof item.prix === 'number' ? item.prix : parseFloat(item.prix) || 0;
            return (
              <div
                key={item.produit_id}
                className="flex gap-4 p-4 rounded-xl"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  {item.image
                    ? <img src={item.image} alt={item.nom} className="w-full h-full object-contain p-2" />
                    : <span className="text-3xl">📦</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produit/${item.produit_id}`}
                    className="text-sm font-semibold line-clamp-2 hover:underline"
                    style={{ color: 'var(--text)' }}
                  >
                    {item.nom}
                  </Link>
                  {item.vendeur_nom && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      par {item.vendeur_nom}
                    </p>
                  )}
                  <p className="text-base font-black mt-1" style={{ color: 'var(--text)' }}>
                    {prixNumber.toFixed(2)} €
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div
                      className="flex items-center rounded-lg overflow-hidden border"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <button
                        onClick={() => updateItem(item.produit_id, item.quantite - 1)}
                        className="w-8 h-8 flex items-center justify-center font-bold hover:opacity-70"
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)' }}
                      >−</button>
                      <span
                        className="w-10 text-center text-sm font-bold"
                        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text)' }}
                      >
                        {item.quantite}
                      </span>
                      <button
                        onClick={() => updateItem(item.produit_id, item.quantite + 1)}
                        disabled={item.quantite >= item.stock}
                        className="w-8 h-8 flex items-center justify-center font-bold hover:opacity-70 disabled:opacity-40"
                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)' }}
                      >+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                        {(prixNumber * item.quantite).toFixed(2)} €
                      </span>
                      <button
                        onClick={() => removeItem(item.produit_id)}
                        className="text-xs hover:underline"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex justify-end">
            <button
              onClick={() => clearCart()}
              className="text-xs hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              Vider le panier
            </button>
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="lg:w-80 flex-shrink-0 space-y-4">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>Code promo</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="MONCODE"
                className="flex-1 h-9 px-3 rounded-lg border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text)', borderColor: 'var(--border)' }}
              />
              <button
                onClick={handleCoupon}
                disabled={couponLoading}
                className="px-3 h-9 rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                OK
              </button>
            </div>
            {couponError && (
              <p className="text-xs mt-2" style={{ color: '#dc2626' }}>{couponError}</p>
            )}
            {couponData && (
              <p className="text-xs mt-2 font-medium" style={{ color: '#16a34a' }}>
                ✓ Réduction de {couponData.reduction?.toFixed(2)} € appliquée
              </p>
            )}
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Sous-total</span>
                <span>{totalNumber.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Livraison</span>
                <span className="font-medium" style={{ color: '#16a34a' }}>Gratuite</span>
              </div>
              {couponData && (
                <div className="flex justify-between" style={{ color: '#16a34a' }}>
                  <span>Réduction</span>
                  <span>-{couponData.reduction?.toFixed(2)} €</span>
                </div>
              )}
              <div
                className="flex justify-between pt-3 font-black text-base border-t"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <span>Total</span>
                <span>{totalAvecRemise} €</span>
              </div>
            </div>
            <button
              onClick={handleCommander}
              className="w-full h-12 mt-5 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Commander →
            </button>
            <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
              🔒 Paiement sécurisé par Stripe
            </p>
          </div>

          <Link
            href="/catalogue"
            className="block text-center text-sm font-medium py-2 hover:underline"
            style={{ color: 'var(--primary)' }}
          >
            ← Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}

function PanierSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="h-32 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
      ))}
    </div>
  );
}