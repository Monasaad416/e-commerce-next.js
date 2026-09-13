import { IProduct } from "@/interfaces/productType";
import { Card, CardContent } from "@/components/ui/card";
import { UseProductSelection } from "@/hooks/useProductSelection";
import noImage from "@/assets/imgs/no-image.jpg";
import Image from "next/image";
import AddToCartBtn from "../AddToCartBtn";
import { resolveImageUrl } from "@/lib/media";
import { getDistinctVariantColors } from "@/lib/productVariantColors";
import { useLocalizedValue } from "@/hooks/useLocalizedValue";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { IoHeartOutline } from "react-icons/io5";
import { formatMoney } from "@/lib/formatMoney";

/* ---------------- Main Component ---------------- */

const MAX_SWATCHES = 6;

export default function ProductCard({ product }: { product: IProduct }) {
  const { selection } = UseProductSelection(product);
  const tValue = useLocalizedValue();
  const t = useTranslations();
  const locale = useLocale();

  const variantColors = getDistinctVariantColors(product);
  const swatches = variantColors.slice(0, MAX_SWATCHES);
  const extraColors = variantColors.length - swatches.length;

  /* -------- Image logic -------- */

  let featuredImage: string | undefined;
  let price: number | undefined;
  let discountPrice: number | undefined;

  if (product.type === "simple" && product.images?.length > 0) {
    featuredImage = resolveImageUrl(
      product.images?.find((img) => img?.is_featured)?.image_path
    );
    price = product?.selling_price;
    discountPrice = product?.discount_price;
  }

  if (product.type === "variable") {
    featuredImage = resolveImageUrl(product.variants?.[0]?.featured_image);
    price = product.variants?.[0]?.selling_price;
    discountPrice = product.variants?.[0]?.discount_price;
  }

  // Create selection with first variant for cart
  const cardSelection =
    product.type === "variable" && product.variants?.[0]
      ? {
          ...selection,
          product_variant_id: product.variants[0].id,
        }
      : selection;

  /* -------- Render -------- */

  const numericPrice = Number(price ?? 0);
  const numericDiscount =
    discountPrice != null ? Number(discountPrice) : undefined;
  const showStrike =
    numericDiscount != null &&
    !Number.isNaN(numericDiscount) &&
    numericDiscount < numericPrice;

  return (
    <Card className="group w-full border border-[#dcc3a0] bg-[#f7f0e6] shadow-[0_8px_22px_rgba(61,43,31,0.1)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(61,43,31,0.18)]">
      <CardContent className="flex h-full flex-col p-2.5 sm:p-4 lg:p-5">
        <Link
          href={`/${locale}/shop/${product?.slug}`}
          prefetch={false}
          className="block rounded-xl text-foreground no-underline outline-none ring-offset-[#f7f0e6] focus-visible:ring-2 focus-visible:ring-shop_secondary focus-visible:ring-offset-2"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#e4d1b4] bg-[#fffaf2] p-1.5 shadow-sm transition duration-300 group-hover:shadow-md sm:p-3 lg:p-4">
            <Image
              src={featuredImage || noImage}
              alt={tValue(product?.name)}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="rounded-lg object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="eager"
              unoptimized
            />

            {/* Heart chip — now a visible pill on the corner, readable on any image */}
            <span
              className="pointer-events-none absolute end-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#fffaf2]/85 text-[#6b5236] shadow-sm backdrop-blur-[2px] transition group-hover:text-shop_secondary sm:end-3 sm:top-3 sm:h-8 sm:w-8"
              aria-hidden
            >
              <IoHeartOutline className="text-base sm:text-lg" />
            </span>

            {swatches.length > 0 ? (
              <div
                className="pointer-events-none absolute bottom-1.5 start-1.5 flex max-w-[calc(100%-0.75rem)] flex-wrap items-center gap-0.5 rounded-full bg-[#3d2b1f]/50 px-1.5 py-0.5 shadow-sm backdrop-blur-[2px] sm:bottom-2 sm:start-2 sm:gap-1 sm:px-2 sm:py-1"
                aria-label={t("Products.AvailableColors")}
              >
                {swatches.map((hex, i) => (
                  <span
                    key={`${hex}-${i}`}
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/50 ring-1 ring-black/10 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
                {extraColors > 0 ? (
                  <span className="ps-0.5 text-[9px] font-bold leading-none text-[#fffaf2] sm:text-[10px]">
                    +{extraColors}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="mt-2 line-clamp-1 text-[10px] font-semibold uppercase tracking-wide text-[#9a784f] sm:mt-3 sm:text-xs">
            {tValue(product?.category_name)}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-[#3d2b1f] sm:mt-1 sm:text-base lg:text-lg">
            {tValue(product?.name)}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#ddc7aa] pt-2.5 sm:mt-4 sm:pt-3 lg:pt-4">
          <div className="min-w-0 flex-1">
            {showStrike && (
              <p className="text-[11px] text-[#9a8369] line-through sm:text-sm">
                {formatMoney(numericPrice)}
              </p>
            )}
            <p className="truncate text-base font-bold text-[#3d2b1f] sm:text-lg">
              {formatMoney(showStrike ? numericDiscount : numericPrice)}
            </p>
          </div>

          <AddToCartBtn product={product} selection={cardSelection} qty={1} />
        </div>
      </CardContent>
    </Card>
  );
}
