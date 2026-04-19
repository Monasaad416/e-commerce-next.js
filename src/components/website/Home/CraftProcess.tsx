"use client";

import { useLocale } from "next-intl";
import { PiCheckCircle, PiFeatherFill, PiNeedle } from "react-icons/pi";

const steps = {
  en: {
    eyebrow: "Handcrafted Standard",
    title: "From premium leather to a finished piece made to last.",
    subtitle:
      "Every product goes through careful material selection, hand finishing, and a final quality check before it reaches you.",
    items: [
      {
        title: "Select Leather",
        text: "We choose rich, durable leather with character, texture, and long-term wear in mind.",
        icon: PiFeatherFill,
      },
      {
        title: "Hand Stitching",
        text: "Edges, seams, and details are refined by hand for a cleaner and more premium finish.",
        icon: PiNeedle,
      },
      {
        title: "Final Inspection",
        text: "Each piece is reviewed for balance, durability, and presentation before shipping.",
        icon: PiCheckCircle,
      },
    ],
  },
  ar: {
    eyebrow: "معيار الصناعة اليدوية",
    title: "من الجلد الفاخر إلى قطعة نهائية مصنوعة لتدوم.",
    subtitle:
      "كل منتج يمر باختيار دقيق للخامة، ولمسات يدوية، وفحص نهائي للجودة قبل أن يصل إليك.",
    items: [
      {
        title: "اختيار الجلد",
        text: "نختار الجلود الغنية بالملمس والطابع مع التركيز على الجودة والتحمل على المدى الطويل.",
        icon: PiFeatherFill,
      },
      {
        title: "الخياطة اليدوية",
        text: "يتم تشطيب الحواف والتفاصيل يدويًا للحصول على مظهر أنيق وإحساس أكثر فخامة.",
        icon: PiNeedle,
      },
      {
        title: "الفحص النهائي",
        text: "نراجع كل قطعة من حيث التوازن والمتانة وطريقة العرض قبل الشحن.",
        icon: PiCheckCircle,
      },
    ],
  },
};

const CraftProcess = () => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const content = isRTL ? steps.ar : steps.en;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="overflow-hidden rounded-[28px] border px-5 py-8 sm:px-7 sm:py-10 lg:px-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(26,18,14,0.96) 0%, rgba(19,13,10,1) 100%)",
          borderColor: "#3d2b1f",
          boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
        }}
      >
        <div
          className={`flex flex-col gap-8 ${isRTL ? "lg:flex-row-reverse" : "lg:flex-row"} lg:items-end lg:justify-between`}
        >
          <div className="max-w-2xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: "#c9a96e" }}
            >
              {content.eyebrow}
            </p>
            <h2
              className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-[2.1rem]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {content.title}
            </h2>
            <p
              className="mt-4 max-w-xl text-sm leading-7 sm:text-[15px]"
              style={{ color: "rgba(245, 230, 211, 0.74)" }}
            >
              {content.subtitle}
            </p>
          </div>

          <div
            className="inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-medium"
            style={{
              borderColor: "#5a4130",
              color: "#e9d3b3",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "#c9a96e" }}
            />
            {isRTL ? "صناعة بلمسة فاخرة" : "Luxury made by hand"}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {content.items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-[24px] border p-5 transition-transform duration-300 hover:-translate-y-1"
                style={{
                  borderColor: "#473223",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ backgroundColor: "#7a5a3f" }}
                />
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: "#2f2118",
                      color: "#d8b481",
                    }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "#8f6e4b" }}
                  >
                    0{index + 1}
                  </span>
                </div>

                <h3
                  className="mt-6 text-lg font-semibold"
                  style={{ color: "#f6ebdd" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-3 text-sm leading-6"
                  style={{ color: "rgba(233, 211, 179, 0.72)" }}
                >
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CraftProcess;
