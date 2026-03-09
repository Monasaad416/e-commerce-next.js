"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"
import AuthModal from "@/components/website/Auth/AuthModal"

import logo from "@/assets/imgs/logo/logo.jpeg"
import WishlistIcon from "./WishlistIcon"
import UserIcon from "./UserIcon"
import CartIcon from "./CartIcon"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import fetchCategories from "@/data/categories"
import { Input } from "../ui/input"
import { ICategory } from "@/interfaces/categoryType"
import { useLocalizedValue } from "@/hooks/useLocalizedValue"

export function MainMenu() {
  const locale = useLocale()
  const isRTL = locale === "ar"

  const [categories, setCategories] = useState<ICategory[]>([])
  const tValue = useLocalizedValue()
  const t = useTranslations()
    const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")

  const openLogin = () => { setMode("login"); setOpen(true) }
  const openSignup = () => { setMode("signup"); setOpen(true) }

  useEffect(() => {
    const loadCategories = async () => {
      const allCategories = await fetchCategories()
      setCategories(allCategories?.categories || [])
    }
    loadCategories()
  }, [])

  return (
    <header
      className="hidden md:block w-full border-b bg-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LEFT: Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image
            src={logo}
            alt="logo"
            width={45}
            height={45}
            className="rounded-full object-cover"
          />
        </Link>

        {/* CENTER: Navigation */}
  <NavigationMenu>
  <NavigationMenuList
    className={`gap-6 flex ${
      locale === "ar" ? "flex-row-reverse" : "flex-row"
    }`}
  >

            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href={`/${locale}`}>{t("Menu.Home")}</Link>
              </NavigationMenuLink>
            {/* </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid grid-cols-2 gap-4 w-[600px] p-6">
                  {categories.map((item) => (
                    <li key={item.id}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/${locale}/shop?category=${item.slug}`}
                          className="block p-3 rounded-lg hover:bg-gray-100 transition"
                        >
                          {tValue(item.name)}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem> */}
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link href={`/${locale}/shop`}>{t("Menu.Shop")}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>

        {/* RIGHT: Search + Icons */}
        <div className="flex items-center gap-6">

          {/* Search */}
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-4 pr-10 py-2 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-black"
            />
            <FaSearch
              className={`absolute top-1/2 -translate-y-1/2 text-gray-500 ${
                isRTL ? "left-4" : "right-4"
              }`}
            />
          </div>

          {/* Icons */}
        {/* Icons */}
        <div className="flex items-center gap-4 text-lg">
          <CartIcon />
          <Link href={`/${locale}/wishlist`}>
            <WishlistIcon />
          </Link>

          {/* Auth buttons — NOT inside Link */}
          <button
            onClick={openLogin}
            className="text-sm font-medium text-black hover:text-gray-700 transition cursor-pointer"
          >
            {t("Menu.SignIn")}
          </button>
          <button
            onClick={openSignup}
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition cursor-pointer"
          >
            {t("Menu.SignUp")}
          </button>
        </div>

        {/* Modal — outside ALL other elements, just before closing </div> of RIGHT section */}
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