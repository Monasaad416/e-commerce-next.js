import { ICartItem } from "./CartStoreStateType";

export interface IWishlistItem {
  id: string,
  name: string,
  type: string,
  price: number,
  qty: number,
  total?: number,
  subtotal?: number,
  tax?: number,
  discountPrice?: number,
  slug?: string,
  images?: {
    featured_image: string,
    images: string[]
  },
  selection?: {
    [key: string]: string | number | boolean | null | undefined;
    image?: string; 
    product_variant_id?: string
  };
  image: string,
  product_variant_id?: string,
  cart_item_id?: string,
  is_available?: boolean,
  availability_message?: string | null,
  available_qty?: number | null

}
    

export interface IWishlistStoreState {
    wishlist: IWishlistItem[];
    wishlistId: number | null;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    hasHydrated: boolean;
}

export interface IWishlistStoreActions {
  setHasHydrated: (v: boolean) => void

  isInWishlist: (
    productId: string,
    selection?: IWishlistItem["selection"]
  ) => boolean

  addToWishlist: (item: IWishlistItem) => Promise<void>

  removeFromWishlist: (
    productId: string,
    selection?: object
  ) => Promise<void>

  updateWishlist: (newWishlist: IWishlistItem[]) => Promise<void>

  clearWishlist: () => Promise<void>

  fetchWishlist: () => Promise<void>
}
