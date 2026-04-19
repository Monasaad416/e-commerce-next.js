'use client';

import { IProduct } from "@/interfaces/productType";
import { Button } from "../ui/button";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "react-toastify";
import { BsCartPlus } from "react-icons/bs";
import { useTranslations } from "next-intl";
import { ICartItem } from "@/interfaces/CartStoreStateType";

interface AddToCartBtnProps {
    product:IProduct;
    selection: object;   
    // changeType: (type: 'color' | 'size', value: string) => void;
    qty: number;
    disabled?: boolean;
    priceOverride?: number;
    imageOverride?: string;
}

const AddToCartBtn = ({
  product,
  selection,
  qty,
  disabled,
  priceOverride,
  imageOverride,
}: AddToCartBtnProps) => {
    const addToCart = useCartStore(state => state.addToCart);
    const t = useTranslations();

    // const type ="";
    let productImage = imageOverride || "";
    let productPrice = priceOverride ?? 0;
    let discountProductPrice = 0;


    if (productPrice === 0) {
      if(product?.type === "simple"){
          productImage = productImage || product?.images?.[0]?.url || product?.images?.[0]?.image_path || '';
          productPrice = product?.selling_price;
          discountProductPrice = product?.discount_price || 0;


           
      }else{
          productPrice = product?.variants?.[0]?.selling_price || 0;
          productImage = productImage || product?.variants?.[0]?.images?.[0]?.url || product?.variants?.[0]?.images?.[0]?.image_path || '';
          discountProductPrice = product?.variants?.[0]?.discount_price || 0;
      }
    }

    const handleAddToCart = () => {
        // Create unique ID from product and selection
        const selectionKey = Object.entries(selection)
            .map(([key, value]) => `${key}:${value}`)
            .join('|');
        // const uniqueId = `${product?.id}-${selectionKey}`;
        
        const cartItem = {
            id: String(product?.id),
            product_variant_id: product?.variants?.[0]?.id ? String(product?.variants?.[0]?.id) : undefined,
            name: product?.name,
            price: productPrice,
            discountPrice: discountProductPrice,
            qty: qty,
            selection: selection,
            image: productImage,
            type: product?.type,
            // images: productImages || []
        };
        addToCart(cartItem as ICartItem);
        toast.success("Product added to cart");
    };

    return (
        <Button
            className="bg-shop_secondary text-dark transition rounded hover:cursor:pointer"
            onClick={handleAddToCart}
            disabled={disabled}
        >
            <BsCartPlus className="!w-6 !h-6" />

        </Button>
    );
};

export default AddToCartBtn;