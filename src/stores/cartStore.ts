import { ICartItem, ICartStoreActions, ICartStoreState } from "@/interfaces/CartStoreStateType"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useAuthStore } from "./authStore"
import { useLocaleStore } from "./localeStore"
import { API_URLS } from "@/app/Services/Urls"
import getAuthHeaders from "@/lib/getAuthHeaders"
import getAuthToken from "@/lib/getAuthToken"


/* ── Helpers ── */

const getLang = () => useLocaleStore.getState().lang ?? "en"



export const useCartStore = create<ICartStoreState & ICartStoreActions>()(
  persist(
    (set, get): ICartStoreState & ICartStoreActions => ({  
      cart: [],
      cartId: null,
      hasHydrated: false,

      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),

  
    /* ───────────── Add ───────────── */
    addToCart: async (item: ICartItem) => {
      // Guest (local only)
      if (!getAuthToken()) {
        set((state) => {
          const existing = state.cart.find(
            (i) =>
              i.id === item.id &&
              i.selection?.product_variant_id === item.selection?.product_variant_id
          )

          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id &&
                JSON.stringify(i.selection) === JSON.stringify(item.selection)
                  ? { ...i, qty: i.qty + item.qty }
                  : i
              ),
            }
          }

          return { cart: [...state.cart, item] }
        })
        return
      }

      // Logged user (Laravel)
      try {
        const res = await fetch(API_URLS.CART.ADD_TO_CART(getLang()), {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            product_id: item?.id, // Always send product ID for reference
            product_variant_id: String(item.product_variant_id )|| null,
            type: item.type, // Use item.type instead of product.type
            qty: item.qty,
            price: item.price,
            subtotal: item.subtotal,
            tax: item.tax,
            discount_price: item.discountPrice,
            total: item.total,
          }),
        })

        
        if (!res.ok) {
          const errorText = await res.text();
           console.error('Error response:', errorText);
          throw new Error("Failed to add to cart")
        }

        const data = await res.json()
  
        // Optionally update local cart state
        set((state) => {
          const newCartId = data.data?.id || state.cartId;
          const existing = state.cart.find(
            (i) =>
              i.id === item.id &&
              JSON.stringify(i.selection) === JSON.stringify(item.selection)
          )

          if (existing) {
            return {
              cartId: newCartId,
              cart: state.cart.map((i) =>
                i.id === item.id &&
                JSON.stringify(i.selection) === JSON.stringify(item.selection)
                  ? { ...i, qty: i.qty + item.qty }
                  : i
              ),
            }
          }


          return { cart: [...state.cart, item] ,cartId: newCartId}
        })
      } catch (error) {
        console.error("Add to cart error:", error)
        throw error
      }
    },

      /* ───────────── Update Cart ───────────── */
      updateCart: async (newCart) => {
        // guest
        if (!getAuthToken()) {
          set({ cart: newCart })
          return
        }

        try {
          await fetch(API_URLS.CART.UPDATE_CART(getLang()), {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              items: newCart.map((item) => ({
                product_id: item.id,
                qty: item.qty,
              })),
            }),
          })

          //  sync بعد التحديث
          get().fetchCart()
        } catch (e) {
          console.error("Update cart failed", e)
        }
      },

      /* ───────────── Remove ───────────── */
      removeFromCart: async (cartItemId, selection) => {
        console.log(cartItemId)
        if (!getAuthToken()) {
          set((state) => ({
            cart: state.cart.filter(
              (item) =>
                !(
                  item.id === cartItemId &&
                  JSON.stringify(item.selection) === JSON.stringify(selection)
                )
            ),
          }))
          return
        }

        try {
          await fetch(API_URLS.CART.REMOVE_FROM_CART(getLang(),cartItemId), {
            method: "DELETE",
            headers: getAuthHeaders(),
          })

          // refetch cart
          get().fetchCart()
        } catch (e) {
          console.error(e)
        }
      },

      /* ───────────── Fetch Cart ───────────── */
      fetchCart: async () => {
        if (!getAuthToken()) return

        try {
          const res = await fetch(API_URLS.CART.GET_CART(getLang()), {
            headers: getAuthHeaders(),
          })

          const data = await res.json()
          console.log('cart info' , data?.data)

          set({
            cartId: data.data.id,
            cart: data.data.cart_items.map((i: any) => ({
              id: i.product.id,
              name: i.product.name,
              qty: i.qty,
              price: i.price,
            })),
          })
        } catch (e) {
          console.error("Fetch cart failed", e)
        }
      },

      /* ───────────── Clear ───────────── */
 clearCart: async () => {
  const cartId = get().cartId; 
  console.log('Cart ID:', cartId)

  if (!getAuthToken()) {
    set({ cart: [], cartId: null })
    return
  }

  try {
    await fetch(API_URLS.CART.CLEAR_CART(getLang()), {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    set({ cart: [], cartId: null })
  } catch (e) {
    console.error(e)
  }
},

      /* ───────────── Increment ───────────── */
      incrementQuantity: async (productId) => {
        if (!getAuthToken()) {
          set((state) => ({
            cart: state.cart.map((item) =>
              item.id === productId ? { ...item, qty: item.qty + 1 } : item
            ),
          }))
          return
        }

        try {
          await fetch(API_URLS.CART.UPDATE_CART(getLang()), {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              product_id: productId,
              action: "increment",
            }),
          })

          get().fetchCart()
        } catch (e) {
          console.error(e)
        }
      },

      /* ───────────── Decrement ───────────── */
      decrementQuantity: async (productId) => {
        if (!getAuthToken()) {
          set((state) => ({
            cart: state.cart
              .map((item) =>
                item.id === productId ? { ...item, qty: item.qty - 1 } : item
              )
              .filter((i) => i.qty > 0),
          }))
          return
        }

        try {
          await fetch(API_URLS.CART.UPDATE_CART(getLang()), {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              product_id: productId,
              action: "decrement",
            }),
          })

          get().fetchCart()
        } catch (e) {
          console.error(e)
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)