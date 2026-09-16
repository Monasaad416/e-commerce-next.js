'use client';

import { IProduct } from "@/interfaces/productType";
import { Button } from "../ui/button";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";
import { ICartItem } from "@/interfaces/CartStoreStateType";
import { resolveImageUrl } from "@/lib/media";

interface AddToCartBtnProps {
  product: IProduct;
  selection: object;
  qty: number;
  disabled?: boolean;
  priceOverride?: number;
  imageOverride?: string;
}

function pickProductImagePath(product: IProduct): string | null {
  if (product?.type === "simple") {
    return (
      product.images?.find((img) => img?.is_featured)?.image_path ??
      product.images?.[0]?.url ??
      product.images?.[0]?.image_path ??
      null
    );
  }

  const variant = product?.variants?.[0];
  return (
    variant?.featured_image ??
    variant?.images?.[0]?.url ??
    variant?.images?.[0]?.image_path ??
    product?.images?.find((img) => img?.is_featured)?.image_path ??
    product?.images?.[0]?.image_path ??
    null
  );
}

const AddToCartBtn = ({
  product,
  selection,
  qty,
  disabled,
  priceOverride,
  imageOverride,
}: AddToCartBtnProps) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const imageKey = product?.slug || String(product?.id ?? "");
  const productImage = resolveImageUrl(
    imageOverride || pickProductImagePath(product),
    { key: imageKey },
  );

  let productPrice = priceOverride ?? 0;
  let discountProductPrice = 0;

  if (product?.type === "simple") {
    if (productPrice === 0) productPrice = product?.selling_price ?? 0;
    discountProductPrice = product?.discount_price || 0;
  } else {
    if (productPrice === 0) {
      productPrice = product?.variants?.[0]?.selling_price || 0;
    }
    discountProductPrice = product?.variants?.[0]?.discount_price || 0;
  }

  const handleAddToCart = async () => {
    const selectionVariantId = (
      selection as { product_variant_id?: string | number }
    )?.product_variant_id;
    const variantId = product?.variants?.[0]?.id ?? selectionVariantId;

    const cartItem = {
      id: String(product?.id),
      product_variant_id: variantId != null ? String(variantId) : undefined,
      name: product?.name,
      slug: product?.slug,
      price: productPrice,
      discountPrice: discountProductPrice,
      qty: qty,
      selection: {
        ...(selection as Record<string, unknown>),
        // Keep the same resolved photo the shop card / PDP showed.
        image: productImage,
      },
      image: productImage,
      type: product?.type,
    };

    try {
      await addToCart(cartItem as ICartItem);
      toast.success("Product added to cart");
    } catch {
      toast.error("Failed to add product to cart");
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      aria-label="Add to cart"
      className="h-9 w-9 shrink-0 rounded-full bg-shop_secondary text-shop_dark_primary shadow-sm transition hover:bg-shop_secondary/90 sm:h-10 sm:w-10"
      onClick={handleAddToCart}
      disabled={disabled}
    >
      <ShoppingCart className="!h-4 !w-4 sm:!h-5 sm:!w-5" aria-hidden />
    </Button>
  );
};

export default AddToCartBtn;
