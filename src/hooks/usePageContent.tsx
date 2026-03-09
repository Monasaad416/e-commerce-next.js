import { useQuery } from '@tanstack/react-query'
import { getPageContent } from '@/lib/PageContent'

export function usePageContent( lang: string ,pageName: string) {
  return useQuery({
    queryKey: ['page-content', lang, pageName],
    queryFn: () => getPageContent(lang, pageName),
    enabled: !!pageName,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
