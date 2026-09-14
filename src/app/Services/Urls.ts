const LARAVEL_API_ORIGIN = (
  process.env.LARAVEL_API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  "https://e-commerce-b4wa.onrender.com"
).replace(/\/$/, "");

/**
 * Resolve API base at call time (not module load).
 * Browser → same-origin `/api/v1` (Vercel rewrite → Laravel, no CORS).
 * Server → Laravel origin directly.
 */
function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    `${LARAVEL_API_ORIGIN}/api/v1`
  );
}

function getStorageBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_STORAGE_BASE_URL?.replace(/\/$/, "") ??
    `${LARAVEL_API_ORIGIN}/storage`
  );
}

export const API_URLS = {
  AUTHENTECATEION: {
    LOGIN: (lang: string = "en") => `${getApiBaseUrl()}/${lang}/login`,
    LOGOUT: (lang: string = "en") => `${getApiBaseUrl()}/${lang}/logout`,
    REGISTER: (lang: string = "en") => `${getApiBaseUrl()}/${lang}/register`,
  },
  CATEGORIES: {
    GET_CATEGORIES: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/categories`,
  },
  PRODUCTS: {
    GET_PRODUCTS: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/products`,
    GET_PRODUCT: (lang: string = "en", slug: string) =>
      `${getApiBaseUrl()}/${lang}/products/${slug}`,
  },
  PAGE_CONTENT: {
    GET_PAGE_CONTENT: (lang: string = "ar", page: string) =>
      `${getApiBaseUrl()}/${lang}/page-content/${page}`,
  },
  CART: {
    GET_CART: (lang: string = "en") => `${getApiBaseUrl()}/${lang}/cart`,
    ADD_TO_CART: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/cart/add`,
    REMOVE_FROM_CART: (lang: string = "en", cartItemId: string) =>
      `${getApiBaseUrl()}/${lang}/cart/remove-item/${cartItemId}`,
    UPDATE_CART: (lang: string = "en", cartId: string | number) =>
      `${getApiBaseUrl()}/${lang}/cart/update/${cartId}`,
    CLEAR_CART: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/cart/delete`,
  },
  WISHLIST: {
    GET_WISHLIST: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/wishlist`,
    ADD_TO_WISHLIST: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/wishlist/add`,
    REMOVE_FROM_WISHLIST: (lang: string = "en", wishlistItemId: string) =>
      `${getApiBaseUrl()}/${lang}/wishlist/remove-item/${wishlistItemId}`,
    UPDATE_WISHLIST: (lang: string = "en", wishlistId: string | number) =>
      `${getApiBaseUrl()}/${lang}/wishlist/update/${wishlistId}`,
    CLEAR_WISHLIST: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/wishlist/delete`,
  },
  ORDER: {
    GET_ALL_ORDERS: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/orders`,
    CREATE_ORDER: (lang: string = "en") =>
      `${getApiBaseUrl()}/${lang}/create-order`,
    CHECKOUT: (lang: string = "en", orderId: string | number) =>
      `${getApiBaseUrl()}/${lang}/orders/${orderId}/checkout`,
    UPDATE_ORDER: (lang: string = "en", orderId: string) =>
      `${getApiBaseUrl()}/${lang}/orders/${orderId}`,
    UPDATE_PAYMENT_STATUS: (lang: string = "en", orderId: string) =>
      `${getApiBaseUrl()}/${lang}/orders/${orderId}/update-payment-status`,
  },
  get BASE_URL() {
    return getApiBaseUrl();
  },
  get STORAGE_BASE_URL() {
    return getStorageBaseUrl();
  },
};
