"use client";

import ProductCard from "./ProductCard";
import { useSearchParams } from "next/navigation";
import CustomLoader from "@/components/customLoader/CustomLoader";
import { useProducts } from "@/hooks/useProducts";
import { useLocale, useTranslations } from "next-intl";
import { ProductsListProps } from "@/interfaces/ProductListProps";
import { useMemo } from "react";

export default function ProductsList({ limit, products: propProducts }: ProductsListProps) {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category")?.toLowerCase();
  const t = useTranslations();
  const locale = useLocale();

  const { data, isLoading, error } = useProducts({
    enabled: !propProducts,
    locale,
    limit,
  });


  // Use passed products or data from the query
  const products = propProducts || data?.data?.products || [];

  // Apply category filter if needed
  const filteredProducts = useMemo(() => {
    if (!category) return products;
    return products.filter((product) => 
      product.category_slug?.toLowerCase() === category
    );
  }, [products, category]);

  // Apply limit if provided
  const displayedProducts = limit 
    ? filteredProducts.slice(0, limit) 
    : filteredProducts;


  if (!propProducts && isLoading) {
    return <CustomLoader />;
  }

  if (!propProducts && error) {
    return (
      <div className="rounded-xl border border-red-500/35 bg-red-950/30 px-4 py-6 text-center text-shop_white">
        <p className="font-medium text-red-200">{t("Products.FailedToLoadProducts")}</p>
        <p className="mt-1 text-sm text-red-100/80">{error.message}</p>
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-shop_medium_primary/50 px-6 py-12 text-center text-shop_light_gray">
        <p className="text-lg font-medium text-shop_white">{t("Products.NoProductsFound")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {displayedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}