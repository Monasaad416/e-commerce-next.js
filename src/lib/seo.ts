import type { Metadata } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import { routing } from "@/i18n/routings";

export type AppLocale = "en" | "ar";

type PageKey =
  | "home"
  | "shop"
  | "about"
  | "contact"
  | "faq"
  | "shipping"
  | "privacy";

const copy: Record<
  AppLocale,
  Record<PageKey, { title: string; description: string }> & {
    defaultTitle: string;
    defaultDescription: string;
  }
> = {
  en: {
    defaultTitle: `${SITE_NAME} | Handmade Leather Goods`,
    defaultDescription:
      "Discover handmade leather bags, wallets, belts, and accessories crafted with care. Shop ORCHID premium leather goods.",
    home: {
      title: `${SITE_NAME} | Handmade Leather Goods`,
      description:
        "Premium handmade leather products made with love. Explore bags, wallets, belts, and accessories from ORCHID.",
    },
    shop: {
      title: "Shop",
      description:
        "Browse the full ORCHID collection of handmade leather goods. Filter by category, price, and color.",
    },
    about: {
      title: "About Us",
      description:
        "Learn about ORCHID — curated leather goods that blend practical elegance with durable craftsmanship.",
    },
    contact: {
      title: "Contact",
      description:
        "Get in touch with ORCHID for product questions, orders, and support.",
    },
    faq: {
      title: "FAQ",
      description:
        "Answers to common questions about ORCHID shipping, returns, materials, and orders.",
    },
    shipping: {
      title: "Shipping & Returns",
      description:
        "ORCHID shipping timelines, delivery details, and returns policy.",
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "How ORCHID collects, uses, and protects your personal information.",
    },
  },
  ar: {
    defaultTitle: `${SITE_NAME} | منتجات جلدية يدوية`,
    defaultDescription:
      "اكتشف الحقائب والمحافظ والأحزمة والإكسسوارات الجلدية المصنوعة يدويًا بعناية من أوركيد.",
    home: {
      title: `${SITE_NAME} | منتجات جلدية يدوية`,
      description:
        "منتجات جلدية يدوية فاخرة مصنوعة بحب. تسوق الحقائب والمحافظ والأحزمة والإكسسوارات من أوركيد.",
    },
    shop: {
      title: "المتجر",
      description:
        "تصفح تشكيلة أوركيد الكاملة من المنتجات الجلدية اليدوية مع خيارات التصنيف والسعر واللون.",
    },
    about: {
      title: "من نحن",
      description:
        "تعرف على أوركيد — منتجات جلدية مختارة تجمع بين الأناقة العملية وجودة التصنيع.",
    },
    contact: {
      title: "تواصل معنا",
      description: "تواصل مع أوركيد للاستفسارات والطلبات والدعم.",
    },
    faq: {
      title: "الأسئلة الشائعة",
      description:
        "إجابات عن الشحن والإرجاع والخامات والطلبات في متجر أوركيد.",
    },
    shipping: {
      title: "الشحن والإرجاع",
      description: "مواعيد الشحن وتفاصيل التوصيل وسياسة الإرجاع في أوركيد.",
    },
    privacy: {
      title: "سياسة الخصوصية",
      description: "كيف تجمع أوركيد بياناتك الشخصية وتستخدمها وتحميها.",
    },
  },
};

export function normalizeLocale(lang?: string): AppLocale {
  return lang === "ar" ? "ar" : "en";
}

/** Path without locale prefix, e.g. `/shop` or `` for home. */
export function localizedPath(lang: AppLocale, path: string = ""): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `/${lang}${clean}`;
}

export function languageAlternates(path: string = "") {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = localizedPath(locale as AppLocale, path);
  }
  languages["x-default"] = localizedPath(
    routing.defaultLocale as AppLocale,
    path,
  );
  return languages;
}

type BuildArgs = {
  lang: string;
  path?: string;
  title?: string;
  description?: string;
  page?: PageKey;
  image?: string | null;
  noIndex?: boolean;
};

export function buildPageMetadata({
  lang,
  path = "",
  title,
  description,
  page,
  image,
  noIndex = false,
}: BuildArgs): Metadata {
  const locale = normalizeLocale(lang);
  const pageCopy = page ? copy[locale][page] : null;
  const finalTitle = title || pageCopy?.title || copy[locale].defaultTitle;
  const finalDescription =
    description || pageCopy?.description || copy[locale].defaultDescription;
  const canonical = localizedPath(locale, path);
  const ogImage = image || "/favicon.jpeg";
  // Home (and any full branded title) should not get the layout `%s | ORCHID` template twice.
  const useAbsoluteTitle = page === "home" || Boolean(title && title.includes(SITE_NAME));

  return {
    title: useAbsoluteTitle ? { absolute: finalTitle } : finalTitle,
    description: finalDescription,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SA"],
      url: canonical,
      siteName: SITE_NAME,
      title: finalTitle,
      description: finalDescription,
      images: [{ url: ogImage, alt: finalTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

export function getSeoCopy(lang: string, page: PageKey) {
  return copy[normalizeLocale(lang)][page];
}

export { getSiteUrl, SITE_NAME };
