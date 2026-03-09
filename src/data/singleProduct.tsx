import { API_URLS } from "@/app/Services/Urls";
import { IProduct, ProductResponse } from "@/interfaces/productType";

const fetchProduct = async (id: string, locale: string): Promise<ProductResponse> => {
  try {
    const API_URL = API_URLS.PRODUCTS.GET_PRODUCT(id, locale);
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ProductResponse = await response.json();
    return data; 
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: {
        product: {} as IProduct,
      },
    };
  }
};

export default fetchProduct;
