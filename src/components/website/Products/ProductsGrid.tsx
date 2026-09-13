"use client";

import ProductCard from "./ProductCard";
import { useTranslations } from "next-intl";
import type { IProduct } from "@/interfaces/productType";

type ProductsGridProps = {
  products: IProduct[];
  limit?: number;
};

/** Presentational grid — no data fetching or search params. */
export default function ProductsGrid({ products, limit }: ProductsGridProps) {
  const t = useTranslations();

  const displayedProducts = limit ? products.slice(0, limit) : products;

  if (displayedProducts.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-shop_medium_primary/50 px-6 py-12 text-center text-shop_light_gray">
        <p className="text-lg font-medium text-shop_white">{t("Products.NoProductsFound")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {displayedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
