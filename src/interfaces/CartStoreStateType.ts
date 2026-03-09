export interface ICartItem {
  id: string,
  name: string,
  type: string,
  price: number,
  qty: number,
  images: {
    featured_image: string,
    images: string[]
  },
  selection: {
    [key: string]: string | number | boolean | null | undefined;
    image?: string;  // Make image optional
  };
  image: string
}
    

export interface ICartStoreState {
    cart: ICartItem[];
    hasHydrated: boolean;
}

export interface ICartStoreActions {
    addToCart: (product: ICartItem) => void;
    removeFromCart: (productId: string) => void;
    updateCart: (newCart: ICartItem[]) => void;
    clearCart: () => void;
    incrementQuantity: (productId: string, selection: object) => void;
    decrementQuantity: (productId: string, selection: object) => void;
}
