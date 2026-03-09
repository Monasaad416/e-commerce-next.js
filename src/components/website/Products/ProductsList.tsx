'use client';

import ProductCard from "./ProductCard";
import { useSearchParams } from 'next/navigation';
import CustomLoader from "@/components/customLoader/CustomLoader";
import { useProducts } from "@/hooks/useProducts";
import { useTranslations } from "next-intl";
import { ProductsListProps } from "@/interfaces/ProductListProps";
import { useMemo } from "react";
import ViewAllBtn from "@/components/website/ViewAllBtn"


export default function ProductsList({ limit, products: propProducts }: ProductsListProps) {
  const searchParams = useSearchParams();
  const category = searchParams?.get('category')?.toLowerCase();
  const t = useTranslations();

  // Use passed products or fetch them
  const { data, isLoading, error } = useProducts({
    enabled: !propProducts,
    locale: 'en'
  });

  console.log(data?.data?.products)
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


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {displayedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}