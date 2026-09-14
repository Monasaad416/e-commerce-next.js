const LARAVEL_API_ORIGIN = (
  process.env.LARAVEL_API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  "https://e-commerce-b4wa.onrender.com"
).replace(/\/$/, "");

/**
 * Browser: same-origin `/api/v1` (rewritten to Laravel in next.config).
 * Server (RSC/ISR): call Laravel origin directly.
 */
const API_BASE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/v1`
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? `${LARAVEL_API_ORIGIN}/api/v1`);

const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? `${LARAVEL_API_ORIGIN}/storage`;

export const API_URLS = {
  AUTHENTECATEION: {
    LOGIN: (lang: string = "en") => `${API_BASE_URL}/${lang}/login`,
    LOGOUT: (lang: string = "en") => `${API_BASE_URL}/${lang}/logout`,
    REGISTER: (lang: string = "en") => `${API_BASE_URL}/${lang}/register`,
  },
  CATEGORIES: {
    GET_CATEGORIES: (lang: string = "en") =>
      `${API_BASE_URL}/${lang}/categories`,
  },
  PRODUCTS: {
    GET_PRODUCTS: (lang: string = "en") => `${API_BASE_URL}/${lang}/products`,
    GET_PRODUCT: (lang: string = "en", slug: string) =>
      `${API_BASE_URL}/${lang}/products/${slug}`,
  },
  PAGE_CONTENT: {
    GET_PAGE_CONTENT: (lang: string = "ar", page: string) =>
      `${API_BASE_URL}/${lang}/page-content/${page}`,
  },
  CART: {
    GET_CART: (lang: string = "en") => `${API_BASE_URL}/${lang}/cart`,
    ADD_TO_CART: (lang: string = "en") => `${API_BASE_URL}/${lang}/cart/add`,
    REMOVE_FROM_CART: (lang: string = "en", cartItemId: string) =>
      `${API_BASE_URL}/${lang}/cart/remove-item/${cartItemId}`,
    UPDATE_CART: (lang: string = "en", cartId: string | number) =>
      `${API_BASE_URL}/${lang}/cart/update/${cartId}`,
    CLEAR_CART: (lang: string = "en") => `${API_BASE_URL}/${lang}/cart/delete`,
  },
  WISHLIST: {
    GET_WISHLIST: (lang: string = "en") => `${API_BASE_URL}/${lang}/wishlist`,
    ADD_TO_WISHLIST: (lang: string = "en") =>
      `${API_BASE_URL}/${lang}/wishlist/add`,
    REMOVE_FROM_WISHLIST: (lang: string = "en", wishlistItemId: string) =>
      `${API_BASE_URL}/${lang}/wishlist/remove-item/${wishlistItemId}`,
    UPDATE_WISHLIST: (lang: string = "en", wishlistId: string | number) =>
      `${API_BASE_URL}/${lang}/wishlist/update/${wishlistId}`,
    CLEAR_WISHLIST: (lang: string = "en") =>
      `${API_BASE_URL}/${lang}/wishlist/delete`,
  },
  ORDER: {
    GET_ALL_ORDERS: (lang: string = "en") => `${API_BASE_URL}/${lang}/orders`,
    CREATE_ORDER: (lang: string = "en") =>
      `${API_BASE_URL}/${lang}/create-order`,
    CHECKOUT: (lang: string = "en", orderId: string | number) =>
      `${API_BASE_URL}/${lang}/orders/${orderId}/checkout`,
    UPDATE_ORDER: (lang: string = "en", orderId: string) =>
      `${API_BASE_URL}/${lang}/orders/${orderId}`,
    UPDATE_PAYMENT_STATUS: (lang: string = "en", orderId: string) =>
      `${API_BASE_URL}/${lang}/orders/${orderId}/update-payment-status`,
  },
  BASE_URL: API_BASE_URL,
  STORAGE_BASE_URL: STORAGE_BASE_URL,
};
