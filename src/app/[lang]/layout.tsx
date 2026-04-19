import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "./client-layout";
import "../globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

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

export const metadata = {
  title: "ORCHID",
  description: "HandMade Products Made With Love",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/manifest.json',
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

  return (
    <html lang={lang} dir={dir}>
      <body className={`${plusJakarta.variable} ${geistMono.variable} antialiased bg-shop_dark_primary`}>
        <ClientLayout 
          lang={lang}
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