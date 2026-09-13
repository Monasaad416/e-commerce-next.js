// src/app/[lang]/client-layout.tsx
"use client";

import { ReactNode } from "react";
import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";
import { ToastContainer } from "react-toastify";
import LocaleProvider from "@/components/website/LocaleProvider";
import { APP_TIME_ZONE } from "@/i18n/constants";
import Providers from "../providers";

interface ClientLayoutProps {
    children: ReactNode;
    lang: "en" | "ar";
    /** Loaded on the server so the shell never blocks on a client-side JSON import (avoids layout ↔ page loading flashes). */
    messages: AbstractIntlMessages;
    geistSans: { variable: string };
    geistMono: { variable: string };
    plusJakarta: { variable: string };
}

export default function ClientLayout({
    children,
    lang,
    messages,
    geistSans: _geistSans,
    geistMono: _geistMono,
}: ClientLayoutProps) {
    /**
     * Single QueryClientProvider via <Providers/> (SSR-safe singleton from
     * app/providers.tsx). It must wrap everything — Header, Footer, and the
     * page children — so every `useQuery` in the tree sees the same client.
     * The previous setup nested *two* providers with different clients, which
     * caused transient "No QueryClient set" errors during HMR / portal renders.
     */
    return (
        <Providers>
            <NextIntlClientProvider
                locale={lang}
                messages={messages}
                timeZone={APP_TIME_ZONE}
            >
                <LocaleProvider lang={lang}>
                    <div className="w-full">
                        <Header />
                        <main className="pt-16">{children}</main>
                        <Footer />
                        <ToastContainer
                            position="bottom-right"
                            autoClose={3000}
                            rtl={lang === "ar"}
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
        </Providers>
    );
}
