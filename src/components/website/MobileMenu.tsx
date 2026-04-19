"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { IoMdMenu } from "react-icons/io";
import { Button } from "../ui/button";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "@/components/website/Auth/AuthModal";
import { cn } from "@/lib/utils";

function NavRow({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-3 text-[15px] transition",
          active
            ? "bg-shop_light_gray text-shop_dark_primary"
            : "text-gray-800 hover:bg-gray-50",
        )}
      >
        <span>{children}</span>
        {active && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-shop_secondary" aria-hidden />
        )}
      </Link>
    </SheetClose>
  );
}

function SubLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="block rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-shop_dark_primary"
      >
        {children}
      </Link>
    </SheetClose>
  );
}

export function MobileMenu() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const token = useAuthStore((state) => state.token);
  const name = useAuthStore((state) => state.name);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const clearToken = useAuthStore((s) => s.setToken);
  const clearName = useAuthStore((s) => s.setName);

  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  const isActive = (path: string) => {
    const current = pathname.replace(/\/$/, "");
    const target = path.replace(/\/$/, "");
    return current === target;
  };

  const isHome = normalizedPath === `/${locale}`;
  const isShopSection =
    normalizedPath === `/${locale}/shop` || normalizedPath.startsWith(`/${locale}/shop/`);

  const openLogin = () => {
    setMode("login");
    setAuthOpen(true);
    setSheetOpen(false);
  };

  const openSignup = () => {
    setMode("signup");
    setAuthOpen(true);
    setSheetOpen(false);
  };

  const handleLogout = () => {
    clearToken(null);
    clearName(null);
    document.cookie = "auth_token=; path=/; max-age=0";
    setSheetOpen(false);
    router.replace(`/${locale}`);
    window.location.reload();
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-10 shrink-0 text-shop_white hover:bg-white/10 hover:text-shop_secondary"
            aria-label={t("Menu.OpenMenu")}
          >
            <IoMdMenu className="h-7 w-7" />
          </Button>
        </SheetTrigger>

        <SheetContent
          dir={isRTL ? "rtl" : "ltr"}
          side={isRTL ? "right" : "left"}
          className="flex w-[min(100vw-1.5rem,20rem)] flex-col border-gray-200/80 bg-white p-0 shadow-2xl"
        >
          <SheetHeader className="space-y-0 border-b border-gray-100 px-4 py-4 text-start">
            <SheetTitle className="text-base font-semibold text-shop_dark_primary">
              {t("Menu.MenuTitle")}
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3" dir={isRTL ? "rtl" : "ltr"}>
            <NavRow href={`/${locale}`} active={isHome}>
              {t("Menu.Home")}
            </NavRow>
            <NavRow href={`/${locale}/shop`} active={isShopSection}>
              {t("Menu.Shop")}
            </NavRow>
            <NavRow href={`/${locale}/cart`} active={isActive(`/${locale}/cart`)}>
              {t("Menu.Cart")}
            </NavRow>
            <NavRow href={`/${locale}/wishlist`} active={isActive(`/${locale}/wishlist`)}>
              {t("Menu.Wishlist")}
            </NavRow>

            <div className="my-3 border-t border-gray-100" />

            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {t("Menu.Support")}
            </p>
            <SubLink href={`/${locale}/contact`}>{t("Footer.Contact_Us")}</SubLink>
            <SubLink href={`/${locale}/faq`}>{t("Footer.FAQ")}</SubLink>
            <SubLink href={`/${locale}/shipping`}>{t("Menu.ShippingReturns")}</SubLink>
            <SubLink href={`/${locale}/privacy`}>{t("Menu.Privacy")}</SubLink>
            <SubLink href={`/${locale}/about`}>{t("Menu.About")}</SubLink>

            {_hasHydrated && token && (
              <>
                <div className="my-3 border-t border-gray-100" />
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {t("Menu.Account")}
                </p>
                <NavRow href={`/${locale}/orders`} active={isActive(`/${locale}/orders`)}>
                  {t("Orders.Orders")}
                </NavRow>
                <NavRow href={`/${locale}/account`} active={isActive(`/${locale}/account`)}>
                  {t("Menu.Profile")}
                </NavRow>
              </>
            )}
          </nav>

          <div className="border-t border-gray-100 bg-gray-50/90 p-4">
            {!_hasHydrated ? (
              <div className="h-16 animate-pulse rounded-lg bg-gray-200" />
            ) : !token ? (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="h-10 w-full bg-shop_dark_primary text-shop_white hover:bg-shop_medium_primary"
                  onClick={openLogin}
                >
                  {t("Menu.SignIn")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full border-shop_secondary text-shop_dark_primary hover:bg-shop_secondary/10"
                  onClick={openSignup}
                >
                  {t("Menu.SignUp")}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2.5 shadow-sm">
                  <p className="truncate text-sm font-semibold text-shop_dark_primary">{name}</p>
                  <p className="text-xs text-gray-500">{t("Menu.Account")}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-full text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  {t("Menu.Logout")}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={mode} />
    </>
  );
}

export default MobileMenu;
