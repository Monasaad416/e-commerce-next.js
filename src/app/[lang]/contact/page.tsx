"use client";

import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Pages");

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
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
          {isRTL ? "نحن هنا لمساعدتك" : "We are here to help"}
        </p>
        <h1
          className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: "#3d2b1f", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {t("Contact.title")}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[#6e553f]">{t("Contact.intro")}</p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#decaad] bg-[#fff8ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7a56]">
              {t("Contact.emailLabel")}
            </p>
            <a
              href={`mailto:${t("Contact.emailValue")}`}
              className="mt-3 block text-sm font-medium text-[#3d2b1f] underline decoration-[#c9a96e] underline-offset-4"
            >
              {t("Contact.emailValue")}
            </a>
          </div>

          <div className="rounded-2xl border border-[#decaad] bg-[#fff8ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7a56]">
              {t("Contact.phoneLabel")}
            </p>
            <p className="mt-3 text-sm font-medium text-[#3d2b1f]">{t("Contact.phoneValue")}</p>
          </div>

          <div className="rounded-2xl border border-[#decaad] bg-[#fff8ef] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7a56]">
              {t("Contact.hoursLabel")}
            </p>
            <p className="mt-3 text-sm font-medium text-[#3d2b1f]">{t("Contact.hoursValue")}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#d8be9b] bg-[#fffaf4] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#3d2b1f]">
            {isRTL ? "أرسل لنا رسالة" : "Send us a message"}
          </h2>
          <p className="mt-1 text-sm text-[#7c6348]">
            {isRTL
              ? "املأ النموذج وسنعود إليك في أقرب وقت."
              : "Fill in the form and our team will get back to you shortly."}
          </p>

          <form className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#7c6348]">
                {isRTL ? "الاسم" : "Name"}
              </label>
              <Input
                type="text"
                placeholder={isRTL ? "اكتب اسمك" : "Enter your name"}
                className="border-[#d8be9b] bg-[#fffdf9] text-[#3d2b1f]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#7c6348]">
                {t("Contact.emailLabel")}
              </label>
              <Input
                type="email"
                placeholder={isRTL ? "example@mail.com" : "example@mail.com"}
                className="border-[#d8be9b] bg-[#fffdf9] text-[#3d2b1f]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#7c6348]">
                {isRTL ? "الرسالة" : "Message"}
              </label>
              <textarea
                rows={5}
                placeholder={isRTL ? "اكتب رسالتك هنا..." : "Write your message here..."}
                className="w-full rounded-md border border-[#d8be9b] bg-[#fffdf9] px-3 py-2 text-sm text-[#3d2b1f] outline-none transition focus-visible:ring-2 focus-visible:ring-[#c9a96e]"
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="button"
                className="rounded-full bg-[#3d2b1f] px-6 text-[#f8e8d1] hover:bg-[#4a3424]"
              >
                {isRTL ? "إرسال الرسالة" : "Send Message"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
