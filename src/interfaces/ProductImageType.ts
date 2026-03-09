export interface IProductImage {
  id: number;
  product_id: number;
  image_path: string | null;
  is_featured: boolean;
  url: string;
}