
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://laravel-next-ecomm.test/api/v1';
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'http://laravel-next-ecomm.test/storage';

export const API_URLS = {
    CATEGORIES: {
        GET_CATEGORIES: (lang: string = 'en') => `${API_BASE_URL}/${lang}/categories`,
    },
    PRODUCTS: {
        GET_PRODUCTS: (lang: string = 'en') => `${API_BASE_URL}/${lang}/products`,
    },
    BASE_URL: API_BASE_URL,
    STORAGE_BASE_URL: STORAGE_BASE_URL,
};

