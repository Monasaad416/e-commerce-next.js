import { Metadata } from "next";
import ProductClient from "./ProductClient";
import { getProduct } from "@/lib/getProduct";
import { getLocalizedValue } from "@/lib/i18n/getLocalizedValue";
import { getProductFromApiResponse } from "@/lib/productVariantMatch";

interface ProductPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const langNorm = lang === "ar" ? "ar" : "en";
  const json = await getProduct(langNorm, slug);
  const product = getProductFromApiResponse(json);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = getLocalizedValue(product.name as Parameters<typeof getLocalizedValue>[0], lang);
  const description = getLocalizedValue(
    product.description as Parameters<typeof getLocalizedValue>[0],
    lang
  );

  return {
    title: title || "Product",
    description: description ? description.slice(0, 160) : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, lang } = await params;
  const langNorm = lang === "ar" ? "ar" : "en";
  // Same `fetch` options as `generateMetadata` → deduped in one request; feeds React Query initial data.
  const initialProduct = await getProduct(langNorm, slug);

  return (
    <div className="min-h-[60vh]">
      <ProductClient productSlug={slug} initialProduct={initialProduct} />
    </div>
  );
}
