"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const { token, name, setToken, setName ,email} = useAuthStore();

  const handleLogout = () => {
    setToken(null);
    setName(null);
    document.cookie = "auth_token=; path=/; max-age=0";
    router.replace(`/${locale}`);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Please login</h1>
          <Link
            href={`/${locale}`}
            className="text-shop_secondary underline"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="bg-white shadow-sm border rounded-xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("Menu.Account")}
          </h1>
          <p className="text-gray-500 mt-1">{name}</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          {t("Auth.logout")}
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

        {/* Sidebar */}
        <div className="bg-white border rounded-xl p-4 space-y-2">

          <Link
            href={`/${locale}/account`}
            className="block px-3 py-2 rounded-lg bg-gray-100 font-medium"
          >
            {t("Menu.Profile")}
          </Link>

          <Link
            href={`/${locale}/orders`}
            className="block px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            {t("Orders.Orders")}
          </Link>

          <Link
            href={`/${locale}/wishlist`}
            className="block px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            {t("Account.MyWishlist")}
          </Link>

          <Link
            href={`/${locale}`}
            className="block px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            {t("Products.BackToShop")}
          </Link>

        </div>

        {/* Main Content */}
        <div className="md:col-span-3 bg-white border rounded-xl p-6">

          <h2 className="text-xl font-semibold mb-4">
            {t('Auth.ProfileInfo')}
          </h2>

          <div className="space-y-4">

            <div>
              <label className="text-sm text-gray-500">{t('Auth.full_name')}</label>
              <p className="font-medium">{name}</p>
            </div>

            <div>
              <label className="text-sm text-gray-500">{t('Auth.email')}</label>
              <p className="font-medium">{email}</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}