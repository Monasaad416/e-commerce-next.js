'use client';

import { IProduct } from "@/interfaces/productType";
import { Button } from "../ui/button";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "react-toastify";
import { IoHeartOutline } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { IWishlistItem } from "@/interfaces/WishlistStoreStateType";

interface AddToWishlistBtnProps {
  product: IProduct;
  selection: object;
  qty: number;
  disabled?: boolean;
  priceOverride?: number;
  imageOverride?: string;
}

const AddToWishlistBtn = ({
  product,
  selection,
  qty,
  disabled,
  priceOverride,
  imageOverride,
}: AddToWishlistBtnProps) => {
    const addToWishlist = useWishlistStore(state => state.addToWishlist);
    const t = useTranslations();

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

    const handleAddToWishlist = () => {
        const wishlistItem = {
            id: String(product.id),
            name: product.name,
            price: productPrice,
            qty: qty,
            selection: selection,
            image: productImage
        };
        addToWishlist(wishlistItem as IWishlistItem);
        toast.success("Product added to wishlist");
    };

    return (
        <Button
            type="button"
            variant="default"
            className="bg-shop_secondary text-dark transition rounded hover:cursor-pointer hover:bg-shop_secondary/90"
            onClick={handleAddToWishlist}
            disabled={disabled}
            aria-label={t("Cart.AddToWishlist")}
        >
            <IoHeartOutline className="!h-6 !w-6" aria-hidden />
        </Button>
    );
};

export default AddToWishlistBtn;