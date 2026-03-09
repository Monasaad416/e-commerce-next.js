import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { CategoriesResponse } from "@/interfaces/categoryType";
import fetchCategories from "@/data/categories";

interface UseCategoriesOptions extends Omit<UseQueryOptions<CategoriesResponse, Error>, 'queryKey' | 'queryFn'> {
  onSuccess?: (data: CategoriesResponse) => void;
  onError?: (error: Error) => void;
}

export function useCategories(options?: UseCategoriesOptions) {
  const locale = useLocale();
  
  return useQuery<CategoriesResponse, Error>({
    queryKey: ['categories', locale],
    queryFn: async () => {
      const data = await fetchCategories();
      return {
        success: true,
        message: 'Categories fetched successfully',
        data: {
          categories: data?.categories || [],
          pagination: data?.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0
          }
        }
      } as CategoriesResponse;
    },
    ...options,
    select: (data) => {
      return {
        ...data,
        data: {
          ...data.data,
          categories: data.data.categories,
        }
      };
    }
  });
}