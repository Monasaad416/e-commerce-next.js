"use client";

import { useLocale, useTranslations } from "next-intl";

export default function AboutPage() {
  const tMenu = useTranslations("Menu");
  const locale = useLocale();
  const isRTL = locale === "ar";

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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b7355]">
          {isRTL ? "نبذة عنا" : "About Our Brand"}
        </p>
        <h1
          className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: "#3d2b1f", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {tMenu("About")}
        </h1>

        <div className="mt-6 rounded-2xl border border-[#decaad] bg-[#fff8ef] p-5 sm:p-6">
          <p className="leading-8 text-[#6e553f]">
            {locale === "ar"
              ? "نقدم منتجات جلدية وإكسسوارات مختارة بعناية، بتصميم يجمع بين الأناقة العملية وجودة التصنيع. نؤمن أن التفاصيل الصغيرة تصنع الفرق، لذلك نركز على الخامات المميزة، التشطيب المتقن، وخدمة عملاء موثوقة في كل خطوة."
              : "We offer carefully curated leather goods and accessories that blend practical elegance with durable craftsmanship. We believe details make the difference, so we focus on premium materials, refined finishing, and dependable customer support at every step."}
          </p>
        </div>
      </div>
    </section>
  );
}
