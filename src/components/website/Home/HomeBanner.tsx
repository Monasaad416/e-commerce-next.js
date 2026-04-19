import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import Title from "@/components/website/Title";
import { IHomeBannerProps } from "@/interfaces/HomeBannerType";

type BannerLocale = "en" | "ar";

const staticBannerContent: Record<
  BannerLocale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    btnText: string;
    btnLink: string;
    imageUrl: string;
    trustPoints: string[];
    stats: Array<{ value: string; label: string }>;
  }
> = {
  en: {
    eyebrow: "Leather Handmade Collection",
    title: "Crafted leather essentials built to last.",
    subtitle:
      "Discover handmade wallets, bags, and accessories designed with premium materials, clean stitching, and timeless style.",
    btnText: "Shop Collection",
    btnLink: "shop",
    imageUrl: "/home-banner.png",
    trustPoints: ["Full-grain leather", "Hand-stitched details", "Built for daily use"],
    stats: [
      { value: "100%", label: "Handmade finish" },
      { value: "48H", label: "Fast processing" },
      { value: "4.9/5", label: "Customer rating" },
    ],
  },
  ar: {
    eyebrow: "مجموعة الجلد اليدوية",
    title: "منتجات جلدية مصنوعة يدويًا بجودة تدوم.",
    subtitle:
      "اكتشف المحافظ والحقائب والإكسسوارات الجلدية المصممة بخامات فاخرة وتشطيب يدوي أنيق.",
    btnText: "تسوق المجموعة",
    btnLink: "shop",
    imageUrl: "/home-banner.png",
    trustPoints: ["جلد طبيعي فاخر", "تفاصيل خياطة يدوية", "مصمم للاستخدام اليومي"],
    stats: [
      { value: "100%", label: "تشطيب يدوي" },
      { value: "48H", label: "تجهيز سريع" },
      { value: "4.9/5", label: "تقييم العملاء" },
    ],
  },
};

const HomeBanner = ({
  title,
  subtitle,
  imageUrl,
  btnText,
  btnLink,
}: IHomeBannerProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const lang = isRTL ? "ar" : "en";
  const fallback = staticBannerContent[lang];
  const resolvedTitle = title || fallback.title;
  const resolvedSubtitle = subtitle || fallback.subtitle;
  const resolvedBtnText = btnText || fallback.btnText;
  const resolvedBtnLink = btnLink || fallback.btnLink;
  const resolvedImageUrl = imageUrl || fallback.imageUrl;

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="px-4 pt-3 sm:px-6 lg:px-8">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 overflow-hidden rounded-[2rem] bg-shop_dark_primary px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-12 lg:px-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 16% 24%, rgba(201, 169, 110, 0.24), transparent 24%), radial-gradient(circle at 82% 34%, rgba(145, 101, 66, 0.2), transparent 28%), radial-gradient(circle at 50% 88%, rgba(201, 169, 110, 0.14), transparent 26%)",
          }}
        />
        <div
          className="pointer-events-none absolute -top-14 start-[12%] h-56 w-56 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(201, 169, 110, 0.22)" }}
        />
        <div
          className="pointer-events-none absolute top-1/4 end-[10%] h-72 w-72 rounded-full blur-[130px]"
          style={{ backgroundColor: "rgba(120, 82, 54, 0.22)" }}
        />
        <div className="pointer-events-none absolute inset-0 border border-[#4b3425]/50" />

        <div className="relative z-10 w-full text-center md:my-5 md:w-[62%] md:text-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-shop_secondary">
            {fallback.eyebrow}
          </p>
          <Title className="mb-4 text-3xl font-bold leading-tight text-shop_white md:text-4xl">
            {resolvedTitle}
          </Title>
          <p className="mb-6 max-w-xl text-[15px] leading-7 text-[#ecdac3]">
            {resolvedSubtitle}
          </p>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            {fallback.trustPoints.map((point) => (
              <span
                key={point}
                className="rounded-full border border-[#6a4a34] bg-[#2a1d14] px-3 py-1 text-xs font-medium text-[#e7cfaf]"
              >
                {point}
              </span>
            ))}
          </div>

          <Link
            href={`/${locale}/${resolvedBtnLink}`}
            className="inline-block rounded-full border border-[#d2b183] bg-[#c9a96e] px-6 py-2.5 text-sm font-semibold text-[#26180f] shadow-sm outline-none transition hover:bg-[#d9bb87] focus-visible:ring-2 focus-visible:ring-shop_secondary focus-visible:ring-offset-2 focus-visible:ring-offset-shop_dark_primary sm:px-7 sm:text-base"
          >
            {resolvedBtnText}
          </Link>

          <div className="mt-7 grid grid-cols-3 gap-2 border-t border-[#4b3425] pt-5 md:max-w-md">
            {fallback.stats.map((item) => (
              <div key={item.label} className="text-center md:text-start">
                <p className="text-lg font-semibold text-[#f6e8d4]">{item.value}</p>
                <p className="text-xs text-[#b9966f]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-[82%] shrink-0 justify-center md:mx-0 md:w-[35%]">
          <div className="absolute inset-0 rounded-[2rem] bg-[#2a1d14]/70 blur-xl" />
          <Image
            src={resolvedImageUrl}
            width={420}
            height={420}
            alt={resolvedTitle}
            placeholder="empty"
            loading="eager"
            unoptimized
            className="relative max-h-[420px] w-full object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.35)]"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeBanner;