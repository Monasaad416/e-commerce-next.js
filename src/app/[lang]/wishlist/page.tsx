"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Trash2, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";

import { AppLoader } from "@/components/customLoader/CustomLoader";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatMoney";
import { resolveImageUrl } from "@/lib/media";
import { getCartUnitPrice } from "@/lib/cartPricing";
import { ICartItem } from "@/interfaces/CartStoreStateType";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

export default function WishlistPage() {
  const locale = useLocale();
  const t = useTranslations();
  const token = useAuthStore((s) => s.token);
  const authHydrated = useAuthStore((s) => s._hasHydrated);

  const {
    wishlist,
    hasHydrated,
    fetchWishlist,
    removeFromWishlist,
    clearWishlist,
  } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!authHydrated || !hasHydrated) return;
    if (token) void fetchWishlist();
  }, [authHydrated, hasHydrated, token, fetchWishlist]);

  if (!authHydrated || !hasHydrated) {
    return <AppLoader />;
  }

  const handleRemove = async (productId: string, selection?: object) => {
    const key = `${productId}-${JSON.stringify(selection ?? {})}`;
    setBusyId(key);
    try {
      await removeFromWishlist(productId, selection);
      toast.success(t("Wishlist.Removed"));
    } catch {
      toast.error(t("Wishlist.RemoveFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const handleAddToCart = async (item: (typeof wishlist)[number]) => {
    const key = `${item.id}-${JSON.stringify(item.selection ?? {})}`;
    setBusyId(key);
    try {
      const cartItem: ICartItem = {
        id: item.id,
        name: item.name,
        type: item.type,
        price: item.price,
        discountPrice: item.discountPrice,
        qty: item.qty || 1,
        image: item.image,
        selection: item.selection,
        product_variant_id: item.product_variant_id,
        subtotal: item.subtotal,
        tax: item.tax,
        total: item.total,
      };
      await addToCart(cartItem);
      toast.success(t("Wishlist.MovedToCart"));
    } catch {
      toast.error(t("Wishlist.MoveToCartFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearWishlist();
      toast.success(t("Wishlist.Cleared"));
    } catch {
      toast.error(t("Wishlist.ClearFailed"));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("Wishlist.title")}
          </h1>
          <p className="text-gray-500 text-sm">
            {wishlist.length}{" "}
            {wishlist.length === 1
              ? t("Wishlist.Item")
              : t("Wishlist.Items")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {wishlist.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleClear()}
              disabled={clearing}
            >
              {t("Wishlist.Clear")}
            </Button>
          )}
          <Link
            href={`/${locale}/shop`}
            className="text-shop_secondary hover:underline text-sm font-medium"
          >
            {t("Wishlist.shopNow")}
          </Link>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center space-y-4">
          <p className="text-gray-500">{t("Wishlist.Empty")}</p>
          <Button asChild className="bg-shop_secondary text-shop_dark_primary hover:bg-shop_secondary/90">
            <Link href={`/${locale}/shop`}>{t("Wishlist.shopNow")}</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden divide-y">
          {wishlist.map((item) => {
            const key = `${item.id}-${JSON.stringify(item.selection ?? {})}`;
            const busy = busyId === key;
            const unit = getCartUnitPrice(item);

            return (
              <div
                key={key}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 border">
                    <Image
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/${locale}/shop/${item.slug || item.id}`}
                      className="font-medium text-gray-800 hover:text-shop_secondary line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatMoney(unit)}
                    </p>
                    {item.is_available === false && (
                      <p className="text-xs text-red-600 mt-1">
                        {item.availability_message || t("Wishlist.Unavailable")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-shop_secondary text-shop_dark_primary hover:bg-shop_secondary/90"
                    disabled={busy || item.is_available === false}
                    onClick={() => void handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t("Cart.AddToCart")}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={busy}
                    aria-label={t("Wishlist.Remove")}
                    onClick={() => void handleRemove(item.id, item.selection)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
