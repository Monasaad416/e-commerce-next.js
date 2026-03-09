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
}

export function useProducts({ locale, limit, ...options }: UseProductsOptions) {
  return useQuery<ProductsResponse, Error>({
    queryKey: ["products", locale, limit],
    queryFn: () => fetchProducts(locale), 
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
