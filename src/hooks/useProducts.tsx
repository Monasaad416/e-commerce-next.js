import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ProductsResponse } from "@/interfaces/productType";
import fetchProducts from "@/data/products";

interface UseProductsOptions
  extends Omit<
    UseQueryOptions<ProductsResponse, Error>,
    "queryKey" | "queryFn"
  > {
  limit?: number;
  locale: string;
  /** Load every paginated page from the API (shop). */
  fetchAll?: boolean;
}

export function useProducts({
  locale,
  limit,
  fetchAll,
  ...options
}: UseProductsOptions) {
  return useQuery<ProductsResponse, Error>({
    queryKey: ["products", locale, limit, fetchAll],
    queryFn: () => fetchProducts(locale, { fetchAll }),
    ...options,
    select: (data) => {
      if (limit) {
        return {
          ...data,
          data: {
            ...data.data,
            products: data.data.products.slice(0, limit),
          },
        };
      }
      return data;
    },
  });
}
