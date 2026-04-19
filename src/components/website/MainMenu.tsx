"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import AuthModal from "@/components/website/Auth/AuthModal";
import WishlistIcon from "./WishlistIcon";
import CartIcon from "./CartIcon";
import { usePathname } from "next/navigation";
import logo from "@/assets/imgs/logo/logo.jpeg"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "../ui/input";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-all duration-200",
        "border border-transparent hover:scale-[1.02] hover:border-white/15 hover:bg-white/[0.06]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_secondary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-shop_dark_primary",
        active
          ? "border-shop_secondary/30 bg-shop_secondary/10 text-shop_secondary"
          : "text-shop_white hover:text-shop_secondary",
      )}
    >
      {children}
    </Link>
  );
}

function LocaleFlag({ locale }: { locale: "en" | "ar" }) {
  if (locale === "ar") {
    return (
      <span
        aria-hidden
        className={cn("relative inline-block h-4 w-4 shrink-0 overflow-hidden rounded-full border border-white/15 bg-[#006c35]")}
      >
        <span className="absolute left-[3px] top-[6px] h-[1.5px] w-[10px] rounded-full bg-white" />
        <span className="absolute left-[4px] top-[8.5px] h-[1.5px] w-[8px] rounded-full bg-white/90" />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="relative inline-block h-4 w-4 shrink-0 overflow-hidden rounded-full border border-white/15"
      style={{
        background:
          "repeating-linear-gradient(to bottom, #b22234 0 12.5%, #ffffff 12.5% 25%)",
      }}
    >
      <span className="absolute left-0 top-0 h-[7px] w-[7px] bg-[#3c3b6e]" />
    </span>
  );
}

export function MainMenu() {
  const { token, name, _hasHydrated } = useAuthStore();
  const clearToken = useAuthStore((s) => s.setToken);
  const clearName = useAuthStore((s) => s.setName);

  const router = useRouter();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isScrolled, setIsScrolled] = useState(false);

  const openLogin = () => {
    setMode("login");
    setOpen(true);
  };
  const openSignup = () => {
    setMode("signup");
    setOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname();
  const getLocaleHref = (targetLocale: "en" | "ar") => {
    const currentPath = pathname || `/${locale}`;
    const segments = currentPath.split("/");

    if (segments[1] === "en" || segments[1] === "ar") {
      segments[1] = targetLocale;
      return segments.join("/") || `/${targetLocale}`;
    }

    return `/${targetLocale}${currentPath.startsWith("/") ? currentPath : `/${currentPath}`}`;
  };

  const initials =
    name
      ?.trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const handleLogout = () => {
    clearToken(null);
    clearName(null);
    document.cookie = "auth_token=; path=/; max-age=0";
    router.replace(`/${locale}`);
    window.location.reload();
  };

  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const homePath = `/${locale}`.replace(/\/$/, "") || "/";
  const isHomeActive = normalizedPath === homePath;
  const isShopActive =
    normalizedPath === `/${locale}/shop` ||
    normalizedPath.startsWith(`/${locale}/shop/`);

  const supportPaths = [
    `/${locale}/contact`,
    `/${locale}/faq`,
    `/${locale}/shipping`,
    `/${locale}/privacy`,
    `/${locale}/about`,
  ];
  const isSupportActive = supportPaths.some((p) => normalizedPath === p);

  return (
    <div
      role="presentation"
      className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md transition-[background-color] duration-300"
      style={{
        backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.1)",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: brand + nav */}
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image src={logo} alt="logo" width={45} height={45} className="rounded-full object-cover" />
          </Link>

          <nav
            className="hidden items-center gap-6 md:flex lg:gap-8"
            aria-label="Primary"
          >
            <NavLink href={`/${locale}`} active={isHomeActive}>
              {t("Menu.Home")}
            </NavLink>
            <NavLink href={`/${locale}/shop`} active={isShopActive}>
              {t("Menu.Shop")}
            </NavLink>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center gap-1 rounded-full px-4 text-sm font-medium outline-none transition-all duration-200",
                    "border border-transparent hover:scale-[1.02] hover:border-white/15 hover:bg-white/[0.06]",
                    "focus-visible:ring-2 focus-visible:ring-shop_secondary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-shop_dark_primary",
                    isRTL && "flex-row-reverse",
                    isSupportActive
                      ? "border-shop_secondary/30 bg-shop_secondary/10 text-shop_secondary"
                      : "text-shop_white hover:text-shop_secondary",
                  )}
                >
                  {t("Menu.Support")}
                  <FaChevronDown className="h-3 w-3 opacity-70" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "end" : "start"}
                sideOffset={8}
                className="z-50 w-56 rounded-2xl border p-2 shadow-xl"
                style={{
                  direction: isRTL ? "rtl" : "ltr",
                  borderColor: "#dcc3a0",
                  background:
                    "linear-gradient(180deg, rgba(251,244,234,0.98) 0%, rgba(245,236,224,0.99) 100%)",
                }}
              >
                <DropdownMenuLabel
                  className={cn(
                    "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]",
                    isRTL ? "text-right" : "text-left",
                  )}
                  style={{ color: "#8b7355" }}
                >
                  {t("Footer.Support")}
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="p-0 focus:bg-transparent" asChild>
                    <Link
                      href={`/${locale}/contact`}
                      className={cn(
                        "block w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[#ead8c2] focus:bg-[#ead8c2]",
                        isRTL ? "text-right" : "text-left",
                      )}
                      style={{ color: "#3d2b1f" }}
                    >
                      {t("Footer.Contact_Us")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 focus:bg-transparent" asChild>
                    <Link
                      href={`/${locale}/faq`}
                      className={cn(
                        "block w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[#ead8c2] focus:bg-[#ead8c2]",
                        isRTL ? "text-right" : "text-left",
                      )}
                      style={{ color: "#3d2b1f" }}
                    >
                      {t("Footer.FAQ")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 focus:bg-transparent" asChild>
                    <Link
                      href={`/${locale}/shipping`}
                      className={cn(
                        "block w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[#ead8c2] focus:bg-[#ead8c2]",
                        isRTL ? "text-right" : "text-left",
                      )}
                      style={{ color: "#3d2b1f" }}
                    >
                      {t("Menu.ShippingReturns")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 focus:bg-transparent" asChild>
                    <Link
                      href={`/${locale}/privacy`}
                      className={cn(
                        "block w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[#ead8c2] focus:bg-[#ead8c2]",
                        isRTL ? "text-right" : "text-left",
                      )}
                      style={{ color: "#3d2b1f" }}
                    >
                      {t("Menu.Privacy")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0 focus:bg-transparent" asChild>
                    <Link
                      href={`/${locale}/about`}
                      className={cn(
                        "block w-full cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-[#ead8c2] focus:bg-[#ead8c2]",
                        isRTL ? "text-right" : "text-left",
                      )}
                      style={{ color: "#3d2b1f" }}
                    >
                      {t("Menu.About")}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Right: search, icons, auth — one quiet strip */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <div className="relative hidden w-[10.5rem] md:block lg:w-48 xl:w-56 mx-2">
            <FaSearch
              className={cn(
                "pointer-events-none absolute top-1/2 z-[1] h-3.5 w-3.5 -translate-y-1/2 text-shop_white",
                isRTL ? "left-2" : "right-2",
              )}
              aria-hidden
            />
            <Input
              type="search"
              placeholder={t("Menu.SearchPlaceholder")}
              className={cn(
                "h-9 rounded-full border border-white/15 bg-white/[0.06] text-sm text-white shadow-none placeholder:text-white/45 focus-visible:border-shop_secondary/50 focus-visible:ring-1 focus-visible:ring-shop_secondary/50",
                isRTL ? "pr-9" : "pl-9",
              )}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-3 text-[11px] font-semibold uppercase tracking-wide text-white/90 shadow-sm transition hover:scale-[1.03] hover:border-shop_secondary/35 hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_secondary"
                aria-label="Change language"
              >
                <LocaleFlag locale={locale as "en" | "ar"} />
                <span>{locale.toUpperCase()}</span>
                <FaChevronDown className="h-3 w-3 text-white/60" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isRTL ? "end" : "start"}
              sideOffset={8}
              className="z-50 w-36 rounded-xl border border-zinc-200/80 bg-white p-1.5 shadow-xl"
            >
              <DropdownMenuItem asChild>
                <Link href={getLocaleHref("en")} className="cursor-pointer rounded-lg">
                  <span className="me-2">
                    <LocaleFlag locale="en" />
                  </span>
                  English
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={getLocaleHref("ar")} className="cursor-pointer rounded-lg">
                  <span className="me-2">
                    <LocaleFlag locale="ar" />
                  </span>
                  العربية
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
            <CartIcon />
            <Link
              href={`/${locale}/wishlist`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/90 transition hover:scale-[1.03] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_secondary"
              aria-label={t("Menu.Wishlist")}
            >
              <WishlistIcon />
            </Link>
          </div>

          {!_hasHydrated ? (
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-white/10" />
          ) : token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2 rounded-lg py-1 pe-1 ps-1 outline-none hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-shop_secondary",
                    isRTL && "flex-row-reverse",
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-shop_secondary text-[11px] font-bold text-shop_dark_primary">
                    {initials}
                  </span>
                  <span className="hidden max-w-[6rem] truncate text-sm text-white/95 lg:inline">
                    {name?.split(" ")[0]}
                  </span>
                  <FaChevronDown className="h-3 w-3 text-white/50" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                sideOffset={8}
                className="w-56 rounded-xl border border-zinc-200/80 p-1.5 shadow-xl"
              >
                <DropdownMenuLabel className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-zinc-900">{name}</p>
                  <p className="text-xs text-zinc-500">{t("Menu.Account")}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/account`} className="cursor-pointer rounded-lg">
                    {t("Menu.Profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/${locale}/orders`} className="cursor-pointer rounded-lg">
                    {t("Orders.Orders")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50"
                >
                  {t("Menu.Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openLogin}
                className="h-8 px-2.5 text-white/90 hover:bg-white/[0.06] hover:text-white"
              >
                {t("Menu.SignIn")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={openSignup}
                className="hidden h-8 rounded-md bg-shop_secondary px-3 text-xs font-semibold text-shop_dark_primary hover:bg-[#0fd86d] sm:inline-flex"
              >
                {t("Menu.SignUp")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={open} onClose={() => setOpen(false)} defaultMode={mode} />
    </div>
  );
}

export default MainMenu;
