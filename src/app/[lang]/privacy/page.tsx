"use client";

import { useLocale, useTranslations } from "next-intl";

export default function PrivacyPage() {
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
          {t("Privacy.title")}
        </h1>

        <div className="mt-8 rounded-2xl border border-[#decaad] bg-[#fff8ef] p-5 sm:p-6">
          <p className="leading-8 text-[#6e553f]">{t("Privacy.body")}</p>
        </div>
      </div>
    </section>
  );
}
