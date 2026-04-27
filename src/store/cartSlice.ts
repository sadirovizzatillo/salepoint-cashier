import { StateCreator } from 'zustand';
import { Product, CartItem } from '../types';

export interface CartSlice {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const createCartSlice: StateCreator<any, [], [], CartSlice> = (set) => ({
  cart: [],

  addToCart: (product) =>
    set((state: CartSlice) => {
      // null stock means the product was never received into storage → 0 available
      const available = product.stock != null ? product.stock.quantityAvailable : 0;
      if (available <= 0) return state;
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= available) return state;
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    }),

  removeFromCart: (id) =>
    set((state: CartSlice) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  updateQuantity: (id, delta) =>
    set((state: CartSlice) => ({
      cart: state.cart.map((item) => {
        if (item.id !== id) return item;
        const available = item.stock != null ? item.stock.quantityAvailable : 0;
        return { ...item, quantity: Math.min(available, Math.max(1, item.quantity + delta)) };
      }),
    })),

  setQuantity: (id, quantity) =>
    set((state: CartSlice) => ({
      cart: state.cart.map((item) => {
        if (item.id !== id) return item;
        const available = item.stock != null ? item.stock.quantityAvailable : 0;
        return { ...item, quantity: Math.min(available, Math.max(1, quantity)) };
      }),
    })),

  clearCart: () => set({ cart: [] }),
});
