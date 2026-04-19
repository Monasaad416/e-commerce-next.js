"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6";
import logo from "@/assets/imgs/logo/logo.jpeg"
import Image from "next/image";

export default function Footer() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer
      dir={isRTL ? "rtl" : "ltr"}
      className="mt-20 border-t border-[#4c3526]"
      style={{
        background:
          "linear-gradient(180deg, rgba(26,18,14,0.98) 0%, rgba(17,12,9,1) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src={logo} alt="logo" width={45} height={45} className="rounded-full object-cover" />
            <p className="mt-3 text-sm leading-6 text-[#ccb391]">
              {locale === "ar"
                ? "منتجات جلدية يدوية بتفاصيل أنيقة وجودة تدوم."
                : "Handmade leather products crafted with timeless style and lasting quality."}
            </p>
            <div className="mt-5 inline-flex items-center rounded-full border border-[#5c4330] bg-[#2a1d14] px-3 py-1 text-xs font-medium text-[#d9be97]">
              {locale === "ar" ? "صناعة يدوية 100%" : "100% Handcrafted"}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#dcb986]">
              {t("Footer.QuickLinks") || "Quick Links"}
            </h3>
            <ul className="space-y-2.5 text-sm text-[#c9ac85]">
              <li>
                <Link href={`/${locale}`} className="transition hover:text-[#f2d5ac]">
                  {t("Menu.Home")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop`} className="transition hover:text-[#f2d5ac]">
                  {t("Menu.Shop")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/orders`} className="transition hover:text-[#f2d5ac]">
                  {t("Orders.Orders")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/account`} className="transition hover:text-[#f2d5ac]">
                  {t("Menu.Account")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="transition hover:text-[#f2d5ac]">
                  {t("Menu.About")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#dcb986]">
              {t("Footer.Support") || "Support"}
            </h3>
            <ul className="space-y-2.5 text-sm text-[#c9ac85]">
              <li>
                <Link href={`/${locale}/contact`} className="transition hover:text-[#f2d5ac]">
                  {t("Footer.Contact_Us")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shipping`} className="transition hover:text-[#f2d5ac]">
                  {t("Menu.ShippingReturns")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/faq`} className="transition hover:text-[#f2d5ac]">
                  {t("Footer.FAQ")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="transition hover:text-[#f2d5ac]">
                  {t("Menu.Privacy")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#dcb986]">
              {locale === "ar" ? "تابعنا" : "Follow Us"}
            </h3>
            <div className="flex gap-3 text-lg">
              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#5f4431] bg-[#2a1d14] text-[#d7ba92] transition hover:border-[#c9a96e] hover:text-[#f6dfbc]"
                href="#"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#5f4431] bg-[#2a1d14] text-[#d7ba92] transition hover:border-[#c9a96e] hover:text-[#f6dfbc]"
                href="#"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#5f4431] bg-[#2a1d14] text-[#d7ba92] transition hover:border-[#c9a96e] hover:text-[#f6dfbc]"
                href="#"
                aria-label="X"
              >
                <FaXTwitter />
              </a>
            </div>
            <p className="mt-6 text-xs text-[#ab8f6d]">
              © {year} {t("Menu.Logo")} {t("Footer.AllRightsReserved")}
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-[#4c3526] pt-4 text-center text-xs text-[#ab8f6d]">
          {t("Footer.BuiltWithLove") || "Built with care for premium handmade shopping"}
        </div>
      </div>
    </footer>
  );
}