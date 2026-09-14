"use client";

import { IProduct } from "@/interfaces/productType";
import { Button } from "../ui/button";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "react-toastify";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
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
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );
  const wishlist = useWishlistStore((state) => state.wishlist);
  const t = useTranslations();

  const selectionTyped = selection as IWishlistItem["selection"];
  const inWishlist = wishlist.some(
    (item) =>
      item.id === String(product.id) &&
      JSON.stringify(item.selection ?? {}) ===
        JSON.stringify(selectionTyped ?? {}),
  );

  let productImage = imageOverride || "";
  let productPrice = priceOverride ?? 0;
  let discountProductPrice = 0;

  if (productPrice === 0) {
    if (product.type === "simple") {
      productImage =
        productImage ||
        product.images?.[0]?.url ||
        product.images?.[0]?.image_path ||
        "";
      productPrice = product.selling_price;
      discountProductPrice = product.discount_price || 0;
    } else {
      productPrice = product.variants?.[0]?.selling_price || 0;
      productImage =
        productImage ||
        product.variants?.[0]?.images?.[0]?.url ||
        product.variants?.[0]?.images?.[0]?.image_path ||
        "";
      discountProductPrice = product.variants?.[0]?.discount_price || 0;
    }
  }

  const handleToggleWishlist = async () => {
    const selectionVariantId = selectionTyped?.product_variant_id;
    const variantId = product?.variants?.[0]?.id ?? selectionVariantId;

    if (inWishlist) {
      try {
        await removeFromWishlist(String(product.id), selectionTyped);
        toast.success(t("Wishlist.Removed"));
      } catch {
        toast.error(t("Wishlist.RemoveFailed"));
      }
      return;
    }

    const wishlistItem: IWishlistItem = {
      id: String(product.id),
      name:
        typeof product.name === "string"
          ? product.name
          : String(product.name ?? ""),
      price: productPrice,
      discountPrice: discountProductPrice,
      qty,
      selection: selectionTyped,
      image: productImage,
      type: product.type,
      slug: product.slug,
      product_variant_id: variantId != null ? String(variantId) : undefined,
      subtotal: productPrice * qty,
      total: productPrice * qty,
      tax: 0,
    };

    try {
      await addToWishlist(wishlistItem);
      toast.success(t("Wishlist.Added"));
    } catch {
      toast.error(t("Wishlist.AddFailed"));
    }
  };

  return (
    <Button
      type="button"
      variant="default"
      className="bg-shop_secondary text-dark transition rounded hover:cursor-pointer hover:bg-shop_secondary/90"
      onClick={() => void handleToggleWishlist()}
      disabled={disabled}
      aria-label={
        inWishlist ? t("Wishlist.Remove") : t("Cart.AddToWishlist")
      }
    >
      {inWishlist ? (
        <IoHeart className="!h-6 !w-6" aria-hidden />
      ) : (
        <IoHeartOutline className="!h-6 !w-6" aria-hidden />
      )}
    </Button>
  );
};

export default AddToWishlistBtn;
