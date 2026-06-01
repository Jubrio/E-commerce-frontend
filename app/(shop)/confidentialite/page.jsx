'use client';
import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm hover:underline mb-4 inline-block" style={{ color: 'var(--primary)' }}>
        ← Retour à l’accueil
      </Link>

      <div
        className="rounded-2xl p-8 shadow-md"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>
          Politique de confidentialité
        </h1>

        <div className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>Bazar Guyane attache une grande importance à la protection de vos données personnelles.</p>

          <h2 className="font-bold text-base mt-4" style={{ color: 'var(--text)' }}>Données collectées</h2>
          <p>Lors de votre inscription ou commande, nous collectons : nom, prénom, email, adresse, téléphone, historique d’achat.</p>

          <h2 className="font-bold text-base mt-4" style={{ color: 'var(--text)' }}>Utilisation des données</h2>
          <p>Vos données sont utilisées pour traiter vos commandes, vous informer sur votre compte, et améliorer nos services. Nous ne vendons pas vos données à des tiers.</p>

          <h2 className="font-bold text-base mt-4" style={{ color: 'var(--text)' }}>Cookies</h2>
          <p>Le site utilise des cookies de session pour maintenir votre panier et votre connexion. Vous pouvez les désactiver dans votre navigateur.</p>

          <h2 className="font-bold text-base mt-4" style={{ color: 'var(--text)' }}>Sécurité</h2>
          <p>Les données sont hébergées en France et les paiements sont chiffrés (Stripe).</p>

          <h2 className="font-bold text-base mt-4" style={{ color: 'var(--text)' }}>Vos droits</h2>
          <p>Vous pouvez accéder, rectifier ou supprimer vos données en nous contactant à{' '}
            <a href="mailto:support.bazarguyane@gmail.com" style={{ color: 'var(--primary)' }}>support.bazarguyane@gmail.com</a>.
          </p>

          <p className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
}