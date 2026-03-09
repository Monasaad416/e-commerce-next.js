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
    <div className="w-full flex justify-center mt-12 mb-6">
      <div
        className={`flex items-center bg-gray-100 rounded-full p-2 shadow-sm ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        {filters.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`relative px-8 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
              active === item.key
                ? "bg-shop_dark text-shop_primary shadow-md"
                : "text-muted-foreground hover:text-shop_primary"
            }`}
          >
            {locale === "ar" ? item.label_ar : item.label_en}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeFilter;