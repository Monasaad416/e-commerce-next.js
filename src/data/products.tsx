import { API_URLS } from "@/app/Services/Urls";
import { ProductsResponse } from "@/interfaces/productType";
import { useLocaleStore } from "@/stores/localeStore";

const fetchProducts = async (): Promise<ProductsResponse> => {
  try {
    const lang = useLocaleStore.getState().lang; 
    const API_URL = API_URLS.PRODUCTS.GET_PRODUCTS(lang);
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
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
  }
};

export default fetchProducts;
