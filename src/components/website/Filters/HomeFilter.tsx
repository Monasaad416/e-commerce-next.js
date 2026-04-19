"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

const filters = [
  { key: "new", label_en: "New Arrivals", label_ar: "وصل حديثًا" },
  { key: "best", label_en: "Best Sellers", label_ar: "الأكثر مبيعًا" },
  { key: "top", label_en: "Top Rated", label_ar: "الأعلى تقييمًا" },
];

const HomeFilter = () => {
  const [active, setActive] = useState("new");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="mb-6 mt-8 flex w-full justify-center sm:mt-12">
      <div
        className={`relative flex w-full max-w-2xl items-center justify-center gap-2 rounded-full border px-2 py-2 ${
          isRTL ? "flex-row-reverse" : ""
        }`}
        style={{
          backgroundColor: "#f7f1e8",
          borderColor: "#dcc3a0",
          boxShadow: "0 14px 34px rgba(61,43,31,0.14)",
        }}
        role="tablist"
        aria-label={locale === "ar" ? "تصفية المنتجات" : "Product highlights"}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[6px] rounded-full border border-dashed"
          style={{ borderColor: "#d5b894" }}
        />
        {filters.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(item.key)}
              className={`relative z-10 min-h-11 flex-1 rounded-full px-4 py-2.5 text-xs font-semibold tracking-[0.02em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shop_secondary focus-visible:ring-offset-2 sm:flex-none sm:px-8 sm:text-sm ${
                isActive
                  ? "scale-[1.01] shadow-lg"
                  : "text-[#7b634a] hover:-translate-y-[1px] hover:bg-[#efe2d3] hover:text-[#3d2b1f]"
              }`}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, #2f1f14 0%, #3d2b1f 40%, #533a2a 100%)",
                      color: "#f8e9d6",
                      boxShadow: "0 10px 22px rgba(61,43,31,0.34)",
                    }
                  : undefined
              }
            >
              {isActive && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-[3px] rounded-full border border-dashed"
                  style={{ borderColor: "#c9a67b" }}
                />
              )}
              {locale === "ar" ? item.label_ar : item.label_en}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HomeFilter;