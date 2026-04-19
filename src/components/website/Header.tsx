"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import MainMenu from "./MainMenu";
import MobileMenu from "./MobileMenu";

export const Header = () => {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <header className="w-full">
      <div className="hidden md:block">
        <MainMenu />
      </div>

      {/* Mobile: slim bar — logo + menu only (cart / wishlist live in the sheet) */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-shop_dark_primary md:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link
            href={`/${locale}`}
            className="truncate text-lg font-bold tracking-tight text-shop_secondary"
          >
            {t("Menu.Logo")}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
