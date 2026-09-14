"use client";

import { HiOutlineHeart } from "react-icons/hi2";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useWishlistStore } from "@/stores/wishlistStore";
import { cn } from "@/lib/utils";

const WishlistIcon = () => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const wishlist = useWishlistStore((s) => s.wishlist);
  const count = wishlist.length;

  return (
    <Link
      href={`/${locale}/wishlist`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
      aria-label="Wishlist"
    >
      <HiOutlineHeart className="h-[1.3rem] w-[1.3rem]" />
      {count > 0 && (
        <span
          className={cn(
            "absolute top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-shop_secondary text-[10px] font-bold leading-none text-shop_dark_primary ring-2 ring-shop_dark_primary",
            isRTL ? "left-0" : "right-0",
          )}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
};

export default WishlistIcon;
