export interface ICategory {
    id: number;
    name: {
        ar: string;
        en: string;
    };
    slug: string;
    description?: {
        ar?: string;
        en?: string;
    };
    is_active: number;
    meta_keywords?: {
        ar?: string[];
        en?: string[];
    };
    meta_description?: {
        ar?: string[];
        en?: string[];
    };
    img?: string;
    thumbnail?: string;
    created_at: string;
    updated_at: string;
}

// API Response interfaces
export interface CategoriesResponse {
    success: boolean;
    message: string;
    data: {
        categories: ICategory[];
        pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}
