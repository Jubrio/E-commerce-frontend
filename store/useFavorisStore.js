'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { favorisAPI } from '@/lib/api';

const useFavorisStore = create(
  persist(
    (set, get) => ({
      favorisIds: [],

      fetchFavoris: async () => {
        try {
          const res = await favorisAPI.getAll();
          const ids = (res.data || []).map(f => f.id);
          set({ favorisIds: ids });
        } catch {}
      },

      isFavori: (produit_id) => {
        return get().favorisIds.includes(parseInt(produit_id));
      },

      toggleFavori: async (produit_id) => {
        const id = parseInt(produit_id);
        const isFav = get().favorisIds.includes(id);

        if (isFav) {
          set(s => ({ favorisIds: s.favorisIds.filter(x => x !== id) }));
          try { await favorisAPI.remove(id); }
          catch { set(s => ({ favorisIds: [...s.favorisIds, id] })); }
        } else {
          set(s => ({ favorisIds: [...s.favorisIds, id] }));
          try { await favorisAPI.add(id); }
          catch { set(s => ({ favorisIds: s.favorisIds.filter(x => x !== id) })); }
        }
      },

      clearFavoris: () => set({ favorisIds: [] }),
    }),
    {
      name: 'Bazar Guyane-favoris',
      partialize: (state) => ({ favorisIds: state.favorisIds }),
    }
  )
);

export default useFavorisStore;