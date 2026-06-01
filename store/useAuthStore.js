// store/useAuthStore.js — CORRIGÉ
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _hydrated: false,

      login: async (email, mot_de_passe) => {
        const { authAPI } = await import('@/lib/api');
        const res = await authAPI.login({ email, mot_de_passe });
        const { token, user } = res.data;

        setCookie('guyagod_token', token, 7);
        localStorage.setItem('guyagod_token', token);

        set({ user, isAuthenticated: true, _hydrated: true });

        try {
          const { default: useFavorisStore } = await import('./useFavorisStore');
          useFavorisStore.getState().fetchFavoris(user.id);
        } catch {}
        return res;
      },

      register: async (data) => {
        const { authAPI } = await import('@/lib/api');
        return await authAPI.register(data);
      },

      logout: () => {
        deleteCookie('guyagod_token');
        localStorage.removeItem('guyagod_token');
        set({ user: null, isAuthenticated: false, _hydrated: true });
      },

      rehydrate: async () => {
        if (typeof window === 'undefined') return;
        if (get()._hydrated) return;

        const token = localStorage.getItem('guyagod_token') || getCookie('guyagod_token');

        if (!token) {
          set({ user: null, isAuthenticated: false, _hydrated: true });
          return;
        }

        if (!localStorage.getItem('guyagod_token')) localStorage.setItem('guyagod_token', token);
        if (!getCookie('guyagod_token')) setCookie('guyagod_token', token, 7);

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (res.status === 401 || res.status === 403) {
            deleteCookie('guyagod_token');
            localStorage.removeItem('guyagod_token');
            set({ user: null, isAuthenticated: false, _hydrated: true });
            return;
          }

          if (res.ok) {
            const data = await res.json();
            set({ user: data.data, isAuthenticated: true, _hydrated: true });
            try {
              const { default: useFavorisStore } = await import('./useFavorisStore');
              useFavorisStore.getState().fetchFavoris(data.data.id);
            } catch {}
          } else {
            set({ user: null, isAuthenticated: false, _hydrated: true });
          }
        } catch {
          set({ user: null, isAuthenticated: false, _hydrated: true });
        }
      },

      refreshUser: async () => {
        try {
          const { authAPI } = await import('@/lib/api');
          const res = await authAPI.me();
          set(s => ({ user: { ...s.user, ...res.data } }));
        } catch {}
      },

      isAdmin: () => get().user?.role_id === 1,
      isVendeur: () => get().user?.role_id === 2 || get().user?.role_id === 1,
    }),
    {
      name: 'Bazar Guyane-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;