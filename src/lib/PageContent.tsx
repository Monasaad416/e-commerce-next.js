import { API_URLS } from "@/app/Services/Urls";
import {
  PAGE_CONTENT_REVALIDATE_SECONDS,
  pageContentCacheTag,
} from "@/lib/revalidate";

export async function getPageContent(lang: string, pageName: string) {
  const API_URL = API_URLS.PAGE_CONTENT.GET_PAGE_CONTENT(lang, pageName);

  let res: Response;
  try {
    res = await fetch(API_URL, {
      next: {
        revalidate: PAGE_CONTENT_REVALIDATE_SECONDS,
        tags: [pageContentCacheTag(lang, pageName), "page-content"],
      },
    });
  } catch (e) {
    throw new Error(
      e instanceof Error
        ? `Page content request failed: ${e.message}`
        : "Page content request failed",
    );
  }

  if (!res.ok) {
    throw new Error("Failed to fetch page content");
  }

  const data = await res.json();
  return data.data;
}

export type PageContentData = Awaited<ReturnType<typeof getPageContent>>;
