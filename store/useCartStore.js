import { create } from 'zustand';
import { panierAPI } from '@/lib/api';

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  loading: false,

  // ── Charger le panier depuis l'API ────────────────────────
  fetchCart: async () => {
    try {
      set({ loading: true });
      const res = await panierAPI.get();
      set({ items: res.data.items, total: res.data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  // ── Ajouter un produit ────────────────────────────────────
  addItem: async (produit_id, quantite = 1) => {
    const res = await panierAPI.add({ produit_id, quantite });
    const updated = await panierAPI.get();
    set({ items: updated.data.items, total: updated.data.total });
  },

  // ── Modifier quantité ─────────────────────────────────────
  updateItem: async (produit_id, quantite) => {
    await panierAPI.update(produit_id, quantite);
    const updated = await panierAPI.get();
    set({ items: updated.data.items, total: updated.data.total });
  },

  // ── Supprimer un item ─────────────────────────────────────
  removeItem: async (produit_id) => {
    await panierAPI.remove(produit_id);
    const updated = await panierAPI.get();
    set({ items: updated.data.items, total: updated.data.total });
  },

  // ── Vider le panier ───────────────────────────────────────
  clearCart: async () => {
    await panierAPI.vider();
    set({ items: [], total: 0 });
  },

  // ── Vider localement (après commande) ─────────────────────
  resetLocal: () => set({ items: [], total: 0 }),

  // ── Nombre total d'items ──────────────────────────────────
  itemCount: () => get().items.reduce((s, i) => s + i.quantite, 0),
}));

export default useCartStore;
