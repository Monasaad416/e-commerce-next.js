import { useLocale } from "next-intl"
import { resolveImageUrl } from "@/lib/media"
import { BannerItem } from "./BannerItem"
import Image from "next/image"

type LocalizedField = Record<string, string | undefined>
type SecHomeBannerContent = Record<string, unknown>

const SecHomeBanner = ({ content }: { content: SecHomeBannerContent }) => {
  const locale = useLocale()
  const dir = locale === "ar" ? "rtl" : "ltr"
  const isRTL = locale === "ar"
  const t = (key: string) => (content[key] as LocalizedField | undefined)?.[locale] || ""
  const img = (key: string) => resolveImageUrl(content[key] as string | null | undefined)

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

        <div className={`mb-7 flex flex-col gap-4 ${isRTL ? "lg:flex-row-reverse" : "lg:flex-row"} lg:items-end lg:justify-between`}>
          <div>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: "#8b7355" }}
            >
              {isRTL ? "صناعة يدوية فاخرة" : "Handcrafted With Care"}
            </p>
            <h2
              className="max-w-lg text-2xl font-bold leading-snug sm:text-3xl"
              style={{ color: "#3d2b1f", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {isRTL ? "مختارات الجلد الطبيعي" : "Curated Leather Collections"}
            </h2>
          </div>
          <span
            className="inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium"
            style={{ borderColor: "#d5b894", color: "#7c5c3f", backgroundColor: "#f5ebdf" }}
          >
            {isRTL ? "تصميم عملي وأنيق" : "Modern craftsmanship"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-2xl lg:col-span-7">
            <div className="absolute inset-0">
              <Image
                src={img("sec_banner_sec_half_image")}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                alt={t("sec_banner_sec_half_title") || "banner"}
                loading="eager"
                unoptimized
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(35,22,10,0.82) 0%, rgba(35,22,10,0.3) 45%, transparent 100%)" }}
              />
            </div>

            <div className="relative z-10 p-7 sm:p-9">
              <span
                className="mb-3 inline-block text-[10px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: "#c9a96e" }}
              >
                {isRTL ? "جديد الموسم" : "New Arrival"}
              </span>
              <h2
                className="mb-2 max-w-sm text-2xl font-bold leading-tight text-white sm:text-3xl"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {t("sec_banner_sec_half_title")}
              </h2>
              <p className="max-w-md text-sm leading-6 text-[rgba(255,255,255,0.72)]">
                {t("sec_banner_sec_half_subtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <BannerItem
              image={img("sec_banner_first_half_part1_image")}
              title={t("sec_banner_first_half_part1_title")}
              subtitle={t("sec_banner_first_half_part1_subtitle")}
            />
            <BannerItem
              image={img("sec_banner_first_half_part2_image")}
              title={t("sec_banner_first_half_part2_title")}
              subtitle={t("sec_banner_first_half_part2_subtitle")}
            />
            <BannerItem
              image={img("sec_banner_first_half_part3_image")}
              title={t("sec_banner_first_half_part3_title")}
              subtitle={t("sec_banner_first_half_part3_subtitle")}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecHomeBanner
