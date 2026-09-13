"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import CustomLoader from "@/components/customLoader/CustomLoader";
import { useProducts } from "@/hooks/useProducts";
import { useLocale, useTranslations } from "next-intl";
import { ProductsListProps } from "@/interfaces/ProductListProps";
import ProductsGrid from "./ProductsGrid";

function ProductsListFetcher({ limit }: { limit?: number }) {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category")?.toLowerCase();
  const t = useTranslations();
  const locale = useLocale();

  const { data, isLoading, error } = useProducts({ locale, limit });

  const products = data?.data?.products ?? [];

  const filteredProducts = useMemo(() => {
    if (!category) return products;
    return products.filter(
      (product) => product.category_slug?.toLowerCase() === category
    );
  }, [products, category]);

  const displayedProducts = limit
    ? filteredProducts.slice(0, limit)
    : filteredProducts;

  if (isLoading) {
    return <CustomLoader variant="inline" />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/35 bg-red-950/30 px-4 py-6 text-center text-shop_white">
        <p className="font-medium text-red-200">{t("Products.FailedToLoadProducts")}</p>
        <p className="mt-1 text-sm text-red-100/80">{error.message}</p>
      </div>
    );
  }

  return <ProductsGrid products={displayedProducts} />;
}

export default function ProductsList({
  limit,
  products: propProducts,
}: ProductsListProps) {
  if (propProducts !== undefined) {
    return <ProductsGrid products={propProducts} limit={limit} />;
  }

  return (
    <Suspense fallback={<CustomLoader variant="inline" />}>
      <ProductsListFetcher limit={limit} />
    </Suspense>
  );
}
