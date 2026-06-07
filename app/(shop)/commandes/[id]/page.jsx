'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore    from '@/store/useAuthStore';
import { commandesAPI } from '@/lib/api';

const STATUT_CONFIG = {
  en_attente: { label: 'En attente',  color: '#ca8a04', bg: '#fef9c3', step: 0 },
  payee:      { label: 'Payée',       color: '#16a34a', bg: '#dcfce7', step: 1 },
  expediee:   { label: 'Expédiée',    color: '#2563eb', bg: '#dbeafe', step: 2 },
  livree:     { label: 'Livrée',      color: '#16a34a', bg: '#dcfce7', step: 3 },
  annulee:    { label: 'Annulée',     color: '#dc2626', bg: '#fee2e2', step: -1 },
  remboursee: { label: 'Remboursée',  color: '#7c3aed', bg: '#ede9fe', step: -1 },
};

const STEPS = ['Commande passée', 'Paiement validé', 'En cours d\'expédition', 'Livré'];

export default function CommandeDetailPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const { isAuthenticated, _hydrated } = useAuthStore();
  const [commande, setCommande] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!_hydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    commandesAPI.getOne(id)
      .then(r => setCommande(r.data))
      .catch(() => router.push('/commandes'))
      .finally(() => setLoading(false));
  }, [_hydrated, isAuthenticated, id, router]);

  if (loading) return <Skeleton />;
  if (!commande) return null;

  const st      = STATUT_CONFIG[commande.statut] || STATUT_CONFIG.en_attente;
  const currentStep = st.step;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/commandes"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--primary)' }}
      >
        ← Mes commandes
      </Link>

      {/* En-tête */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>
            Commande {commande.reference_commande}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Passée le {new Date(commande.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <span
          className="text-sm font-bold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: st.bg, color: st.color }}
        >
          {st.label}
        </span>
      </div>

      {/* Suivi visuel */}
      {currentStep >= 0 && (
        <div
          className="rounded-xl p-5 mb-5"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>
            Suivi de commande
          </h2>
          <div className="flex items-center justify-between relative">
            <div
              className="absolute top-3.5 left-0 h-0.5 transition-all duration-500"
              style={{
                backgroundColor: 'var(--primary)',
                width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                zIndex: 0,
              }}
            />
            <div
              className="absolute top-3.5 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--border)', zIndex: -1 }}
            />

            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center relative z-10" style={{ width: `${100 / STEPS.length}%` }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all"
                  style={{
                    backgroundColor: i <= currentStep ? 'var(--primary)' : 'var(--bg-input)',
                    color:           i <= currentStep ? '#fff' : 'var(--text-muted)',
                    border:          `2px solid ${i <= currentStep ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <p
                  className="text-xs text-center leading-tight"
                  style={{
                    color:      i <= currentStep ? 'var(--text)' : 'var(--text-muted)',
                    fontWeight: i === currentStep ? 700 : 400,
                  }}
                >
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Infos livraison si expédiée */}
          {commande.transporteur && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Transporteur</p>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{commande.transporteur}</p>
                </div>
                {commande.numero_suivi && (
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Numéro de suivi</p>
                    <p className="font-mono font-semibold" style={{ color: 'var(--primary)' }}>
                      {commande.numero_suivi}
                    </p>
                  </div>
                )}
                {commande.date_expedition && (
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Date d'expédition</p>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>
                      {new Date(commande.date_expedition).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {commande.date_livraison_estimee && (
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Livraison estimée</p>
                    <p className="font-semibold" style={{ color: 'var(--text)' }}>
                      {new Date(commande.date_livraison_estimee).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Articles commandés */}
      <div
        className="rounded-xl overflow-hidden mb-5"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            Articles ({commande.items?.length})
          </h2>
        </div>
        {commande.items?.map(item => {
          const prixUnitaire = typeof item.prix_unitaire === 'number'
            ? item.prix_unitaire
            : parseFloat(item.prix_unitaire) || 0;
          const sousTotal = typeof item.sous_total === 'number'
            ? item.sous_total
            : parseFloat(item.sous_total) || 0;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'var(--bg-input)' }}
              >
                {item.image
                  ? <img src={item.image} alt={item.nom_produit} className="w-full h-full object-contain p-1" />
                  : <span className="text-2xl">📦</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                  {item.nom_produit}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {prixUnitaire.toFixed(2)} € × {item.quantite}
                </p>
              </div>
              <p className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--text)' }}>
                {sousTotal.toFixed(2)} €
              </p>
            </div>
          );
        })}
      </div>

      {/* Deux colonnes : adresse + total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Livraison
          </h3>
          <p className="text-sm" style={{ color: 'var(--text)' }}>{commande.adresse_livraison}</p>
          {commande.telephone && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Tél : {commande.telephone}
            </p>
          )}
          {commande.notes_client && (
            <p className="text-xs mt-2 italic" style={{ color: 'var(--text-muted)' }}>
              "{commande.notes_client}"
            </p>
          )}
        </div>

        {/* Récapitulatif financier */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Récapitulatif
          </h3>
          <div className="space-y-2 text-sm">
            {commande.total_avant_coupon && commande.total_avant_coupon !== commande.total && (
              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Sous-total</span>
                <span>{Number(commande.total_avant_coupon).toFixed(2)} €</span>
              </div>
            )}
            {commande.total_avant_coupon && commande.total_avant_coupon !== commande.total && (
              <div className="flex justify-between" style={{ color: '#16a34a' }}>
                <span>Réduction</span>
                <span>-{(Number(commande.total_avant_coupon) - Number(commande.total)).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>Livraison</span>
              <span style={{ color: '#16a34a' }}>Gratuite</span>
            </div>
            <div
              className="flex justify-between font-black pt-2"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <span>Total payé</span>
              <span style={{ color: 'var(--primary)' }}>{Number(commande.total).toFixed(2)} €</span>
            </div>
            <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
              Paiement : {commande.mode_paiement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-6 w-32 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="h-10 w-64 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="h-32 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
      <div className="h-48 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
    </div>
  );
}