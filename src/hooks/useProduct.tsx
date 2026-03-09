import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/getProduct';

export function useProduct(locale: string, slug: string) {
  return useQuery({
    queryKey: ['product', locale, slug],
    queryFn: () => getProduct(locale, slug),
    // enabled: !!slug && !!locale,
    // staleTime: 1000 * 60 * 5, // 5 minutes
    // retry: 1,
  });
}