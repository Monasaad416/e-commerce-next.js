import { CategoriesResponse } from '@/interfaces/categoryType';
import { API_URLS } from '@/app/Services/Urls';
import { useLocaleStore } from '@/stores/localeStore';

const fetchCategories = async (): Promise<CategoriesResponse['data']> => {
    try {
        const lang = useLocaleStore.getState().lang; 
        const API_URL = API_URLS.CATEGORIES.GET_CATEGORIES(lang);
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CategoriesResponse = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching categories:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        // Return empty data structure on error
        return {
            categories: [],
            pagination: {
                current_page: 1,
                last_page: 1,
                per_page: 12,
                total: 0
            }
        };
    }
};

export default fetchCategories;