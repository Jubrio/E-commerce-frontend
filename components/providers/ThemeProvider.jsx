'use client';
import { useEffect } from 'react';
import useThemeStore from '@/store/useThemeStore';

export default function ThemeProvider({ children }) {
  const init = useThemeStore(s => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
