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
  const { selection ,setAttribute,matchedVariant} = UseProductSelection(product);
  const tValue = useLocalizedValue();
  const locale = useLocale();

  const handleAttributeChange = (attrKey: string, attrValue: string) => {
    setAttribute(attrKey, attrValue);
  };


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

  return (
    <Card className="w-full max-w-sm bg-shop_light_primary hover:shadow-xl transition-shadow">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Image + Name */}
        <Link
          href={`/${locale}/shop/${product?.slug}`}
       
          prefetch={false}
          className="block mb-4 text-foreground no-underline"
        >
          <div className="relative w-full aspect-square overflow-hidden rounded-md bg-shop_light">
            <Image
              src={featuredImage || noImage}
              alt={tValue(product?.name)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              loading="eager"
              unoptimized
            />
            <IoHeartOutline className="absolute top-4 right-4 text-shop_light_gray text-2xl cursor-pointer" />
          </div>

          <h3 className="mt-4 text-lg font-semibold hover:text-shop_dark transition-colors line-clamp-2">
            {tValue(product?.name)}
          </h3>
        </Link>


        {/* Price + CTA */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <p className="text-lg font-bold text-shop_dark">
            ${Number(price ?? 0).toFixed(2)}
          </p>

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
