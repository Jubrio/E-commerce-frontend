'use client';


import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

const API = process.env.NEXT_PUBLIC_API_URL;

function GoogleSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      router.replace('/login?error=google');
      return;
    }

    // Stocker le token immédiatement (cookie + localStorage)
    const days = 7;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `guyagod_token=${token}; expires=${expires}; path=/; SameSite=Lax`;
    localStorage.setItem('guyagod_token', token);

    // Récupérer le profil utilisateur complet via l'API
    const loadUser = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Token invalide');
        const data = await res.json();
        const user = data.data;

        // Mettre à jour le store MANUELLEMENT (évite d’attendre la réhydratation)
        useAuthStore.setState({
          user: user,
          isAuthenticated: true,
          _hydrated: true,
        });

        // Rediriger vers le catalogue (tout est prêt)
        router.replace('/catalogue');
      } catch (err) {
        console.error('Erreur chargement utilisateur Google', err);
        router.replace('/login?error=google');
      }
    };

    loadUser();
  }, [searchParams, router]);

  return (
    <div className="text-center">
      <div
        className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
      />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Connexion en cours, veuillez patienter...
      </p>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <div
      className="w-full max-w-sm rounded-2xl p-10 shadow-lg-theme"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <Suspense fallback={
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
          />
        </div>
      }>
        <GoogleSuccessHandler />
      </Suspense>
    </div>
  );
}