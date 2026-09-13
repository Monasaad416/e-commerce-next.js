import { useQuery } from "@tanstack/react-query";
import {
  getPageContent,
  type PageContentData,
} from "@/lib/PageContent";

export type { PageContentData };

export function usePageContent(
  lang: string,
  pageName: string,
  options?: {
    /** From RSC — avoids a full-screen loader on first paint while the client refetches in the background. */
    initialData?: PageContentData | null;
  }
) {
  const hasServerData = options !== undefined && "initialData" in options;

  return useQuery({
    queryKey: ["page-content", lang, pageName],
    queryFn: () => getPageContent(lang, pageName),
    enabled: !!pageName && !!lang,
    staleTime: hasServerData ? 60 * 1000 : 0,
    initialData: hasServerData ? options!.initialData : undefined,
    retry: 1,
    retryDelay: 1_000,
  });
}
