import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import { ShopProps } from "@/interfaces/ShopProps";
import { buildPageMetadata } from "@/lib/seo";
import { routing } from "@/i18n/routings";
import fetchProducts from "@/data/products";

/** ISR for shop catalog. Must be a literal for Next.js segment config. */
export const revalidate = 120;

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: ShopProps): Promise<Metadata> {
  const { lang } = await params;
  return buildPageMetadata({ lang, page: "shop", path: "/shop" });
}

export default async function ShopPage({ params }: ShopProps) {
  const { lang } = await params;
  const langNorm = lang === "ar" ? "ar" : "en";

  // Prefetch on the server so the first paint can use ISR-cached catalog data.
  const initialProducts = await fetchProducts(langNorm, { fetchAll: true }).catch(
    () => undefined,
  );

  return <ShopClient lang={langNorm} initialProducts={initialProducts} />;
}
