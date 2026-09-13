import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routings";
import { getSiteUrl } from "@/lib/site";
import fetchProducts from "@/data/products";

const STATIC_PATHS = [
  "",
  "/shop",
  "/about",
  "/contact",
  "/faq",
  "/shipping",
  "/privacy",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      STATIC_PATHS.map((path) => ({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" || path === "/shop" ? "daily" : "monthly",
        priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
          ),
        },
      })),
  );

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    // Prefer default locale catalog for slugs (shared across locales).
    const productsRes = await fetchProducts(routing.defaultLocale);
    const products = productsRes.data.products ?? [];
    productEntries = products.flatMap((product) => {
      if (!product.slug) return [];
      return routing.locales.map((locale) => ({
        url: `${siteUrl}/${locale}/shop/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${siteUrl}/${l}/shop/${product.slug}`,
            ]),
          ),
        },
      }));
    });
  } catch {
    // Sitemap still returns static routes if product API is unavailable.
  }

  return [...staticEntries, ...productEntries];
}
