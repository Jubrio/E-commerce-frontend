'use client';
import Link from 'next/link';

export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm hover:underline mb-4 inline-block" style={{ color: 'var(--primary)' }}>
        ← Retour à l’accueil
      </Link>

      {/* Carte principale avec fond clair et ombre */}
      <div
        className="rounded-2xl p-8 shadow-md"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>
          Conditions Générales
        </h1>

        <div className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <p>L’utilisation du site et toute commande valent acceptation des présentes conditions.</p>
          <p>Les prix sont affichés en EUR, toutes taxes incluses, et peuvent être modifiés sans préavis.</p>
          <p>Les paiements sont sécurisés et gérés par nos prestataires agréés.</p>
          <p>La livraison est assurée en Guyane, DOM-TOM et Outre-mer, avec suivi transmis après expédition.</p>
          <p>Toute fraude ou utilisation illégale entraînera l’annulation immédiate des commandes et l’accès au site.</p>
          <p>Bazar Guyane peut mettre à jour ses conditions, seule la version en ligne fait foi.</p>
          <p className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
}