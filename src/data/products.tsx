import { API_URLS } from "@/app/Services/Urls";
import {
  FetchProductsOptions,
  ProductsResponse,
} from "@/interfaces/productType";
import { useLocaleStore } from "@/stores/localeStore";

const EMPTY_PRODUCTS_RESPONSE: ProductsResponse = {
  success: false,
  message: "Unknown error",
  data: {
    products: [],
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 12,
      total: 0,
    },
  },
};

function resolveLang(localeOverride?: string): string {
  return localeOverride ?? useLocaleStore.getState().lang ?? "en";
}

function buildProductsUrl(
  lang: string,
  page: number,
  perPage?: number
): string {
  const url = new URL(API_URLS.PRODUCTS.GET_PRODUCTS(lang));
  url.searchParams.set("page", String(page));
  if (perPage != null) url.searchParams.set("per_page", String(perPage));
  return url.toString();
}

async function fetchProductsPage(
  lang: string,
  page: number,
  perPage?: number
): Promise<ProductsResponse> {
  const response = await fetch(buildProductsUrl(lang, page, perPage), {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * @param localeOverride — pass from server/RSC so the request does not depend on the client locale store.
 */
const fetchProducts = async (
  localeOverride?: string,
  options?: FetchProductsOptions
): Promise<ProductsResponse> => {
  try {
    const lang = resolveLang(localeOverride);
    const page = options?.page ?? 1;

    if (!options?.fetchAll) {
      return fetchProductsPage(lang, page, options?.perPage);
    }

    const first = await fetchProductsPage(lang, 1, options?.perPage);
    const { pagination, products } = first.data;

    if (pagination.last_page <= 1) {
      return first;
    }

    const rest = await Promise.all(
      Array.from({ length: pagination.last_page - 1 }, (_, i) =>
        fetchProductsPage(lang, i + 2, pagination.per_page)
      )
    );

    const allProducts = [
      ...products,
      ...rest.flatMap((res) => res.data.products),
    ];

    return {
      ...first,
      data: {
        products: allProducts,
        pagination: {
          ...pagination,
          current_page: 1,
          last_page: 1,
          per_page: allProducts.length,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      ...EMPTY_PRODUCTS_RESPONSE,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default fetchProducts;
