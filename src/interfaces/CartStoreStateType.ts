export interface ICartItem {
  id: string,
  name: string,
  type: string,
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
  product_variant_id?: string

}
    

export interface ICartStoreState {
    cart: ICartItem[];
    cartId: number | null;
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

  incrementQuantity: (productId: string) => Promise<void>

  decrementQuantity: (productId: string) => Promise<void>

  fetchCart: () => Promise<void>   
}
