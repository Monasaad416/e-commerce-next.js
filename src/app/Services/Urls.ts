
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://laravel-next-ecomm.test/api/v1';
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'http://laravel-next-ecomm.test/storage';

export const API_URLS = {
    AUTHENTECATEION: {
        LOGIN:  (lang: string = 'en') => `${API_BASE_URL}/${lang}/login`,
        LOGOUT:  (lang: string = 'en') => `${API_BASE_URL}/${lang}/logout`,
        REGISTER:  (lang: string = 'en') => `${API_BASE_URL}/${lang}/register`,
    },
    CATEGORIES: {
        GET_CATEGORIES: (lang: string = 'en') => `${API_BASE_URL}/${lang}/categories`,
    },
    PRODUCTS: {
        GET_PRODUCTS: (lang: string = 'en') => `${API_BASE_URL}/${lang}/products`,
        GET_PRODUCT: (lang: string = 'en', slug: string) => `${API_BASE_URL}/${lang}/products/${slug}`,
    },
    PAGE_CONTENT: {
        GET_PAGE_CONTENT: (lang: string = 'ar', page: string) => `${API_BASE_URL}/${lang}/page-content/${page}`,
    },
    BASE_URL: API_BASE_URL,
    STORAGE_BASE_URL: STORAGE_BASE_URL,
};

