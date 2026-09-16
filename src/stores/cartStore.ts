import { ICartItem, ICartStoreActions, ICartStoreState } from "@/interfaces/CartStoreStateType"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useLocaleStore } from "./localeStore"
import { API_URLS } from "@/app/Services/Urls"
import getAuthHeaders from "@/lib/getAuthHeaders"
import getAuthToken from "@/lib/getAuthToken"
import { BackendApiMessage, BackendCartItem, BackendCartPayload, BackendCartResponse } from "@/types/cart"
import { getCartUnitPrice } from "@/lib/cartPricing"
import { resolveImageUrl } from "@/lib/media"



function parseApiResponseText(raw: string): string | BackendApiMessage {
  if (!raw.trim()) return raw
  try {
    return JSON.parse(raw) as BackendApiMessage
  } catch {
    return raw
  }
}

function apiErrorMessage(payload: string | BackendApiMessage, fallback: string): string {
  if (typeof payload === "string") return payload || fallback
  return payload.error ?? payload.message ?? fallback
}

function buildAddToCartPayload(item: ICartItem) {
  const variantId =
    item.product_variant_id ??
    (item.selection?.product_variant_id != null
      ? String(item.selection.product_variant_id)
      : null)

  const discountPrice = Number(item.discountPrice ?? 0)
  const qty = Number(item.qty) || 1
  const unitPrice = getCartUnitPrice(item)

  return {
    product_id: Number(item.id),
    product_variant_id: variantId ? Number(variantId) : null,
    type: item.type,
    qty,
    price: unitPrice,
    discount_price: discountPrice,
    subtotal: Number(item.subtotal ?? unitPrice * qty),
    tax: Number(item.tax ?? 0),
    total: Number(item.total ?? unitPrice * qty),
  }
}

function mapBackendCartItems(
  items: BackendCartItem[],
  existingCart: ICartItem[]
): ICartItem[] {
  return items.map((i) => {
    const existing = existingCart.find(
      (x) =>
        x.id === String(i.product_id) &&
        String(x.product_variant_id ?? "") === String(i.product_variant_id ?? "")
    )
    return {
      id: String(i.product_id),
      cart_item_id: String(i.id),
      name: existing?.name ?? i.name ?? `#${i.product_id}`,
      slug: existing?.slug,
      type: existing?.type ?? (i.product_variant_id ? "variable" : "simple"),
      qty: Number(i.qty),
      price: Number(i.price),
      discountPrice: Number(i.discount_price ?? 0),
      subtotal: Number(i.subtotal ?? 0),
      tax: Number(i.tax ?? 0),
      total: Number(i.total ?? 0),
      image: resolveImageUrl(existing?.image || i.image || "", {
        key: existing?.slug || String(i.product_id),
      }),
      selection: existing?.selection
        ? {
            ...existing.selection,
            image: resolveImageUrl(
              existing.selection.image || existing.image || i.image || "",
              { key: existing?.slug || String(i.product_id) },
            ),
          }
        : existing?.selection,
      product_variant_id:
        i.product_variant_id != null ? String(i.product_variant_id) : undefined,
      is_available: Boolean(i.is_available),
      availability_message: i.availability_message,
      available_qty: i.available_qty != null ? Number(i.available_qty) : null,
    }
  })
}

function applyBackendCart(
  newCart: BackendCartPayload,
  existingCart: ICartItem[]
): Pick<
  ICartStoreState,
  "cartId" | "cart" | "subtotal" | "tax" | "discount" | "total"
> {
  const mappedCart = mapBackendCartItems(newCart.cart_items, existingCart)
  const availableCart = mappedCart.filter((item) => item.is_available !== false)

  if (mappedCart.length !== availableCart.length) {
    console.warn(
      "Removed unavailable cart items from local cart state",
      mappedCart.filter((item) => item.is_available === false).map((item) => ({
        id: item.id,
        cart_item_id: item.cart_item_id,
        name: item.name,
      }))
    )
  }

  return {
    cartId: newCart.id,
    subtotal: Number(newCart.subtotal ?? 0),
    tax: Number(newCart.tax ?? 0),
    discount: Number(newCart.discount ?? 0),
    total: Number(newCart.total ?? 0),
    cart: availableCart,
  }
}


/* ── Helpers ── */

const getLang = () => useLocaleStore.getState().lang ?? "en"



export const useCartStore = create<ICartStoreState & ICartStoreActions>()(
  persist(
    (set, get): ICartStoreState & ICartStoreActions => ({  
      cart: [],
      cartId: null,
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
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

        // Logged user 
        try {
          const payload = buildAddToCartPayload(item)

          const res = await fetch(API_URLS.CART.ADD_TO_CART(getLang()), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
          })

          const raw = await res.text()
          const data = parseApiResponseText(raw) as string | BackendCartResponse

          if (!res.ok) {
            console.error("Error response:", raw)
            console.error("Sent payload:", payload)
            throw new Error(
              apiErrorMessage(
                typeof data === "string" ? data : (data as BackendApiMessage),
                "Failed to add to cart"
              )
            )
          }

          const parsed = (typeof data === "string" ? JSON.parse(data) : data) as BackendCartResponse
          const newCart = parsed.data?.cart

          if (newCart) {
            set((state) => ({
              ...applyBackendCart(newCart, [...state.cart, item]),
            }))
            return
          }

          set((state) => {
            const newCartId = parsed.data?.id ?? state.cartId
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

            return { cart: [...state.cart, item], cartId: newCartId }
          })
        } catch (error) {
          console.error("Add to cart error:", error)
          throw error
        }
      },

      /* ───────────── Update Cart ───────────── */
      updateCart: async (newCart: ICartItem[]) => {
        // guest
        if (!getAuthToken()) {
          set({ cart: newCart })
          return
        }

        try {
          const cartId = get().cartId
          if (!cartId) {
            await get().fetchCart()
            return
          }

          const current = get().cart
          const previousByCartItemId = new Map(
            current
              .filter((item) => item.cart_item_id)
              .map((item) => [String(item.cart_item_id), item.qty])
          )

          // Backend contract: PUT /cart/update/{cart} with { cart_item_id, qty }
          for (const item of newCart) {
            if (!item.cart_item_id) continue
            const oldQty = previousByCartItemId.get(String(item.cart_item_id))
            if (oldQty === item.qty) continue



            const res = await fetch(API_URLS.CART.UPDATE_CART(getLang(), cartId), {
              method: "PUT",
              headers: {
                "Accept": "application/json",
                ...getAuthHeaders(), 
              },
              body: JSON.stringify({
                cart_item_id: Number(item.cart_item_id),
                qty: Number(item.qty),
              }),
            })

           
              const raw = await res.text()
              const payload = parseApiResponseText(raw)
              if (!res.ok) {
                console.error("Update cart error payload:", payload)
                throw new Error(apiErrorMessage(payload, "Update cart failed"))
              }
          
          }

          // sync after updates
          get().fetchCart()
        } catch (e) {
          console.error("Update cart failed", e)
        }
      },

      /* ───────────── Remove ───────────── */
      removeFromCart: async (cartItemId, selection) => {
        const matches = (item: ICartItem) =>
          item.id === cartItemId &&
          JSON.stringify(item.selection ?? {}) === JSON.stringify(selection ?? {})

        const previousCart = get().cart
        const target = previousCart.find(matches)
        const nextCart = previousCart.filter((item) => !matches(item))

        // Optimistic local removal — works for guests and logged-in users.
        set({ cart: nextCart })

        // Guest users: nothing else to do.
        if (!getAuthToken()) return

        try {
          // Prefer the server's cart_item_id; fall back to the passed id.
          const serverCartItemId = target?.cart_item_id ?? cartItemId
          const res = await fetch(
            API_URLS.CART.REMOVE_FROM_CART(getLang(), serverCartItemId),
            {
              method: "DELETE",
              headers: getAuthHeaders(),
            }
          )

          if (!res.ok) {
            // Roll back and surface the reason so it doesn't fail silently.
            const text = await res.text().catch(() => "")
            console.error("Remove from cart failed:", res.status, text)
            set({ cart: previousCart })
            return
          }

          // Sync totals (subtotal / tax / total) from backend — non-blocking for UI.
          get().fetchCart()
        } catch (e) {
          console.error("Remove from cart error:", e)
          set({ cart: previousCart })
        }
      },

      /* ───────────── Fetch Cart ───────────── */
      fetchCart: async () => {
        if (!getAuthToken()) return

        try {
          // Laravel: GET /cart (current user cart) — not GET /cart/{id}
          const res = await fetch(API_URLS.CART.GET_CART(getLang()), {
            headers: getAuthHeaders({ json: false }),
          })

          if (!res.ok) {
            const text = await res.text().catch(() => "")
            console.error("Fetch cart failed response:", {
              url: res.url,
              status: res.status,
              statusText: res.statusText,
              body: text,
            })
            if (res.status === 404) {
              set({ cart: [], cartId: null, subtotal: 0, tax: 0, discount: 0, total: 0 })
            }
            throw new Error("Failed to fetch cart")
          }

          const data = (await res.json()) as BackendCartResponse
          const newCart = data?.data?.cart
          if (!newCart) {
            set({ cart: [], cartId: null, subtotal: 0, tax: 0, discount: 0, total: 0 })
            return
          }

          set((state) => applyBackendCart(newCart, state.cart))
        } catch (e) {
          console.error("Fetch cart failed", e)
        }
      },

      /* ───────────── Clear ───────────── */
      clearCart: async () => {
        const cartId = get().cartId; 
        console.log('Cart ID:', cartId)

        if (!getAuthToken()) {
          set({ cart: [], cartId: null, subtotal: 0, tax: 0, discount: 0, total: 0 })
          return
        }

        try {
          await fetch(API_URLS.CART.CLEAR_CART(getLang()), {
            method: "DELETE",
            headers: getAuthHeaders(),
          })

          set({ cart: [], cartId: null, subtotal: 0, tax: 0, discount: 0, total: 0 })
        } catch (e) {
          console.error(e)
        }
      },

      /* ───────────── Increment ───────────── */
      incrementQuantity: async (productId, selection) => {
        if (!getAuthToken()) {
          set((state) => ({
            cart: state.cart.map((item) =>
              item.id === productId &&
              JSON.stringify(item.selection ?? {}) === JSON.stringify(selection ?? {})
                ? { ...item, qty: item.qty + 1 }
                : item
            ),
          }))
          return
        }

        try {
          const current = get().cart
          const newCart = current.map((item) =>
            item.id === productId &&
            JSON.stringify(item.selection ?? {}) === JSON.stringify(selection ?? {})
              ? { ...item, qty: item.qty + 1 }
              : item
          )
          await get().updateCart(newCart)
        } catch (e) {
          console.error(e)
        }
      },

      /* ───────────── Decrement ───────────── */
      decrementQuantity: async (productId, selection) => {
        if (!getAuthToken()) {
          set((state) => ({
            cart: state.cart
              .map((item) =>
                item.id === productId &&
                JSON.stringify(item.selection ?? {}) === JSON.stringify(selection ?? {})
                  ? { ...item, qty: item.qty - 1 }
                  : item
              )
              .filter((i) => i.qty > 0),
          }))
          return
        }

        try {
          const current = get().cart
          const newCart = current
            .map((item) =>
              item.id === productId &&
              JSON.stringify(item.selection ?? {}) === JSON.stringify(selection ?? {})
                ? { ...item, qty: item.qty - 1 }
                : item
            )
            .filter((i) => i.qty > 0)
          await get().updateCart(newCart)
        } catch (e) {
          console.error(e)
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      onRehydrateStorage: () => (state) => {
        // Defer so subscribed components aren't updated before mount (React 19).
        queueMicrotask(() => {
          state?.setHasHydrated(true)
        })
      },
    }
  )
)