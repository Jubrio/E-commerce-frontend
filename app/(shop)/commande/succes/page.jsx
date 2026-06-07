'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CommandeSuccesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commandeId = searchParams.get('commande_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!commandeId) {
      router.push('/commandes');
      return;
    }
    const checkStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/commandes/${commandeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('guyagod_token')}` }
        });
        if (res.ok) {
          setLoading(false);
        } else {
          setError('Commande introuvable');
        }
      } catch {
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [commandeId, router]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--primary)' }} />
        <p className="mt-4">Validation de votre paiement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#dcfce7' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-black mb-2">Merci pour votre commande !</h1>
      <p className="text-sm text-gray-600 mb-6">
        Votre paiement a été validé. Vous recevrez un email de confirmation.
      </p>
      {commandeId && (
        <Link href={`/commandes/${commandeId}`} className="inline-block px-6 py-3 rounded-xl font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}>
          Voir ma commande
        </Link>
      )}
      <Link href="/catalogue" className="block mt-4 text-sm text-primary">Continuer mes achats</Link>
    </div>
  );
}