'use client';

import { IProduct } from "@/interfaces/productType";
import { Button } from "../ui/button";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "react-toastify";
import { IoCartOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ICartItem } from "@/interfaces/CartStoreStateType";

interface AddToCartBtnProps {
    product: IProduct;
    selection: {};
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

    let type="";
    let productImage = imageOverride || "";
    let productPrice = priceOverride ?? 0;

    if (productPrice === 0) {
      if(product.type === "simple"){
          productImage = productImage || product.images?.[0]?.url || product.images?.[0]?.image_path || '';
          productPrice = product.selling_price;
      }else{
          productPrice = product.variants?.[0]?.selling_price || 0;
          productImage = productImage || product.variants?.[0]?.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.image_path || '';
      }
    }

    const handleAddToCart = () => {
        const cartItem = {
            id: String(product.id),
            name: product.name,
            price: productPrice,
            qty: qty,
            selection: selection,
            image: productImage
        };
        addToCart(cartItem as ICartItem);
        toast.success("Product added to cart");
    };

    return (
        <Button
            className="border border-gray-300 py-6 px-8 font-semibold bg-shop_dark_primary hover:bg-shop_white hover:text-shop_dark_primary transition"
            onClick={handleAddToCart}
            disabled={disabled}
        >
            <IoCartOutline className="h-5 w-5" />
            {t("Cart.AddToCart")}
        </Button>
    );
};

export default AddToCartBtn;