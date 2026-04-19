// src/app/[lang]/client-layout.tsx
'use client';

import { ReactNode, useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import { ToastContainer } from "react-toastify";
import LocaleProvider from "@/components/website/LocaleProvider";
import Providers from "../providers";

interface ClientLayoutProps {
  children: ReactNode;
  lang: 'en' | 'ar';
  geistSans: { variable: string };
  geistMono: { variable: string };
  plusJakarta: { variable: string };
}

export default function ClientLayout({ 
  children, 
  lang, 
  geistSans, 
  geistMono 
}: ClientLayoutProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    import(`../../../messages/${lang}.json`)
      .then((msgs) => setMessages(msgs.default))
      .catch(console.error);
  }, [lang]);

  if (!messages) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-shop_dark_primary text-shop_white px-6"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="h-10 w-10 rounded-full border-2 border-shop_light_gray/30 border-t-shop_secondary animate-spin" />
        <p className="text-sm text-shop_light_gray">
          {lang === "ar" ? "جاري التحميل…" : "Loading…"}
        </p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={lang} messages={messages}>
        <LocaleProvider lang={lang}>
          <div className="w-full">
            <Header />
            <main className="pt-16">
              <Providers>
                {children}
              </Providers>
            </main>
            <Footer />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              rtl={lang === 'ar'}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </LocaleProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}