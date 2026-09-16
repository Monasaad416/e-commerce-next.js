import Link from "next/link"
import { resolveImageUrl } from "@/lib/media"
import {
  LEATHER_BANNER_SLOTS,
  resolveLeatherAwareUrl,
} from "@/lib/leatherMedia"
import { getLocalizedString } from "@/lib/localizedField"
import { BannerItem } from "./BannerItem"
import Image from "next/image"

type SecHomeBannerContent = Record<string, unknown> | undefined

function partImageUrl(
  content: SecHomeBannerContent,
  key: string,
  fallback: string,
): string {
  const path = content?.[key]
  const resolved =
    typeof path === "string" && path.trim()
      ? resolveImageUrl(path, { key })
      : ""
  return resolveLeatherAwareUrl(resolved || undefined, {
    fallback,
    key,
  })
}

type SecHomeBannerProps = {
  content: SecHomeBannerContent
  lang: string
}

const SecHomeBanner = ({ content, lang }: SecHomeBannerProps) => {
  const dir = lang === "ar" ? "rtl" : "ltr"

  const localized = (key: string) =>
    getLocalizedString(content?.[key], lang)

  const btnLinkRaw =
    typeof content?.sec_banner_sec_half_button_link === "string"
      ? content.sec_banner_sec_half_button_link.trim()
      : ""
  const btnText = localized("sec_banner_sec_half_button_text").trim()

  const secHalfImagePath =
    typeof content?.sec_banner_sec_half_image === "string"
      ? content.sec_banner_sec_half_image.trim()
      : ""
  const secHalfImageUrl = resolveLeatherAwareUrl(
    secHalfImagePath
      ? resolveImageUrl(secHalfImagePath, { key: "sec-half" })
      : undefined,
    { fallback: LEATHER_BANNER_SLOTS.feature, key: "sec-half" },
  )

  const secTitle = localized("sec_banner_sec_half_title").trim()
  const secSubtitle = localized("sec_banner_sec_half_subtitle").trim()

  // Always show leather promo tiles — CMS copy when present, local leather photos otherwise
  const hasFirstHalf = true
  const hasSecHalf = true

  return (
    <section dir={dir} className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-[2rem] border px-4 py-6 sm:px-6 sm:py-7"
        style={{
          background:
            "linear-gradient(180deg, rgba(251,244,234,0.95) 0%, rgba(245,236,224,0.98) 100%)",
          borderColor: "#dcc3a0",
          boxShadow: "0 16px 38px rgba(61,43,31,0.1)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-14 start-[12%] h-52 w-52 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(201,169,110,0.16)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 end-[8%] h-40 w-40 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(117,84,58,0.12)" }}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          {hasFirstHalf ? (
            <div
              className={`flex flex-col gap-4 ${hasSecHalf ? "lg:col-span-6" : "lg:col-span-12"}`}
            >
              <BannerItem
                image={partImageUrl(
                  content,
                  "sec_banner_first_half_part1_image",
                  LEATHER_BANNER_SLOTS.part1,
                )}
                title={
                  localized("sec_banner_first_half_part1_title") ||
                  (lang === "ar" ? "حقائب جلدية" : "Leather Bags")
                }
                subtitle={
                  localized("sec_banner_first_half_part1_subtitle") ||
                  (lang === "ar"
                    ? "تصاميم يدوية من الجلد الطبيعي"
                    : "Handmade natural leather designs")
                }
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <BannerItem
                  image={partImageUrl(
                    content,
                    "sec_banner_first_half_part2_image",
                    LEATHER_BANNER_SLOTS.part2,
                  )}
                  title={
                    localized("sec_banner_first_half_part2_title") ||
                    (lang === "ar" ? "محافظ" : "Wallets")
                  }
                  subtitle={
                    localized("sec_banner_first_half_part2_subtitle") ||
                    (lang === "ar"
                      ? "تفاصيل دقيقة وخامات فاخرة"
                      : "Fine details, premium materials")
                  }
                />
                <BannerItem
                  image={partImageUrl(
                    content,
                    "sec_banner_first_half_part3_image",
                    LEATHER_BANNER_SLOTS.part3,
                  )}
                  title={
                    localized("sec_banner_first_half_part3_title") ||
                    (lang === "ar" ? "أحزمة" : "Belts")
                  }
                  subtitle={
                    localized("sec_banner_first_half_part3_subtitle") ||
                    (lang === "ar"
                      ? "أناقة عملية لليوم كاملاً"
                      : "Practical elegance for every day")
                  }
                />
              </div>
            </div>
          ) : null}

          {hasSecHalf ? (
            <div
              className={`group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-2xl lg:col-span-6 ${
                !hasFirstHalf ? "lg:col-span-12" : ""
              }`}
            >
              <div className="absolute inset-0">
                <Image
                  src={secHalfImageUrl}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  alt={
                    secTitle ||
                    (lang === "ar" ? "تشكيلة الجلد" : "Leather collection")
                  }
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(35,22,10,0.82) 0%, rgba(35,22,10,0.3) 45%, transparent 100%)",
                  }}
                />
              </div>

              <div className="relative z-10 p-7 sm:p-9">
                <h2
                  className="mb-2 max-w-sm text-2xl font-bold leading-tight text-white sm:text-3xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {secTitle ||
                    (lang === "ar"
                      ? "تشكيلة الجلد الفاخرة"
                      : "Premium Leather Collection")}
                </h2>
                <p className="max-w-md text-sm leading-6 text-[rgba(255,255,255,0.72)]">
                  {secSubtitle ||
                    (lang === "ar"
                      ? "قطع مختارة من الجلد الطبيعي — حقائب، محافظ، وأحزمة."
                      : "Curated natural leather — bags, wallets, and belts.")}
                </p>
                <Link
                  href={`/${lang}/${btnLinkRaw || "shop"}`}
                  className="mt-6 inline-flex rounded-full border border-[#d2b183] bg-[#c9a96e] px-5 py-2.5 text-sm font-semibold text-[#26180f] shadow-sm outline-none transition hover:bg-[#d9bb87] focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {btnText || (lang === "ar" ? "تسوّق الآن" : "Shop now")}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default SecHomeBanner
