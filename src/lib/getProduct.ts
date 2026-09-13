import { API_URLS } from "@/app/Services/Urls";
import { PRODUCTS_REVALIDATE_SECONDS } from "@/lib/revalidate";

/**
 * ISR: how long (seconds) Next.js keeps this `fetch` in the Data Cache on the server.
 * Override with `PRODUCT_REVALIDATE_SECONDS` or `PRODUCTS_REVALIDATE_SECONDS` in `.env`.
 *
 * On-demand updates: POST `/api/revalidate` with tag `product:{lang}:{slug}`.
 */
export const PRODUCT_REVALIDATE_SECONDS =
  Number(process.env.PRODUCT_REVALIDATE_SECONDS) >= 0
    ? Number(process.env.PRODUCT_REVALIDATE_SECONDS)
    : PRODUCTS_REVALIDATE_SECONDS;

/** Tag for `revalidateTag()` — one tag per locale + slug. */
export function productCacheTag(lang: string, slug: string) {
  return `product:${lang}:${slug}`;
}

/** Parsed JSON from GET /{lang}/products/{slug}, or null when missing / error. */
export type GetProductResult = Record<string, unknown> | null;

/**
 * Server-friendly `fetch` with Next.js caching. Identical calls in the same request
 * (e.g. `generateMetadata` + `page`) are deduplicated automatically.
 *
 * Note: `next.revalidate` / `tags` apply only when this runs on the server. In the
 * browser (e.g. React Query `queryFn`), this is a normal fetch — pair with
 * `initialProduct` from the server + `staleTime` in `useProduct` to avoid duplicate
 * first loads.
 */
export async function getProduct(
  lang: string,
  slug: string,
): Promise<GetProductResult> {
  if (!slug) return null;

  const url = API_URLS.PRODUCTS.GET_PRODUCT(lang, slug);

  try {
    const response = await fetch(url, {
      next: {
        revalidate: PRODUCT_REVALIDATE_SECONDS,
        tags: [productCacheTag(lang, slug), "products"],
      },
    });

    if (!response.ok) return null;

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
