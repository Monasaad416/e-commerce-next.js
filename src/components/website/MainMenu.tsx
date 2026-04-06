"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { FaSearch } from "react-icons/fa"
import AuthModal from "@/components/website/Auth/AuthModal"

import logo from "@/assets/imgs/logo/logo.jpeg"
import WishlistIcon from "./WishlistIcon"
import CartIcon from "./CartIcon"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "../ui/input"

import { useAuthStore } from "@/stores/authStore"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function MainMenu() {
  const { token, name, _hasHydrated } = useAuthStore()
  const clearToken = useAuthStore((s) => s.setToken)
  const clearName = useAuthStore((s) => s.setName)

  const router = useRouter()
  const locale = useLocale()
  const isRTL = locale === "ar"
  const t = useTranslations()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")

  const openLogin = () => { setMode("login"); setOpen(true) }
  const openSignup = () => { setMode("signup"); setOpen(true) }


const initials = name
  ?.trim()
  .split(" ")
  .filter(Boolean)           // ✅ remove empty strings
  .map((w) => w[0])
  .slice(0, 2)
  .join("")
  .toUpperCase() || "?"      // ✅ fallback if name is null/empty

const handleLogout = () => {
  clearToken(null)
  clearName(null)
  document.cookie = "auth_token=; path=/; max-age=0"
  router.replace(`/${locale}`)
  window.location.reload()  
}

  return (
    <header className="hidden md:block w-full border-b bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image src={logo} alt="logo" width={45} height={45} className="rounded-full object-cover" />
        </Link>
        {/* Navigation */}
        <NavigationMenu>
          <NavigationMenuList className={`gap-6 flex ${locale === "ar" ? "flex-row-reverse" : "flex-row"}`}>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href={`/${locale}`}>{t("Menu.Home")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href={`/${locale}/shop`}>{t("Menu.Shop")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {/* Right */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-4 pr-10 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-black"
            />
            <FaSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${isRTL ? "left-4" : "right-4"}`} />
          </div>
          {/* Icons */}
   {/* Icons */}
<div className="flex items-center gap-4 text-lg">
  <CartIcon />
  <Link href={`/${locale}/wishlist`}>
    <WishlistIcon />
  </Link>

  {!_hasHydrated ? (
    // Skeleton while loading from localStorage
    <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse" />

  ) : token ? (
    // ── Logged in — dropdown ──
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 outline-none">
          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#111", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600, letterSpacing: 1,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <span className="hidden lg:block text-sm font-medium text-gray-800 group-hover:text-black transition-colors">
            {name?.split(" ")[0]}
          </span>
          <svg
            className="w-3.5 h-3.5 text-gray-400 group-hover:text-black transition-all duration-200 group-data-[state=open]:rotate-180"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-56 rounded-xl border border-gray-100 shadow-xl shadow-black/8 p-1.5 bg-white"
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-400 font-normal mt-0.5">{t("Menu.Account")}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-100 my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href={`/${locale}/account`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-black cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {t("Menu.Profile")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/${locale}/orders`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-black cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {t("Orders.Orders")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-100 my-1" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors focus:text-red-600 focus:bg-red-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          {t("Menu.Logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  ) : (
    // ✅ Logged out — show Sign In + Sign Up buttons
    <>
      <button
        onClick={openLogin}
        className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
      >
        {t("Menu.SignIn")}
      </button>
      <button
        onClick={openSignup}
        className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
      >
        {t("Menu.SignUp")}
      </button>
    </>
  )}
</div>
          <AuthModal
            isOpen={open}
            onClose={() => setOpen(false)}
            defaultMode={mode}
          />
        </div>
      </div>
    </header>
  )
}

export default MainMenu