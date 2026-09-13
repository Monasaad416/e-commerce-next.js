import { useQuery } from "@tanstack/react-query";
import {
  getProduct,
  PRODUCT_REVALIDATE_SECONDS,
  type GetProductResult,
} from "@/lib/getProduct";

export type UseProductOptions = {
  /** From RSC `page.tsx` — avoids an extra client request on first paint. */
  initialProduct?: GetProductResult | null;
};

export function useProduct(
  locale: string,
  slug: string,
  options?: UseProductOptions
) {
  const initial = options?.initialProduct;

  return useQuery({
    queryKey: ["product", locale, slug] as const,
    queryFn: () => getProduct(locale, slug),
    initialData: initial != null ? initial : undefined,
    staleTime: PRODUCT_REVALIDATE_SECONDS * 1000,
  });
}
