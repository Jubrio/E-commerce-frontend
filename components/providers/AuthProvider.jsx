'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';

export default function AuthProvider({ children }) {
  const rehydrate = useAuthStore(s => s.rehydrate);

  useEffect(() => {
    rehydrate();
  }, []);

  return <>{children}</>;
}
