import { IProduct } from "@/interfaces/productType";
import { Card, CardContent } from "@/components/ui/card";
import { UseProductSelection } from "@/hooks/useProductSelection";
import noImage from "@/assets/imgs/no-image.jpg";
import Image from "next/image";
import AddToCartBtn from "../AddToCartBtn";
import { resolveImageUrl } from "@/lib/media";
import { useLocalizedValue } from "@/hooks/useLocalizedValue";
import Link from "next/link";
import { useLocale } from "next-intl";
import { IoHeartOutline } from "react-icons/io5";


/* ---------------- Main Component ---------------- */

export default function ProductCard({ product }: { product: IProduct }) {
  const { selection } = UseProductSelection(product);
  const tValue = useLocalizedValue();
  const locale = useLocale();

  // const handleAttributeChange = (attrKey: string, attrValue: string) => {
  //   setAttribute(attrKey, attrValue);
  // };


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
    const firstVariant = product.variants?.[0];
    featuredImage = resolveImageUrl(product.variants?.[0]?.featured_image);
    price = product.variants?.[0]?.selling_price;
    discountPrice = product.variants?.[0]?.discount_price;
  }

    // Create selection with first variant for cart
  const cardSelection = product.type === "variable" && product.variants?.[0] 
    ? {
        ...selection,
        product_variant_id: product.variants[0].id
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
    <Card className="group w-full max-w-sm border border-[#dcc3a0] bg-[#f7f0e6] shadow-[0_10px_28px_rgba(61,43,31,0.12)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(61,43,31,0.18)]">
      <CardContent className="flex h-full flex-col p-4 sm:p-5">
        <Link
          href={`/${locale}/shop/${product?.slug}`}
          prefetch={false}
          className="mb-4 block rounded-xl text-foreground no-underline outline-none ring-offset-[#f7f0e6] focus-visible:ring-2 focus-visible:ring-shop_secondary focus-visible:ring-offset-2"
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#e4d1b4] bg-[#fffaf2] p-3 shadow-sm transition duration-300 group-hover:shadow-md sm:p-4">
            <Image
              src={featuredImage || noImage}
              alt={tValue(product?.name)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="eager"
              unoptimized
            />
            <span
              className="pointer-events-none absolute end-3 top-3 text-[#9b8164] transition group-hover:text-shop_secondary sm:end-4 sm:top-4"
              aria-hidden
            >
              <IoHeartOutline className="text-2xl" />
            </span>
          </div>

          <p className="mt-3 line-clamp-1 text-xs font-semibold uppercase tracking-wide text-[#9a784f]">
            {tValue(product?.category_name)}
          </p>
          <h3 className="mt-1 line-clamp-2 min-h-[3.5rem] text-base font-semibold leading-snug text-[#3d2b1f] sm:text-lg">
            {tValue(product?.name)}
          </h3>
        </Link>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-[#ddc7aa] pt-4">
          <div className="min-w-0">
            {showStrike && (
              <p className="text-sm text-[#9a8369] line-through">
                ${numericPrice.toFixed(2)}
              </p>
            )}
            <p className="text-lg font-bold text-[#3d2b1f]">
              $
              {(showStrike ? numericDiscount : numericPrice).toFixed(2)}
            </p>
          </div>

          <AddToCartBtn
            product={product}
            selection={cardSelection}
            qty={1}
          />
        </div>
      </CardContent>
    </Card>
  );
}
