"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Pages");

  const items = [
    { q: "Faq.q1", a: "Faq.a1" },
    { q: "Faq.q2", a: "Faq.a2" },
    { q: "Faq.q3", a: "Faq.a3" },
  ] as const;

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div
        className="overflow-hidden rounded-[2rem] border p-5 sm:p-7"
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
          {t("Faq.title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#7c6348]">
          {isRTL
            ? "اضغط على كل سؤال لعرض الإجابة."
            : "Click each question to expand and view the answer."}
        </p>

        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {items.map(({ q, a }, i) => (
            <AccordionItem
              key={q}
              value={`faq-${i}`}
              className="rounded-2xl border border-[#dcc6a8] bg-[#fff8ef] px-4 last:border-b"
            >
              <AccordionTrigger
                className="py-4 text-base font-semibold text-[#3d2b1f] hover:no-underline"
              >
                {t(q)}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-7 text-[#6e553f] sm:text-[15px]">
                {t(a)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
