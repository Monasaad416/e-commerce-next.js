import products from '@/data/products';
import { ICartItem, ICartStoreActions, ICartStoreState } from '@/interfaces/CartStoreStateType';
import { array } from 'zod';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export const useCartStore = create<ICartStoreState & ICartStoreActions>()(
  persist(
    
    (set) => ({
      cart: [],
      hasHydrated:false,
// In your cart store
addToCart: (item) => {
    set((state) => {
        const existingItem = state.cart.find(
            (i) => i.id === item.id && 
                  i.selection === item.selection
        );
        
        if (existingItem) {
            // If item exists, update qty
            return {
                cart: state.cart.map((i) =>
                      i.id === item.id && 
                      i.selection === item.selection
                        ? { ...i, qty: i.qty + item.qty }
                        : i
                ),
            };
        }
        
        // If item doesn't exist, add it to cart
        return {
            cart: [...state.cart, { ...item }],
        };
    });
},
      removeFromCart: (productId: string) => 
        set((state) => {
          const product = state.cart.find(item => item.id === productId);
          const itemToRemove = state.cart.find(item => item.id === productId && item.selection === product?.selection);
          if (!itemToRemove) return { cart: state.cart };
          
          return {
            cart: state.cart.filter(item => 
              !(item.id === productId && 
                item.selection === itemToRemove.selection)
            )
          };
        }),
      updateCart: (newCart: ICartItem[]) => 
        set({ cart: newCart }),
      clearCart: () => 
        set({ cart: [] }),
          incrementQuantity: (productId: string, selection:object) => 
            set((state) => {
              const updatedCart = [...state.cart];
              const itemIndex = updatedCart.findIndex(item => 
                item.id === productId && 
                item.selection === selection
              );
              if (itemIndex >= 0) {
                updatedCart[itemIndex] = {
                  ...updatedCart[itemIndex],
                  qty: updatedCart[itemIndex].qty + 1
                };
              }
              return { cart: updatedCart };
            }),

          decrementQuantity: (productId: string, selection:object) => 
            set((state) => {
              const updatedCart = [...state.cart];
              const itemIndex = updatedCart.findIndex(item => 
                item.id === productId && 
                    item.selection === selection
              );
              if (itemIndex >= 0) {
                const newQuantity = updatedCart[itemIndex].qty - 1;
                if (newQuantity <= 0) {
                  updatedCart.splice(itemIndex, 1);
                } else {
                  updatedCart[itemIndex] = {
                    ...updatedCart[itemIndex],
                    qty: newQuantity
                  };
                }
              }
              return { cart: updatedCart };
            }),
    }),
    
  {
    name: 'cart-storage',
    storage: createJSONStorage(() => localStorage),
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.hasHydrated = true;
      }
    }
  }
  )
);