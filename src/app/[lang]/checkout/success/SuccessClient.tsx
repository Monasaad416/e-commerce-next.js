"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCartStore } from "@/stores/cartStore";

interface SuccessClientProps {
  sessionId?: string;
  orderId?: string;
}

export default function SuccessClient({
  sessionId,
  orderId,
}: SuccessClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === "ar";
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    void clearCart();
  }, [clearCart]);

  const reference = orderId || sessionId;

  return (
    <div className="min-h-[calc(100vh-4rem)] border-b border-shop_light_gray/10 bg-gradient-to-b from-shop_dark_primary via-shop_dark_primary to-shop_dark_primary/95">
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-10">
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="text-shop_light_gray sm:flex-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/${locale}`}
                  className="text-sm transition-colors hover:text-shop_white"
                >
                  {t("Home.title")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className={isRTL ? "rotate-180" : ""} />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-shop_white">
                {t("Payment.Payment_Successful")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-center py-4 sm:py-8">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/60 p-8 text-center shadow-xl shadow-black/30 sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl"
            />

            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-950/50">
              <CheckCircle2
                className="h-11 w-11 text-emerald-300"
                strokeWidth={1.5}
              />
            </div>

            <h1 className="relative text-2xl font-bold tracking-tight text-shop_white sm:text-3xl">
              {t("Payment.Payment_Successful")}
            </h1>

            <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-shop_light_gray/85 sm:text-base">
              {t("Payment.Thank_you_for_your_order!")}
            </p>

            {reference ? (
              <div className="relative mt-6 inline-flex flex-col items-center gap-1 rounded-xl border border-shop_secondary/25 bg-shop_secondary/10 px-5 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-shop_secondary">
                  {t("Payment.Order_Reference")}
                </span>
                <span className="font-mono text-sm font-medium text-shop_white">
                  {orderId ?? sessionId}
                </span>
              </div>
            ) : null}

            <div className="relative mt-8 rounded-2xl border border-shop_light_gray/12 bg-shop_dark_primary/50 p-5 text-start">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-shop_secondary/10 text-shop_secondary">
                  <Package className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 text-sm leading-relaxed text-shop_light_gray/90">
                  <p>{t("Payment.Your_order_has_been_placed_successfully")}</p>
                  <p className="text-shop_light_gray/70">
                    {t(
                      "Payment.You_will_receive_a_confirmation_email_with_your_order_details",
                    )}
                  </p>
                  <p className="text-shop_light_gray/70">
                    {t("Payment.You_can_track_your_order_in_your_account")}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                className="rounded-xl bg-shop_secondary px-6 font-semibold text-shop_dark_primary hover:bg-shop_secondary/90"
              >
                <Link href={`/${locale}/orders`}>
                  {t("Payment.Go_to_My_Orders")}
                  <ArrowRight
                    className={isRTL ? "h-4 w-4 rotate-180" : "h-4 w-4"}
                  />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-xl border-shop_light_gray/25 bg-shop_dark_primary/40 px-6 text-shop_white hover:border-shop_light_gray/40 hover:bg-shop_dark_primary/70 hover:text-shop_white"
              >
                <Link href={`/${locale}/shop`}>
                  {t("Payment.Continue_Shopping")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
