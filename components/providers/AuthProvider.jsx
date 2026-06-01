'use client';
// components/providers/AuthProvider.jsx
// Appelle rehydrate() au démarrage pour charger le profil immédiatement
// Fix : le profil apparaît dès le premier chargement sans refresh

import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';

export default function AuthProvider({ children }) {
  const rehydrate = useAuthStore(s => s.rehydrate);

  useEffect(() => {
    // Lancer immédiatement au montage
    rehydrate();
  }, []);

  return <>{children}</>;
}
