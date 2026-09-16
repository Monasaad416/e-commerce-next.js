export interface ICartItem {
  id: string,
  name: string,
  type: string,
  /** Used to keep leather fallback images stable with the shop/PDP. */
  slug?: string,
  price: number,
  qty: number,
  total?: number,
  subtotal?: number,
  tax?: number,
  discountPrice?: number,
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
    

export interface ICartStoreState {
    cart: ICartItem[];
    cartId: number | null;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    hasHydrated: boolean;
}

export interface ICartStoreActions {
  setHasHydrated: (v: boolean) => void

  addToCart: (item: ICartItem) => Promise<void>   

  removeFromCart: (
    cartItemId:string,
    selection?: object
  ) => Promise<void>

  updateCart: (newCart: ICartItem[]) => Promise<void>

  clearCart: () => Promise<void>

  incrementQuantity: (productId: string, selection?: object) => Promise<void>

  decrementQuantity: (productId: string, selection?: object) => Promise<void>

  fetchCart: () => Promise<void>   
}
