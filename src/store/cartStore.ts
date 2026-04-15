
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, size: string, color: string | undefined, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, size, color, quantity) => {
        const items = get().items;
        // Check if item already exists
        const existingItem = items.find(
          (item) => item.product_id === product.id && item.selected_size === size && item.selected_color === color
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: crypto.randomUUID(), // Temporary ID for local state
            user_id: 'guest', // Placeholder
            product_id: product.id,
            quantity,
            selected_size: size,
            selected_color: color,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product: product, // Store full product details for display
          };
          set({ items: [...items, newItem] });
        }
      },
      removeFromCart: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
        } else {
          set({
            items: get().items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + (item.product?.price || 0) * item.quantity,
          0
        ),
    }),
    {
      name: 'cart-storage',
    }
  )
);
