import {
  IWishlistItem,
  IWishlistStoreActions,
  IWishlistStoreState,
} from "@/interfaces/WishlistStoreStateType"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { useLocaleStore } from "./localeStore"
import { API_URLS } from "@/app/Services/Urls"
import getAuthHeaders from "@/lib/getAuthHeaders"
import getAuthToken from "@/lib/getAuthToken"

/* ── Backend payload types ── */

type BackendWishlistItem = {
  id: number
  product_id: number
  product_variant_id: number | null
  qty: number
  price: number
  discount_price: number
  subtotal: number
  tax: number
  total: number
  is_available: boolean
  availability_message: string | null
  available_qty: number | null
}

type BackendWishlistPayload = {
  id: number
  user_id: number | null
  subtotal: number
  tax: number
  discount: number
  total: number
  wishlist_items: BackendWishlistItem[]
}

type BackendWishlistResponse = {
  success: boolean
  message: string
  data?: {
    wishlist?: BackendWishlistPayload
    id?: number
  }
}

/* ── Helpers ── */

const getLang = () => useLocaleStore.getState().lang ?? "en"

const sameSelection = (
  a: IWishlistItem["selection"],
  b: IWishlistItem["selection"]
) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {})

const emptyTotals = {
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
}

export const useWishlistStore = create<
  IWishlistStoreState & IWishlistStoreActions
>()(
  persist(
    (set, get): IWishlistStoreState & IWishlistStoreActions => ({
      wishlist: [],
      wishlistId: null,
      ...emptyTotals,
      hasHydrated: false,

      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),

      /* ───────────── Add ───────────── */
      addToWishlist: async (item: IWishlistItem) => {
        // Guest (local only)
        if (!getAuthToken()) {
          set((state) => {
            const existing = state.wishlist.find(
              (i) => i.id === item.id && sameSelection(i.selection, item.selection)
            )
            if (existing) return {}
            return { wishlist: [...state.wishlist, item] }
          })
          return
        }

        // Logged user (Laravel)
        try {
          const res = await fetch(
            API_URLS.WISHLIST.ADD_TO_WISHLIST(getLang()),
            {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                product_id: item?.id,
                product_variant_id: item.product_variant_id
                  ? String(item.product_variant_id)
                  : null,
                type: item.type,
                qty: item.qty,
                price: item.price,
                subtotal: item.subtotal,
                tax: item.tax,
                discount_price: item.discountPrice,
                total: item.total,
              }),
            }
          )

          if (!res.ok) {
            const errorText = await res.text()
            console.error("Wishlist add error:", errorText)
            throw new Error("Failed to add to wishlist")
          }

          const data = (await res.json()) as BackendWishlistResponse

          set((state) => {
            const newWishlistId =
              data.data?.id ?? data.data?.wishlist?.id ?? state.wishlistId
            const existing = state.wishlist.find(
              (i) => i.id === item.id && sameSelection(i.selection, item.selection)
            )
            if (existing) {
              return { wishlistId: newWishlistId }
            }
            return {
              wishlistId: newWishlistId,
              wishlist: [...state.wishlist, item],
            }
          })
        } catch (error) {
          console.error("Add to wishlist error:", error)
          throw error
        }
      },

      /* ───────────── Update (bulk) ───────────── */
      updateWishlist: async (newWishlist) => {
        if (!getAuthToken()) {
          set({ wishlist: newWishlist })
          return
        }

        try {
          const wishlistId = get().wishlistId
          if (!wishlistId) {
            await get().fetchWishlist()
            return
          }

          const current = get().wishlist
          const previousByItemId = new Map(
            current
              .filter((item) => item.cart_item_id)
              .map((item) => [String(item.cart_item_id), item.qty])
          )

          for (const item of newWishlist) {
            if (!item.cart_item_id) continue
            const oldQty = previousByItemId.get(String(item.cart_item_id))
            if (oldQty === item.qty) continue

            const res = await fetch(
              API_URLS.WISHLIST.UPDATE_WISHLIST(getLang(), wishlistId),
              {
                method: "PUT",
                headers: {
                  Accept: "application/json",
                  ...getAuthHeaders(),
                },
                body: JSON.stringify({
                  wishlist_item_id: Number(item.cart_item_id),
                  qty: Number(item.qty),
                }),
              }
            )

            const raw = await res.text()
            let payload: unknown = raw
            try {
              payload = JSON.parse(raw)
            } catch {}
            if (!res.ok) {
              console.error("Update wishlist error payload:", payload)
              const errMsg =
                typeof payload === "string"
                  ? payload
                  : (payload as { error?: string; message?: string })?.error ||
                    (payload as { message?: string })?.message ||
                    "Update wishlist failed"
              throw new Error(errMsg)
            }
          }

          await get().fetchWishlist()
        } catch (e) {
          console.error("Update wishlist failed", e)
        }
      },

      /* ───────────── Remove ───────────── */
      removeFromWishlist: async (wishlistItemId, selection) => {
        if (!getAuthToken()) {
          set((state) => ({
            wishlist: state.wishlist.filter(
              (item) =>
                !(
                  item.id === wishlistItemId &&
                  sameSelection(item.selection, selection as IWishlistItem["selection"])
                )
            ),
          }))
          return
        }

        try {
          const target = get().wishlist.find(
            (item) =>
              item.id === wishlistItemId &&
              sameSelection(item.selection, selection as IWishlistItem["selection"])
          )
          const serverItemId = target?.cart_item_id ?? wishlistItemId
          await fetch(
            API_URLS.WISHLIST.REMOVE_FROM_WISHLIST(getLang(), serverItemId),
            {
              method: "DELETE",
              headers: getAuthHeaders(),
            }
          )
          await get().fetchWishlist()
        } catch (e) {
          console.error("Remove from wishlist error:", e)
        }
      },

      /* ───────────── Fetch ───────────── */
      fetchWishlist: async () => {
        if (!getAuthToken()) return

        try {
          const wishlistId = get().wishlistId
          const url = wishlistId
            ? `${API_URLS.WISHLIST.GET_WISHLIST(getLang())}?wishlist_id=${wishlistId}`
            : API_URLS.WISHLIST.GET_WISHLIST(getLang())

          const res = await fetch(url, { headers: getAuthHeaders() })
          if (!res.ok) throw new Error("Failed to fetch wishlist")

          const data = (await res.json()) as BackendWishlistResponse
          const payload = data?.data?.wishlist
          if (!payload) {
            set({ wishlist: [], wishlistId: null, ...emptyTotals })
            return
          }

          set((state) => ({
            wishlistId: payload.id,
            subtotal: Number(payload.subtotal ?? 0),
            tax: Number(payload.tax ?? 0),
            discount: Number(payload.discount ?? 0),
            total: Number(payload.total ?? 0),
            wishlist: (payload.wishlist_items ?? []).map((i) => {
              const existing = state.wishlist.find(
                (x) =>
                  x.id === String(i.product_id) &&
                  String(x.product_variant_id ?? "") ===
                    String(i.product_variant_id ?? "")
              )
              return {
                id: String(i.product_id),
                cart_item_id: String(i.id),
                name: existing?.name ?? `#${i.product_id}`,
                type:
                  existing?.type ??
                  (i.product_variant_id ? "variable" : "simple"),
                qty: Number(i.qty),
                price: Number(i.price),
                discountPrice: Number(i.discount_price ?? 0),
                subtotal: Number(i.subtotal ?? 0),
                tax: Number(i.tax ?? 0),
                total: Number(i.total ?? 0),
                image: existing?.image ?? "",
                selection: existing?.selection,
                product_variant_id:
                  i.product_variant_id != null
                    ? String(i.product_variant_id)
                    : undefined,
                is_available: Boolean(i.is_available),
                availability_message: i.availability_message,
                available_qty:
                  i.available_qty != null ? Number(i.available_qty) : null,
              }
            }),
          }))
        } catch (e) {
          console.error("Fetch wishlist failed", e)
        }
      },

      /* ───────────── Clear ───────────── */
      clearWishlist: async () => {
        if (!getAuthToken()) {
          set({ wishlist: [], wishlistId: null, ...emptyTotals })
          return
        }

        try {
          await fetch(API_URLS.WISHLIST.CLEAR_WISHLIST(getLang()), {
            method: "DELETE",
            headers: getAuthHeaders(),
          })
          set({ wishlist: [], wishlistId: null, ...emptyTotals })
        } catch (e) {
          console.error("Clear wishlist error:", e)
        }
      },
    }),
    {
      name: "wishlist-storage",
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
