import { getPageContent } from "@/lib/PageContent";
import fetchProducts from "@/data/products";
import HomePageClient from "./HomePageClient";
import type { IProduct } from "@/interfaces/productType";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { routing } from "@/i18n/routings";

/** ISR: regenerate home HTML + cached fetches at most every N seconds. */
export const revalidate = 120;

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  return buildPageMetadata({ lang, page: "home", path: "" });
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;
  const locale = lang === "ar" ? "ar" : "en";

  const [cmsResult, productsRes] = await Promise.all([
    getPageContent(locale, "home")
      .then((data) => ({ ok: true as const, data }))
      .catch(() => ({ ok: false as const })),
    fetchProducts(locale).catch(() => ({
      success: false as const,
      message: "Failed to load products",
      data: {
        products: [] as IProduct[],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 12,
          total: 0,
        },
      },
    })),
  ]);

  const pageContentOptions = cmsResult.ok
    ? { initialData: cmsResult.data }
    : undefined;

  const initialProducts: IProduct[] = productsRes.data.products.slice(0, 8);

  return (
    <HomePageClient
      lang={locale}
      pageContentOptions={pageContentOptions}
      initialProducts={initialProducts}
    />
  );
}
