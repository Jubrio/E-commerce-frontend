'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MotDePasseOubliePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/reset-password');
  }, []);
  return null;
}