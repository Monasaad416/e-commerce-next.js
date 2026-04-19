"use client";

import { useLocale, useTranslations } from "next-intl";

export default function ShippingPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Pages");

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16"
    >
      <div
        className="overflow-hidden rounded-[2rem] border p-5 sm:p-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(251,244,234,0.96) 0%, rgba(245,236,224,0.98) 100%)",
          borderColor: "#dcc3a0",
          boxShadow: "0 16px 38px rgba(61,43,31,0.1)",
        }}
      >
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: "#3d2b1f", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {t("Shipping.title")}
        </h1>

        <section className="mt-8 rounded-2xl border border-[#decaad] bg-[#fff8ef] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-[#3d2b1f]">{t("Shipping.shippingTitle")}</h2>
          <p className="mt-3 leading-8 text-[#6e553f]">{t("Shipping.shippingBody")}</p>
        </section>

        <section className="mt-5 rounded-2xl border border-[#decaad] bg-[#fff8ef] p-5 sm:p-6">
          <h2 className="text-xl font-semibold text-[#3d2b1f]">{t("Shipping.returnsTitle")}</h2>
          <p className="mt-3 leading-8 text-[#6e553f]">{t("Shipping.returnsBody")}</p>
        </section>

        <p className="mt-6 text-sm text-[#7c6348]">{t("Shipping.vatNote")}</p>
      </div>
    </section>
  );
}
