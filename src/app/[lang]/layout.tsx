import type { Metadata } from "next";
import type { AbstractIntlMessages } from "next-intl";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import ClientLayout from "./client-layout";
import "../globals.css";
import { buildPageMetadata, normalizeLocale } from "@/lib/seo";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

async function loadMessages(lang: "en" | "ar"): Promise<AbstractIntlMessages> {
  if (lang === "ar") {
    return (await import("../../../messages/ar.json")).default;
  }
  return (await import("../../../messages/en.json")).default;
}

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = normalizeLocale(lang);
  const base = buildPageMetadata({ lang: locale, page: "home", path: "" });

  return {
    metadataBase: new URL(getSiteUrl()),
    ...base,
    title: {
      default: base.title as string,
      template: `%s | ${SITE_NAME}`,
    },
    icons: {
      icon: [
        { url: "/favicon.jpeg", type: "image/jpeg" },
        { url: "/favicon.ico", sizes: "32x32" },
      ],
      apple: [{ url: "/favicon.jpeg", type: "image/jpeg", sizes: "180x180" }],
    },
    manifest: "/manifest.json",
    applicationName: SITE_NAME,
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  const lang = normalizeLocale(resolvedParams.lang);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const messages = await loadMessages(lang);

  return (
    <html lang={lang} dir={dir}>
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} antialiased bg-shop_dark_primary`}
      >
        <ClientLayout
          lang={lang}
          messages={messages}
          plusJakarta={plusJakarta}
          geistSans={geistSans}
          geistMono={geistMono}
        >
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
