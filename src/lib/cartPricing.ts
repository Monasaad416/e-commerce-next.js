import type { ICartItem } from "@/interfaces/CartStoreStateType";

/** Unit price charged (matches add-to-cart / Stripe logic). */
export function getCartUnitPrice(item: Pick<ICartItem, "price" | "discountPrice">): number {
  const price = Number(item.price ?? 0);
  const discount = Number(item.discountPrice ?? 0);
  if (discount > 0 && discount < price) return discount;
  return price;
}

export function getCartLineTotal(
  item: Pick<ICartItem, "price" | "discountPrice" | "qty" | "total" | "subtotal">,
): number {
  const qty = Number(item.qty ?? 0);
  // Prefer backend line totals when present and positive
  const backendTotal = Number(item.total ?? item.subtotal ?? 0);
  if (backendTotal > 0) return backendTotal;
  return getCartUnitPrice(item) * qty;
}

export function hasCartDiscount(
  item: Pick<ICartItem, "price" | "discountPrice">,
): boolean {
  const price = Number(item.price ?? 0);
  const discount = Number(item.discountPrice ?? 0);
  return discount > 0 && discount < price;
}
