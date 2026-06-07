'use client';
import Link from 'next/link';

export default function RetoursPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm hover:underline mb-4 inline-block" style={{ color: 'var(--primary)' }}>
        ← Retour à l’accueil
      </Link>
      <div className="rounded-2xl p-8 shadow-md" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h1 className="text-2xl font-black mb-6" style={{ color: 'var(--text)' }}>Retours & Remboursements</h1>
      <div className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        <p>Les retours sont acceptés sous 14 jours si le produit est non utilisé et dans son emballage d’origine.</p>
        <p>Remboursement ou échange après validation par le service client.</p>
        <p>Les frais de retour peuvent être à la charge du client sauf défaut avéré du produit.</p>
        <p>Pour toute demande, contactez-nous via <a href="/contact" style={{ color: 'var(--primary)' }}>notre formulaire</a>.</p>
      </div>
    </div>
      </div>
      
  );
}