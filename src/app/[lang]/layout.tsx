import { Geist, Geist_Mono } from "next/font/google";
import type { AbstractIntlMessages } from "next-intl";
import ClientLayout from "./client-layout";
import "../globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "ORCHID",
  description: "HandMade Products Made With Love",
  icons: {
    icon: [
      { url: "/favicon.jpeg", type: "image/jpeg" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/favicon.jpeg", type: "image/jpeg", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === "ar" ? "ar" : "en";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const messages = await loadMessages(lang);

  return (
    <html lang={lang} dir={dir}>
      <body className={`${plusJakarta.variable} ${geistMono.variable} antialiased bg-shop_dark_primary`}>
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