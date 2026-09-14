"use client";

import { IProduct } from "@/interfaces/productType";
import { Button } from "../ui/button";
import { useWishlistStore } from "@/stores/wishlistStore";
import { toast } from "react-toastify";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { useTranslations } from "next-intl";
import { IWishlistItem } from "@/interfaces/WishlistStoreStateType";
import { cn } from "@/lib/utils";
import { useLocalizedValue } from "@/hooks/useLocalizedValue";

interface AddToWishlistBtnProps {
  product: IProduct;
  selection: object;
  qty: number;
  disabled?: boolean;
  priceOverride?: number;
  imageOverride?: string;
  /** `card` = corner chip on product cards; `default` = PDP / solid button */
  variant?: "default" | "card";
  className?: string;
}

const AddToWishlistBtn = ({
  product,
  selection,
  qty,
  disabled,
  priceOverride,
  imageOverride,
  variant = "default",
  className,
}: AddToWishlistBtnProps) => {
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );
  const wishlist = useWishlistStore((state) => state.wishlist);
  const t = useTranslations();
  const tValue = useLocalizedValue();

  const selectionTyped = selection as IWishlistItem["selection"];

  // Cards: treat any saved row for this product as “in wishlist”.
  // PDP: match product + selection (variant).
  const matched = wishlist.find((item) => {
    if (item.id !== String(product.id)) return false;
    if (variant === "card") return true;
    return (
      JSON.stringify(item.selection ?? {}) ===
      JSON.stringify(selectionTyped ?? {})
    );
  });
  const inWishlist = Boolean(matched);

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

  const handleToggleWishlist = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const selectionVariantId = selectionTyped?.product_variant_id;
    const variantId = product?.variants?.[0]?.id ?? selectionVariantId;

    if (inWishlist && matched) {
      try {
        await removeFromWishlist(String(product.id), matched.selection);
        toast.success(t("Wishlist.Removed"));
      } catch {
        toast.error(t("Wishlist.RemoveFailed"));
      }
      return;
    }

    const wishlistItem: IWishlistItem = {
      id: String(product.id),
      name: tValue(product.name) || String(product.name ?? ""),
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

  if (variant === "card") {
    return (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          "h-7 w-7 rounded-full bg-[#fffaf2]/90 text-[#6b5236] shadow-sm backdrop-blur-[2px]",
          "hover:bg-[#fffaf2] hover:text-shop_secondary",
          "sm:h-8 sm:w-8",
          inWishlist && "text-shop_secondary",
          className,
        )}
        onClick={handleToggleWishlist}
        disabled={disabled}
        aria-label={
          inWishlist ? t("Wishlist.Remove") : t("Cart.AddToWishlist")
        }
        aria-pressed={inWishlist}
      >
        {inWishlist ? (
          <IoHeart className="!h-4 !w-4 sm:!h-5 sm:!w-5" aria-hidden />
        ) : (
          <IoHeartOutline className="!h-4 !w-4 sm:!h-5 sm:!w-5" aria-hidden />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="default"
      className={cn(
        "bg-shop_secondary text-dark transition rounded hover:cursor-pointer hover:bg-shop_secondary/90",
        className,
      )}
      onClick={handleToggleWishlist}
      disabled={disabled}
      aria-label={
        inWishlist ? t("Wishlist.Remove") : t("Cart.AddToWishlist")
      }
      aria-pressed={inWishlist}
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
