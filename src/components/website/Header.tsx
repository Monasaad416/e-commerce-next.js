"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import MainMenu from "./MainMenu";
import MobileMenu from "./MobileMenu";
import Image from "next/image";
import logo from "@/assets/imgs/logo/logo.jpeg"

export const Header = () => {
  const locale = useLocale();

  return (
    <header className="w-full">
      <div className="hidden md:block">
        <MainMenu />
      </div>

      {/* Mobile: slim bar — logo + menu only (cart / wishlist live in the sheet) */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-shop_dark_primary md:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
       <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image src={logo} alt="logo" width={45} height={45} className="rounded-full object-cover" />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
