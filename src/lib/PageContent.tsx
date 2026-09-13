import { API_URLS } from "@/app/Services/Urls";

export async function getPageContent(lang: string, pageName: string) {
  const API_URL = API_URLS.PAGE_CONTENT.GET_PAGE_CONTENT(lang, pageName);

  let res: Response;
  try {
    res = await fetch(API_URL, {
      cache: "no-store",
      // Avoid hanging forever when the API host is down or unreachable (e.g. wrong NEXT_PUBLIC_API_BASE_URL).
      signal: AbortSignal.timeout(15_000),
    });
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "AbortError" || name === "TimeoutError") {
      throw new Error(
        "Page content request timed out. Is the API running and NEXT_PUBLIC_API_BASE_URL correct?"
      );
    }
    throw e;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch page content");
  }

  const data = await res.json();
  return data.data;
}

export type PageContentData = Awaited<ReturnType<typeof getPageContent>>;
