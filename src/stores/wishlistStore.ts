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
  name?: string
  image?: string
  qty: number
  price: number
  discount_price?: number
  subtotal?: number
  tax?: number
  total?: number
  is_available?: boolean
  availability_message?: string | null
  available_qty?: number | null
  product?: {
    name?: string
    image?: string
  }
}

type BackendWishlistPayload = {
  id: number
  user_id?: number | null
  subtotal?: number
  tax?: number
  discount?: number
  total?: number
  wishlist_items?: BackendWishlistItem[]
  items?: BackendWishlistItem[]
}

type BackendWishlistResponse = {
  success?: boolean
  message?: string
  data?: {
    wishlist?: BackendWishlistPayload
    id?: number
    wishlist_items?: BackendWishlistItem[]
    items?: BackendWishlistItem[]
  } & Partial<BackendWishlistPayload>
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function extractWishlistPayload(
  data: BackendWishlistResponse
): BackendWishlistPayload | null {
  const root = asRecord(data.data)
  if (!root) return null

  const nested = asRecord(root.wishlist)
  if (nested && ("wishlist_items" in nested || "items" in nested || "id" in nested)) {
    return nested as unknown as BackendWishlistPayload
  }

  if ("wishlist_items" in root || "items" in root || "id" in root) {
    return root as unknown as BackendWishlistPayload
  }

  return null
}

function mapBackendItems(
  items: BackendWishlistItem[],
  existing: IWishlistItem[]
): IWishlistItem[] {
  return items.map((i) => {
    const existingItem = existing.find(
      (x) =>
        x.id === String(i.product_id) &&
        String(x.product_variant_id ?? "") === String(i.product_variant_id ?? "")
    )
    return {
      id: String(i.product_id),
      cart_item_id: String(i.id),
      name:
        existingItem?.name ||
        i.name ||
        i.product?.name ||
        `#${i.product_id}`,
      type:
        existingItem?.type ?? (i.product_variant_id ? "variable" : "simple"),
      qty: Number(i.qty ?? 1),
      price: Number(i.price ?? 0),
      discountPrice: Number(i.discount_price ?? 0),
      subtotal: Number(i.subtotal ?? 0),
      tax: Number(i.tax ?? 0),
      total: Number(i.total ?? i.price ?? 0),
      image: existingItem?.image || i.image || i.product?.image || "",
      slug: existingItem?.slug,
      selection: existingItem?.selection,
      product_variant_id:
        i.product_variant_id != null ? String(i.product_variant_id) : undefined,
      is_available: i.is_available !== false,
      availability_message: i.availability_message ?? null,
      available_qty: i.available_qty != null ? Number(i.available_qty) : null,
    }
  })
}

function applyBackendWishlist(
  payload: BackendWishlistPayload,
  existing: IWishlistItem[]
): Pick<
  IWishlistStoreState,
  "wishlistId" | "wishlist" | "subtotal" | "tax" | "discount" | "total"
> {
  const items = payload.wishlist_items ?? payload.items ?? []
  return {
    wishlistId: payload.id,
    subtotal: Number(payload.subtotal ?? 0),
    tax: Number(payload.tax ?? 0),
    discount: Number(payload.discount ?? 0),
    total: Number(payload.total ?? 0),
    wishlist: mapBackendItems(items, existing),
  }
}

function buildAddPayload(item: IWishlistItem) {
  const variantId =
    item.product_variant_id ??
    (item.selection?.product_variant_id != null
      ? String(item.selection.product_variant_id)
      : null)
  const qty = Number(item.qty) || 1
  const price = Number(item.price) || 0
  const discountPrice = Number(item.discountPrice ?? 0)

  return {
    product_id: Number(item.id),
    product_variant_id: variantId ? Number(variantId) : null,
    type: item.type,
    qty,
    price,
    discount_price: discountPrice,
    subtotal: Number(item.subtotal ?? price * qty),
    tax: Number(item.tax ?? 0),
    total: Number(item.total ?? price * qty),
  }
}

function addLocalItem(
  set: (
    partial:
      | Partial<IWishlistStoreState>
      | ((state: IWishlistStoreState) => Partial<IWishlistStoreState>)
  ) => void,
  item: IWishlistItem
) {
  set((state) => {
    const existing = state.wishlist.find(
      (i) => i.id === item.id && sameSelection(i.selection, item.selection)
    )
    if (existing) return {}
    return { wishlist: [...state.wishlist, item] }
  })
}

function isRouteMissing(status: number, body: string) {
  return (
    status === 404 ||
    /could not be found/i.test(body) ||
    /route .* not found/i.test(body)
  )
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

      isInWishlist: (productId, selection) => {
        return get().wishlist.some(
          (item) =>
            item.id === String(productId) &&
            sameSelection(item.selection, selection)
        )
      },

      /* ───────────── Add ───────────── */
      addToWishlist: async (item: IWishlistItem) => {
        if (!getAuthToken()) {
          addLocalItem(set, item)
          return
        }

        try {
          const res = await fetch(API_URLS.WISHLIST.ADD_TO_WISHLIST(getLang()), {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(buildAddPayload(item)),
          })

          const errorText = res.ok ? "" : await res.text().catch(() => "")

          // Laravel wishlist routes not on Render yet → local fallback
          if (!res.ok && isRouteMissing(res.status, errorText)) {
            addLocalItem(set, item)
            return
          }

          if (!res.ok) {
            throw new Error(errorText.trim() || "Failed to add to wishlist")
          }

          const data = (await res.json()) as BackendWishlistResponse
          const payload = extractWishlistPayload(data)

          if (payload) {
            set((state) => ({
              ...applyBackendWishlist(payload, [...state.wishlist, item]),
            }))
            return
          }

          set((state) => {
            const newWishlistId =
              data.data?.id ?? data.data?.wishlist?.id ?? state.wishlistId
            const existing = state.wishlist.find(
              (i) =>
                i.id === item.id && sameSelection(i.selection, item.selection)
            )
            if (existing) return { wishlistId: newWishlistId }
            return {
              wishlistId: newWishlistId,
              wishlist: [...state.wishlist, item],
            }
          })
          await get().fetchWishlist()
        } catch (error) {
          addLocalItem(set, item)
          console.warn("Wishlist API unavailable; saved locally.", error)
        }
      },

      /* ───────────── Update (local only) ───────────── */
      updateWishlist: async (newWishlist) => {
        set({ wishlist: newWishlist })
      },

      /* ───────────── Remove ───────────── */
      removeFromWishlist: async (productId, selection) => {
        const matches = (item: IWishlistItem) =>
          item.id === String(productId) &&
          sameSelection(item.selection, selection as IWishlistItem["selection"])

        const previous = get().wishlist
        const target = previous.find(matches)
        set({ wishlist: previous.filter((item) => !matches(item)) })

        if (!getAuthToken()) return

        try {
          const url = target?.cart_item_id
            ? API_URLS.WISHLIST.REMOVE_FROM_WISHLIST(
                getLang(),
                target.cart_item_id,
              )
            : API_URLS.WISHLIST.REMOVE_BY_PRODUCT(getLang(), productId)

          const res = await fetch(url, {
            method: "DELETE",
            headers: getAuthHeaders(),
          })

          const text = res.ok ? "" : await res.text().catch(() => "")
          if (!res.ok && isRouteMissing(res.status, text)) return

          if (!res.ok) {
            console.error("Remove from wishlist failed:", res.status, text)
            set({ wishlist: previous })
            return
          }

          await get().fetchWishlist()
        } catch (e) {
          console.warn("Wishlist remove API unavailable; kept local change.", e)
        }
      },

      /* ───────────── Fetch ───────────── */
      fetchWishlist: async () => {
        if (!getAuthToken()) return

        try {
          const res = await fetch(API_URLS.WISHLIST.GET_WISHLIST(getLang()), {
            headers: getAuthHeaders({ json: false }),
          })

          // Routes not deployed — keep localStorage wishlist
          if (res.status === 404) return

          if (!res.ok) {
            throw new Error("Failed to fetch wishlist")
          }

          const data = (await res.json()) as BackendWishlistResponse
          const payload = extractWishlistPayload(data)

          if (!payload) return

          set((state) => applyBackendWishlist(payload, state.wishlist))
        } catch (e) {
          console.warn("Fetch wishlist failed; keeping local wishlist.", e)
        }
      },

      /* ───────────── Clear ───────────── */
      clearWishlist: async () => {
        const previous = get().wishlist
        set({ wishlist: [], wishlistId: null, ...emptyTotals })

        if (!getAuthToken()) return

        try {
          for (const item of previous) {
            const url = item.cart_item_id
              ? API_URLS.WISHLIST.REMOVE_FROM_WISHLIST(
                  getLang(),
                  item.cart_item_id,
                )
              : API_URLS.WISHLIST.REMOVE_BY_PRODUCT(getLang(), item.id)

            const res = await fetch(url, {
              method: "DELETE",
              headers: getAuthHeaders(),
            })

            const text = res.ok ? "" : await res.text().catch(() => "")
            if (!res.ok && isRouteMissing(res.status, text)) continue

            if (!res.ok) {
              console.error("Clear wishlist item failed:", res.status, text)
            }
          }
        } catch (e) {
          console.warn("Clear wishlist API unavailable; cleared locally.", e)
        }
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      onRehydrateStorage: () => (state) => {
        queueMicrotask(() => {
          state?.setHasHydrated(true)
        })
      },
    }
  )
)
