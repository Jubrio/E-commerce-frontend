'use client';
import Link from 'next/link';

const faq = [
  { q: "Comment passer une commande ?", a: "Ajoutez des produits au panier, validez votre adresse, choisissez le paiement et confirmez." },
  { q: "Quels sont les modes de paiement ?", a: "Carte bancaire (Stripe)." },
  { q: "Quels sont les délais de livraison ?", a: "En Guyane : 3 à 5 jours ouvrés. DOM-TOM : 5 à 10 jours." },
  { q: "Puis-je retourner un produit ?", a: "Oui, sous 14 jours en état neuf. Consultez notre page Retours." },
  { q: "Comment contacter le service client ?", a: "Via notre formulaire de contact ou par téléphone au 06 94 15 41 08." },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm hover:underline mb-4 inline-block" style={{ color: 'var(--primary)' }}>
        ← Retour à l’accueil
      </Link>

      {/* Carte principale */}
      <div
        className="rounded-2xl p-8 shadow-md"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Foire aux questions</h1>

        <div className="space-y-6">
          {faq.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}
            >
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>{item.q}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}