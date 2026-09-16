"use client";

import HomeBanner from "@/components/website/Home/HomeBanner";
import ProductsList from "@/components/website/Products/ProductsList";
import ViewAllBtn from "@/components/website/ViewAllBtn";
import { usePageContent } from "@/hooks/usePageContent";
import type { PageContentData } from "@/lib/PageContent";
import SecHomeBanner from "@/components/website/Home/SecHomeBanner";
import CraftProcess from "@/components/website/Home/CraftProcess";
import { resolveImageUrl } from "@/lib/media";
import { LEATHER_HERO, resolveLeatherAwareUrl } from "@/lib/leatherMedia";
import { getLocalizedString, stripHtml } from "@/lib/localizedField";
import CustomLoader from "@/components/customLoader/CustomLoader";
import type { IProduct } from "@/interfaces/productType";

type LocalizedString = Record<string, string | undefined>;

type HomePageClientProps = {
  lang: "en" | "ar";
  /** When the server loaded CMS data, the client skips the blocking loader on first paint. */
  pageContentOptions?: { initialData: PageContentData | null };
  /** Prefetched on the server so the product grid is not a second full-page wait. */
  initialProducts: IProduct[];
};

export default function HomePageClient({
  lang,
  pageContentOptions,
  initialProducts,
}: HomePageClientProps) {
  const {
    data: content,
    isLoading: isContentLoading,
    isError: isContentError,
    error: contentError,
  } = usePageContent(lang, "home", pageContentOptions);

  function pickLocalized(
    field: LocalizedString | string | undefined,
    locale: string
  ): string {
    return getLocalizedString(field, locale);
  }

  if (isContentLoading) return <CustomLoader />;
  if (isContentError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-5 py-4 text-center text-shop_white shadow-lg">
          <p className="font-semibold text-red-200">Could not load home content</p>
          <p className="mt-2 text-sm text-red-100/90">{contentError?.message}</p>
        </div>
      </div>
    );
  }

  const trustPointsFromCms = (() => {
    const rows = content?.main_banner_trust_points as
      | Array<{ text?: LocalizedString | string }>
      | undefined;
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    const out = rows
      .map((row) => pickLocalized(row?.text as LocalizedString | string | undefined, lang))
      .filter((s) => s.length > 0);
    return out.length > 0 ? out : undefined;
  })();

  const statsFromCms = (() => {
    const rows = content?.main_banner_stats as
      | Array<{ value?: string; label?: LocalizedString | string }>
      | undefined;
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    return rows.map((row) => ({
      value: stripHtml(row?.value ?? ""),
      label: pickLocalized(row?.label as LocalizedString | string | undefined, lang),
    }));
  })();

  return (
    <div className="pb-16">
      <HomeBanner
        eyebrow={pickLocalized(content?.main_banner_eyebrow as LocalizedString | string | undefined, lang)}
        title={pickLocalized(content?.main_banner_title as LocalizedString | string | undefined, lang)}
        subtitle={pickLocalized(content?.main_banner_subtitle as LocalizedString | string | undefined, lang)}
        btnText={pickLocalized(content?.main_banner_button_text as LocalizedString | string | undefined, lang)}
        btnLink={
          typeof content?.main_banner_button_link === "string"
            ? content.main_banner_button_link
            : undefined
        }
        imageUrl={resolveLeatherAwareUrl(
          content?.main_banner_image
            ? resolveImageUrl(String(content.main_banner_image), {
                key: "home-hero",
              })
            : undefined,
          { fallback: LEATHER_HERO, key: "home-hero" },
        )}
        trustPoints={trustPointsFromCms}
        stats={statsFromCms}
      />

      <SecHomeBanner content={content} lang={lang} />

      <CraftProcess />
      <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <ProductsList limit={8} products={initialProducts} />
        <ViewAllBtn />
      </section>
    </div>
  );
}
