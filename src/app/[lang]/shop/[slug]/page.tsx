import type { Metadata } from "next";
import { getProduct } from "@/lib/getProduct";
import { getLocalizedValue } from "@/lib/i18n/getLocalizedValue";
import { getProductFromApiResponse } from "@/lib/productVariantMatch";
import { buildPageMetadata, normalizeLocale } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/media";
import { routing } from "@/i18n/routings";
import fetchProducts from "@/data/products";
import ProductClient from "./ProductClient";

interface ProductPageProps {
  params: Promise<{ lang: string; slug: string }>;
}

/** ISR: must be a literal for Next.js segment config. */
export const revalidate = 120;

export async function generateStaticParams() {
  try {
    const productsRes = await fetchProducts(routing.defaultLocale, {
      fetchAll: true,
    });
    const products = productsRes.data.products ?? [];

    return routing.locales.flatMap((lang) =>
      products
        .filter((p) => Boolean(p.slug))
        .map((p) => ({ lang, slug: p.slug })),
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const langNorm = normalizeLocale(lang);
  const json = await getProduct(langNorm, slug);
  const product = getProductFromApiResponse(json);

  if (!product) {
    return buildPageMetadata({
      lang: langNorm,
      path: `/shop/${slug}`,
      title: langNorm === "ar" ? "المنتج غير موجود" : "Product Not Found",
      noIndex: true,
    });
  }

  const title = getLocalizedValue(
    product.name as Parameters<typeof getLocalizedValue>[0],
    langNorm,
  );
  const description = getLocalizedValue(
    product.description as Parameters<typeof getLocalizedValue>[0],
    langNorm,
  );
  const imagePath =
    product.thumbnail ||
    product.images?.[0]?.url ||
    product.images?.[0]?.image_path ||
    product.variants?.[0]?.featured_image ||
    null;
  const image = imagePath ? resolveImageUrl(String(imagePath)) : undefined;

  return buildPageMetadata({
    lang: langNorm,
    path: `/shop/${slug}`,
    title: title || (langNorm === "ar" ? "منتج" : "Product"),
    description: description
      ? description
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160)
      : undefined,
    image,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, lang } = await params;
  const langNorm = normalizeLocale(lang);
  const initialProduct = await getProduct(langNorm, slug);

  return (
    <div className="min-h-[60vh]">
      <ProductClient productSlug={slug} initialProduct={initialProduct} />
    </div>
  );
}
