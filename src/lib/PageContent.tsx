import { API_URLS } from "@/app/Services/Urls";

export async function getPageContent(lang: string, pageName: string) {

    const API_URL = API_URLS.PAGE_CONTENT.GET_PAGE_CONTENT(lang, pageName);
    console.log(API_URL)
  const res = await fetch(API_URL,{
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch page content');
  }

  const data = await res.json();
  return data.data;
}
