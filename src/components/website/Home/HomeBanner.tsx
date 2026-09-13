import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import Title from "@/components/website/Title";
import { IHomeBannerProps } from "@/interfaces/HomeBannerType";

const HomeBanner = ({
  title,
  subtitle,
  imageUrl,
  btnText,
  btnLink,
  eyebrow,
  trustPoints,
  stats,
}: IHomeBannerProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const trimmedTitle = title?.trim() ?? "";
  const trimmedSubtitle = subtitle?.trim() ?? "";
  const trimmedEyebrow = eyebrow?.trim() ?? "";
  const trimmedBtnText = btnText?.trim() ?? "";
  const trimmedBtnLink = btnLink?.trim() ?? "";
  const points = trustPoints?.filter((p) => p.trim()) ?? [];
  const statItems =
    stats?.filter((s) => s.value.trim() || s.label.trim()) ?? [];

  const hasPrimaryCopy =
    trimmedTitle ||
    trimmedSubtitle ||
    trimmedEyebrow ||
    points.length > 0 ||
    statItems.length > 0;
  const showCta = Boolean(trimmedBtnText && trimmedBtnLink);
  const showImage = Boolean(imageUrl?.trim());

  if (!hasPrimaryCopy && !showCta && !showImage) {
    return null;
  }

  return (
    <section dir={isRTL ? "rtl" : "ltr"} className="px-4 pt-3 sm:px-6 lg:px-8">
      <div
        className={`relative mx-auto flex max-w-7xl flex-col gap-8 overflow-hidden rounded-[2rem] bg-shop_dark_primary px-5 py-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-12 lg:px-14 ${
          showImage ? "" : "md:justify-center"
        }`}
      >
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

        <div
          className={`relative z-10 w-full text-center md:my-5 md:text-start ${
            showImage ? "md:w-[62%]" : "md:w-full"
          }`}
        >
          {trimmedEyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-shop_secondary">
              {trimmedEyebrow}
            </p>
          ) : null}
          {trimmedTitle ? (
            <Title className="mb-4 text-3xl font-bold leading-tight text-shop_white md:text-4xl">
              {trimmedTitle}
            </Title>
          ) : null}
          {trimmedSubtitle ? (
            <p className="mb-6 max-w-xl text-[15px] leading-7 text-[#ecdac3]">
              {trimmedSubtitle}
            </p>
          ) : null}

          {points.length > 0 ? (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              {points.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-[#6a4a34] bg-[#2a1d14] px-3 py-1 text-xs font-medium text-[#e7cfaf]"
                >
                  {point}
                </span>
              ))}
            </div>
          ) : null}

          {showCta ? (
            <Link
              href={`/${locale}/${trimmedBtnLink}`}
              className="inline-block rounded-full border border-[#d2b183] bg-[#c9a96e] px-6 py-2.5 text-sm font-semibold text-[#26180f] shadow-sm outline-none transition hover:bg-[#d9bb87] focus-visible:ring-2 focus-visible:ring-shop_secondary focus-visible:ring-offset-2 focus-visible:ring-offset-shop_dark_primary sm:px-7 sm:text-base"
            >
              {trimmedBtnText}
            </Link>
          ) : null}

          {statItems.length > 0 ? (
            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-[#4b3425] pt-5 md:max-w-md">
              {statItems.map((item) => (
                <div
                  key={`${item.value}-${item.label}`}
                  className="text-center md:text-start"
                >
                  <p className="text-lg font-semibold text-[#f6e8d4]">
                    {item.value}
                  </p>
                  <p className="text-xs text-[#b9966f]">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {showImage && imageUrl ? (
          <div className="relative z-10 mx-auto flex w-[82%] shrink-0 justify-center md:mx-0 md:w-[35%]">
            <div className="absolute inset-0 rounded-[2rem] bg-[#2a1d14]/70 blur-xl" />
            <Image
              src={imageUrl}
              width={420}
              height={420}
              alt={trimmedTitle || trimmedEyebrow || ""}
              priority

              className="relative max-h-[420px] w-full object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.35)]"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HomeBanner;
