/**
 * Local leather product imagery — used as CMS/hero fallbacks and when the API
 * still points at placeholder hosts (loremflickr, picsum, etc.).
 */

export const LEATHER_HERO = "/leather/hero.webp";

export const LEATHER_COLLECTION = "/leather/collection-1.jpg";

export const LEATHER_PRODUCT_IMAGES = [
  "/leather/bag-1.jpg",
  "/leather/bag-2.jpg",
  "/leather/bag-3.jpg",
  "/leather/bag-4.jpg",
  "/leather/bag-5.jpg",
  "/leather/wallet-1.jpg",
  "/leather/belt-1.jpg",
  "/leather/belts.jpg",
  "/leather/card-holder-1.jpg",
  "/leather/leather.jpg",
  "/leather/free-leather-keyring-mockups.jpg",
  "/leather/collection-1.jpg",
] as const;

/** Stable secondary-banner slots (bags / wallets / belts / craft). */
export const LEATHER_BANNER_SLOTS = {
  part1: "/leather/bag-1.jpg",
  part2: "/leather/wallet-1.jpg",
  part3: "/leather/belt-1.jpg",
  feature: "/leather/collection-1.jpg",
} as const;

export function isPlaceholderImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    /loremflickr\.com|picsum\.photos|placehold\.co|placeholder\.com|via\.placeholder\.com|source\.unsplash\.com/i.test(
      lower,
    ) ||
    // generic unsplash seed photos that are not leather store uploads
    (/images\.unsplash\.com/i.test(lower) &&
      !/leather|bag|wallet|belt|brown|tan/i.test(lower))
  );
}

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Pick a deterministic leather product image from a product id / slug / path. */
export function leatherImageForKey(key?: string | null): string {
  if (!key?.trim()) return LEATHER_PRODUCT_IMAGES[0];
  const idx = hashKey(key.trim()) % LEATHER_PRODUCT_IMAGES.length;
  return LEATHER_PRODUCT_IMAGES[idx];
}

/**
 * Prefer a real leather asset when CMS/API still serves placeholders or empty paths.
 */
export function resolveLeatherAwareUrl(
  path: string | null | undefined,
  options?: { fallback?: string; key?: string },
): string {
  const fallback =
    options?.fallback ??
    (options?.key ? leatherImageForKey(options.key) : LEATHER_PRODUCT_IMAGES[0]);

  if (!path?.trim()) return fallback;

  // Already a local leather / public asset
  if (path.startsWith("/leather/") || path.startsWith("/_next/")) {
    return path;
  }

  if (isPlaceholderImageUrl(path)) {
    return options?.key ? leatherImageForKey(options.key) : fallback;
  }

  return path;
}
