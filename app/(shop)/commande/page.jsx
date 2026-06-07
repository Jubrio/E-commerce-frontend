'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';
import { commandesAPI, adressesAPI, paiementsAPI } from '@/lib/api';
import PhoneInput from '@/components/ui/PhoneInput'; 

const ETAPES = ['Livraison', 'Récapitulatif', 'Paiement'];
const STORAGE_KEY = 'guyagod_commande';

export default function CommandePage() {
  const router = useRouter();
  const { items, total, resetLocal, fetchCart } = useCartStore();
  const { user, isAuthenticated, _hydrated } = useAuthStore(); 

  const [etape, setEtape] = useState(0);
  const [adresses, setAdresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commande, setCommande] = useState(null);
  const [cartReady, setCartReady] = useState(false);
  const [restored, setRestored] = useState(false);

  const [form, setForm] = useState({
    adresse_id: '',
    adresse_livraison: '',
    telephone: user?.telephone || '', 
    mode_paiement: 'stripe',
    notes_client: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined' || restored) return;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setEtape(data.etape ?? 0);
        setForm(prev => ({ ...prev, ...data.form }));
      }
    } catch (e) {}
    setRestored(true);
  }, [restored]);

  useEffect(() => {
    if (!restored) return;
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        etape,
        form: {
          adresse_id: form.adresse_id,
          adresse_livraison: form.adresse_livraison,
          telephone: form.telephone,
          mode_paiement: form.mode_paiement,
          notes_client: form.notes_client,
        },
      })
    );
  }, [etape, form, restored]);

  useEffect(() => {
    if (!_hydrated) return;
    if (!isAuthenticated) return;

    const loadCart = async () => {
      if (items.length === 0) {
        await fetchCart();
      }
      setCartReady(true);
    };
    loadCart();
  }, [_hydrated, isAuthenticated, items.length, fetchCart]);

  useEffect(() => {
    if (!_hydrated || !cartReady || !restored) return;

    if (items.length === 0) {
      router.push('/panier');
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (adresses.length === 0) {
      adressesAPI
        .getAll()
        .then((r) => {
          setAdresses(r.data || []);
          if (!form.adresse_id && !form.adresse_livraison && r.data.length) {
            const def = r.data.find((a) => a.est_defaut) || r.data[0];
            if (def) {
              setForm((f) => ({
                ...f,
                adresse_id: def.id,
                adresse_livraison: `${def.adresse}, ${def.code_postal} ${def.ville}, ${def.pays}`,
              }));
            }
          }
        })
        .catch(() => {});
    }
  }, [_hydrated, cartReady, restored, items.length, isAuthenticated, router, adresses.length, form.adresse_id, form.adresse_livraison]);

  const selectAdresse = (a) => {
    setForm((f) => ({
      ...f,
      adresse_id: a.id,
      adresse_livraison: `${a.adresse}, ${a.code_postal} ${a.ville}, ${a.pays}`,
    }));
  };

  const handlePasserCommande = async () => {
    setLoading(true);
    try {
      const res = await commandesAPI.create({
        adresse_livraison: form.adresse_livraison,
        telephone: form.telephone,
        mode_paiement: form.mode_paiement,
        notes_client: form.notes_client,
      });
      setCommande(res.data);
      sessionStorage.removeItem(STORAGE_KEY);

      if (form.mode_paiement === 'stripe') {
        const stripeRes = await paiementsAPI.stripeCheckout({
          commande_id: res.data.commande_id,
          total: total,
          items: items.map((i) => ({ nom: i.nom, prix: i.prix, quantite: i.quantite })),
        });
        resetLocal();
        window.location.href = stripeRes.data.url;
      } else {
        resetLocal();
        setEtape(2);
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!_hydrated || !cartReady || !restored) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--bg-card)' }} />
          <div className="h-64 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }} />
        </div>
      </div>
    );
  }

  if (etape === 2) {
    return <Succes commande={commande} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-10">
        {ETAPES.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: i <= etape ? 'var(--primary)' : 'var(--bg-input)',
                color: i <= etape ? '#fff' : 'var(--text-muted)',
              }}
            >
              {i < etape ? '✓' : i + 1}
            </div>
            <span
              className="text-sm font-medium hidden sm:block"
              style={{ color: i === etape ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {label}
            </span>
            {i < ETAPES.length - 1 && (
              <div className="w-8 h-px" style={{ backgroundColor: 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Étape Livraison */}
      {etape === 0 && (
        <div className="space-y-5">
          <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>Adresse de livraison</h2>

          {adresses.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Mes adresses enregistrées
              </p>
              {adresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => selectAdresse(a)}
                  className="w-full text-left p-4 rounded-xl border transition-all"
                  style={{
                    borderColor: form.adresse_id === a.id ? 'var(--primary)' : 'var(--border)',
                    backgroundColor:
                      form.adresse_id === a.id ? 'var(--primary-light)' : 'var(--bg-card)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        {a.libelle || 'Adresse'}
                        {a.est_defaut && (
                          <span
                            className="ml-2 text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                          >
                            Par défaut
                          </span>
                        )}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {a.adresse}, {a.code_postal} {a.ville}, {a.pays}
                      </p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: form.adresse_id === a.id ? 'var(--primary)' : 'var(--border)',
                      }}
                    >
                      {form.adresse_id === a.id && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              {adresses.length ? 'Ou saisir une adresse' : 'Adresse de livraison'}
            </p>
            <textarea
              value={form.adresse_livraison}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  adresse_livraison: e.target.value,
                  adresse_id: '',
                }))
              }
              placeholder="Ex : 12 rue des Palmistes, 97300 Cayenne, Guyane"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Téléphone de contact *
            </label>
            <PhoneInput
              value={form.telephone}
              onChange={(val) => setForm((f) => ({ ...f, telephone: val }))}
              countryCode="GF"
              required
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Format international : indicatif + numéro local (sans espaces)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
              Instructions de livraison (optionnel)
            </label>
            <input
              type="text"
              value={form.notes_client}
              onChange={(e) => setForm((f) => ({ ...f, notes_client: e.target.value }))}
              placeholder="Laisser au gardien, code porte..."
              className="w-full h-11 px-4 rounded-xl border text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            />
          </div>

          <button
            onClick={() => setEtape(1)}
            disabled={!form.adresse_livraison || !form.telephone}
            className="w-full h-12 rounded-xl font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Continuer → Récapitulatif
          </button>
        </div>
      )}

      {/* Étape Récapitulatif (inchangé) */}
      {etape === 1 && (
        <div className="space-y-5">
          <h2 className="text-xl font-black" style={{ color: 'var(--text)' }}>
            Récapitulatif de commande
          </h2>

          <div
            className="rounded-xl divide-y overflow-hidden"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              divideColor: 'var(--border)',
            }}
          >
            {items.map((item) => (
              <div key={item.produit_id} className="flex items-center gap-4 p-4">
                <div
                  className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-input)' }}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.nom} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {item.nom}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Qté : {item.quantite}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {(item.prix * item.quantite).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Livraison à :
            </p>
            <p style={{ color: 'var(--text-muted)' }}>{form.adresse_livraison}</p>
            <p style={{ color: 'var(--text-muted)' }}>Tél : {form.telephone}</p>
          </div>

          <div>
            <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>
              Mode de paiement
            </p>
            {[
              {
                val: 'stripe',
                label: (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <img src="/stripe.png" alt="Stripe" style={{ width: '150px', height: 'auto' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Carte bancaire (Stripe)
                    </span>
                  </div>
                ),
                desc: 'Paiement sécurisé',
              },
            ].map((m) => (
              <button
                key={m.val}
                onClick={() => setForm((f) => ({ ...f, mode_paiement: m.val }))}
                className="w-full p-4 rounded-xl border mb-2 transition-all"
                style={{
                  borderColor: form.mode_paiement === m.val ? 'var(--primary)' : 'var(--border)',
                  backgroundColor:
                    form.mode_paiement === m.val ? 'var(--primary-light)' : 'var(--bg-card)',
                }}
              >
                {typeof m.label === 'string' ? (
                  <p className="text-sm font-semibold text-center" style={{ color: 'var(--text)' }}>
                    {m.label}
                  </p>
                ) : (
                  m.label
                )}
                <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>
                  {m.desc}
                </p>
              </button>
            ))}
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex justify-between items-center">
              <span className="font-black text-lg" style={{ color: 'var(--text)' }}>
                Total à payer
              </span>
              <span className="font-black text-2xl" style={{ color: 'var(--primary)' }}>
                {total?.toFixed(2)} €
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEtape(0)}
              className="px-6 h-12 rounded-xl font-semibold border hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              ← Retour
            </button>
            <button
              onClick={handlePasserCommande}
              disabled={loading}
              className="flex-1 h-12 rounded-xl font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading
                ? 'Traitement...'
                : form.mode_paiement === 'stripe'
                ? '🔒 Payer maintenant'
                : 'Valider la commande'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Succes({ commande }) {
  if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
        style={{ backgroundColor: '#dcfce7' }}
      >
        ✓
      </div>
      <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text)' }}>
        Commande confirmée !
      </h2>
      <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
        Votre commande a été enregistrée avec succès.
      </p>
      {commande?.reference && (
        <p className="text-sm font-mono font-bold mb-6" style={{ color: 'var(--primary)' }}>
          Réf : {commande.reference}
        </p>
      )}
      <div className="flex flex-col gap-3">
        <a
          href="/commandes"
          className="block px-6 py-3 rounded-xl font-semibold text-white"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Voir mes commandes
        </a>
        <a
          href="/catalogue"
          className="block px-6 py-3 rounded-xl font-semibold border"
          style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
        >
          Continuer mes achats
        </a>
      </div>
    </div>
  );
}