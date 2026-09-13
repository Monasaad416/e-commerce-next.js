import { CategoriesResponse } from "@/interfaces/categoryType";
import { API_URLS } from "@/app/Services/Urls";
import { useLocaleStore } from "@/stores/localeStore";
import {
  CATEGORIES_REVALIDATE_SECONDS,
  categoriesCacheTag,
} from "@/lib/revalidate";

const fetchCategories = async (
  localeOverride?: string,
): Promise<CategoriesResponse["data"]> => {
  try {
    const lang =
      localeOverride ?? useLocaleStore.getState().lang ?? "en";
    const API_URL = API_URLS.CATEGORIES.GET_CATEGORIES(lang);
    const response = await fetch(API_URL, {
      next: {
        revalidate: CATEGORIES_REVALIDATE_SECONDS,
        tags: [categoriesCacheTag(lang), "categories"],
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CategoriesResponse = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching categories:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      categories: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0,
      },
    };
  }
};

export default fetchCategories;
