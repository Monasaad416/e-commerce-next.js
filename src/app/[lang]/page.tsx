import { getPageContent } from "@/lib/PageContent";
import fetchProducts from "@/data/products";
import HomePageClient from "./HomePageClient";
import type { IProduct } from "@/interfaces/productType";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang === "ar" ? "ar" : "en";

  const [cmsResult, productsRes] = await Promise.all([
    getPageContent(locale, "home")
      .then((data) => ({ ok: true as const, data }))
      .catch(() => ({ ok: false as const })),
    fetchProducts(locale),
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
