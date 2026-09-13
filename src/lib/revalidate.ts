/** Shared ISR timings (seconds). Override via env without code changes. */

export const PRODUCTS_REVALIDATE_SECONDS =
  Number(process.env.PRODUCTS_REVALIDATE_SECONDS) >= 0
    ? Number(process.env.PRODUCTS_REVALIDATE_SECONDS)
    : 120;

export const PAGE_CONTENT_REVALIDATE_SECONDS =
  Number(process.env.PAGE_CONTENT_REVALIDATE_SECONDS) >= 0
    ? Number(process.env.PAGE_CONTENT_REVALIDATE_SECONDS)
    : 300;

export const CATEGORIES_REVALIDATE_SECONDS =
  Number(process.env.CATEGORIES_REVALIDATE_SECONDS) >= 0
    ? Number(process.env.CATEGORIES_REVALIDATE_SECONDS)
    : 300;

export function productsCacheTag(lang: string) {
  return `products:${lang}`;
}

export function pageContentCacheTag(lang: string, pageName: string) {
  return `page-content:${lang}:${pageName}`;
}

export function categoriesCacheTag(lang: string) {
  return `categories:${lang}`;
}
