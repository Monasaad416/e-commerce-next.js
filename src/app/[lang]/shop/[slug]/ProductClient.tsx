"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Truck, ShieldCheck, RotateCcw, Sparkles } from "lucide-react";

import AddToCartBtn from "@/components/website/AddToCartBtn";
import QtyBtns from "@/components/website/CartSteps/QtyBtns";
import ProductImagePreview from "@/components/website/Products/ProductImagePreview";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { resolveImageUrl } from "@/lib/media";
import { formatMoney } from "@/lib/formatMoney";

import { useLocalizedValue } from "@/hooks/useLocalizedValue";
import { useProduct } from "@/hooks/useProduct";
import { useProductAttributes } from "@/hooks/useProductAttribute";
import { GroupedAttributeOption } from "@/interfaces/GroupedAttributesType";
import AttributeBtn from "@/components/website/AttributeBtn";
import getBackgroundColor from "@/lib/getBackgroundColor";
import AddToWishlistBtn from "@/components/website/AddToWishlistBtn";
import CustomLoader from "@/components/customLoader/CustomLoader";
import type { LocalizedValue } from "@/lib/i18n/getLocalizedValue";
import type { IProduct, IProductVariant } from "@/interfaces/productType";
import type { IProductImage } from "@/interfaces/ProductImageType";
import type { GetProductResult } from "@/lib/getProduct";
import {
  findMatchingProductVariant,
  getProductFromApiResponse,
  variantPrice,
} from "@/lib/productVariantMatch";

export default function ProductClient({
  productSlug,
  initialProduct,
}: {
  productSlug: string;
  /** Server-fetched payload (same request as metadata when possible). */
  initialProduct?: GetProductResult | null;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const tValue = useLocalizedValue();

  const { data: productData, isLoading, error } = useProduct(locale, productSlug, {
    initialProduct,
  });
  const product = getProductFromApiResponse(
    productData as Record<string, unknown> | null | undefined
  );

  const { groupedAttributes, selectedAttributes, selectAttribute, isValueAvailable } =
    useProductAttributes(product);

  const [quantity, setQuantity] = useState(1);

  // ---------------- Quantity handler ----------------
  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  }, []);

  // ---------------- Helpers ----------------
  const isColorAttribute = (name: string) =>
    ["color", "colour", "اللون"].includes(name.toLowerCase());

  const matchedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return findMatchingProductVariant(
      product.variants,
      selectedAttributes,
      groupedAttributes
    );
  }, [product, selectedAttributes, groupedAttributes]);

  // ---------------- Images ----------------
  const imageKey = product?.slug || String(product?.id ?? "");
  const allImages = useMemo(() => {
    if (!product) return [];
    if (product.type === "simple") {
      const imgs =
        product.images?.map((img: IProductImage) =>
          resolveImageUrl(img.image_path ?? img.url ?? "", { key: imageKey }),
        ) || [];
      return imgs.length ? imgs : [resolveImageUrl(null, { key: imageKey })];
    }
    if (product.type === "variable") {
      const v = matchedVariant ?? product.variants[0];
      const featured = v?.featured_image
        ? [resolveImageUrl(v.featured_image, { key: imageKey })]
        : [];
      const others =
        v?.images?.map((img: IProductImage) =>
          resolveImageUrl(img.url ?? img.image_path ?? "", { key: imageKey }),
        ) || [];
      const merged = Array.from(new Set([...featured, ...others]));
      return merged.length
        ? merged
        : [resolveImageUrl(null, { key: imageKey })];
    }
    return [resolveImageUrl(null, { key: imageKey })];
  }, [product, matchedVariant, imageKey]);

  const allAttributesSelected = useMemo(() => {
    if (!groupedAttributes) return false;
    return Object.keys(groupedAttributes).every(attrIdStr => {
      const attrId = Number(attrIdStr);
      return !!selectedAttributes[attrId];
    });
  }, [groupedAttributes, selectedAttributes]);

  // console.log('allAttributesSelected', allAttributesSelected);
  // console.log('matchedVariant', JSON.stringify(matchedVariant));

  const formattedSelection = useMemo(() => {
    if (!groupedAttributes) return {};

    const result: Record<string, string> = {};

    Object.entries(selectedAttributes).forEach(([attrIdStr, valueId]) => {
      const attrId = Number(attrIdStr);
      const attribute = groupedAttributes[attrId];
      if (!attribute) return;

      const selectedValue = attribute.values.find((v) => v.key === valueId);
      if (!selectedValue) return;

      const attrName =
        typeof attribute.attribute_name === "object"
          ? tValue(attribute.attribute_name)
          : attribute.attribute_name || "";

      const value =
        typeof selectedValue.value === "object"
          ? tValue(selectedValue.value)
          : String(selectedValue.value);

      if (attrName) {
        result[attrName.toLowerCase()] = value;
      }
    });

    if (matchedVariant) {
      const imagePath =
        matchedVariant.featured_image ??
        matchedVariant.images?.[0]?.url ??
        null;
      if (imagePath)
        result.image = resolveImageUrl(imagePath, {
          key: product?.slug || String(product?.id ?? ""),
        });
    }

    return result;
  }, [selectedAttributes, groupedAttributes, matchedVariant, tValue]);

  const sortedAttributes = useMemo(() => {
    const entries = Object.entries(groupedAttributes ?? {});
    return entries.sort(([, a], [, b]) => {
      const aIsColor = isColorAttribute(tValue(a.attribute_name));
      const bIsColor = isColorAttribute(tValue(b.attribute_name));
      if (aIsColor && !bIsColor) return -1;
      if (!aIsColor && bIsColor) return 1;
      return a.attribute_id - b.attribute_id;
    });
  }, [groupedAttributes, tValue]);

  // ---------------- Price ----------------
  const price = useMemo(() => {
    if (!product) return 0;

    if (product.type === "simple") return product.selling_price ?? 0;

    // For variable product, use the price of the matched variant
    if (product.type === "variable") {
      if (matchedVariant) return variantPrice(matchedVariant);
      return variantPrice(product.variants[0]);
    }

    return 0;
  }, [product, matchedVariant]);

  const primaryImage = useMemo(() => {
    if (!product) return "";

    if (product.type === "simple") {
      const img = product.images?.[0];
      return img ? resolveImageUrl(img.url || img.image_path) : "";
    }

    if (product.type === "variable") {
      if (matchedVariant) {
        const imgPath =
          matchedVariant.featured_image ??
          matchedVariant.images?.[0]?.url ??
          matchedVariant.images?.[0]?.image_path ??
          null;
        return imgPath ? resolveImageUrl(imgPath) : "";
      }

      const v = product.variants[0];
      if (!v) return "";
      const imgPath =
        v.featured_image ?? v.images?.[0]?.url ?? v.images?.[0]?.image_path ?? null;
      return imgPath ? resolveImageUrl(imgPath) : "";
    }

    return "";
  }, [product, matchedVariant]);

  const formattedPrice = useMemo(() => formatMoney(price), [price]);

  const stockQty = useMemo(() => {
    if (!product) return 0;
    if (product.type === "variable") {
      if (matchedVariant != null) return Number(matchedVariant.qty ?? 0);
      return -1;
    }
    return Number(product.qty ?? 0);
  }, [product, matchedVariant]);

  const descriptionRaw = product ? tValue(product.description as LocalizedValue) : "";

  // ---------------- Render ----------------
  if (isLoading) return <CustomLoader />;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:py-24">
        <div className="rounded-2xl border border-red-500/35 bg-red-950/30 px-6 py-8 text-center shadow-lg">
          <h1 className="text-xl font-semibold text-red-100">{t("Products.ProductNotFound")}</h1>
          <p className="mt-3 text-sm text-red-100/85">
            {error?.message || t("Products.TheRequestedProductCouldNotBeFound")}
          </p>
          <Button
            className="mt-8 rounded-xl bg-shop_secondary px-6 text-shop_dark hover:bg-shop_secondary/90"
            onClick={() => router.push(`/${locale}/shop`)}
          >
            {t("Products.BackToShop")}
          </Button>
        </div>
      </div>
    );
  }

  const stockUnknown = product.type === "variable" && matchedVariant == null;
  const inStock = !stockUnknown && stockQty > 0;

  const stockBadgeClass = stockUnknown
    ? "border-amber-500/40 bg-amber-950/35 text-amber-100"
    : inStock
      ? "border-emerald-500/35 bg-emerald-950/40 text-emerald-100"
      : "border-red-500/35 bg-red-950/40 text-red-100";

  const stockBadgeLabel = stockUnknown
    ? t("Products.SelectOptions")
    : inStock
      ? t("Products.InStock")
      : t("Products.OutStock");

  const trustItems = [
    { icon: Truck, label: t("Products.TrustFreeDelivery") },
    { icon: RotateCcw, label: t("Products.TrustEasyReturns") },
    { icon: ShieldCheck, label: t("Products.TrustSecurePayment") },
    { icon: Sparkles, label: t("Products.TrustTopRated") },
  ] as const;

  return (
    <div className="border-b border-shop_light_gray/10 bg-gradient-to-b from-shop_dark_primary via-shop_dark_primary to-shop_dark_primary/95">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-10">
        <Breadcrumb className="mb-8">
          <BreadcrumbList className="text-shop_light_gray sm:flex-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/${locale}`}
                  className="text-sm hover:text-shop_white transition-colors"
                >
                  {t("Home.title")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className={locale === "ar" ? "rotate-180" : ""} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/${locale}/shop`}
                  className="text-sm hover:text-shop_white transition-colors"
                >
                  {t("Shop.title")}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className={locale === "ar" ? "rotate-180" : ""} />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(42ch,65vw)] truncate text-sm font-medium text-shop_white">
                {tValue(product.name)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <ProductImagePreview
            images={allImages || []}
            imageAlt={tValue(product.name)}
          />

          <div className="flex flex-col gap-8">
            {product.category_slug ? (
              <Link
                href={`/${locale}/shop?category=${encodeURIComponent(product.category_slug)}`}
                className="inline-flex w-fit rounded-full border border-shop_light_gray/25 bg-shop_dark_primary/60 px-3.5 py-1 text-xs font-medium tracking-wide text-shop_light_gray transition-colors hover:border-shop_secondary/45 hover:text-shop_white"
              >
                {tValue(product.category_name)}
              </Link>
            ) : null}

            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-shop_white sm:text-4xl lg:text-[2.5rem]">
                {tValue(product.name)}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-3xl font-semibold text-shop_secondary sm:text-4xl">
                  {formattedPrice}
                </p>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${stockBadgeClass}`}
                >
                  {stockBadgeLabel}
                </span>
              </div>
            </div>

            {descriptionRaw.trim() ? (
              <section className="rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/40 p-5 sm:p-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-shop_light_gray/80">
                  {t("Products.Description")}
                </h2>
                {descriptionRaw.trim().startsWith("<") ? (
                  <div
                    className="mt-3 text-sm leading-relaxed text-shop_light_gray/95 [&_a]:text-shop_secondary [&_a]:underline-offset-2 hover:[&_a]:underline [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: descriptionRaw }}
                  />
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-shop_light_gray/95">
                    {descriptionRaw}
                  </p>
                )}
              </section>
            ) : null}

            <div className="h-px bg-shop_light_gray/15" />

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-shop_light_gray/80">
                {t("Products.Quantity")}
              </p>
              <QtyBtns
                item={product}
                selection={formattedSelection}
                onQuantityChange={handleQuantityChange}
              />
            </div>

            {sortedAttributes.length > 0 ? (
              <div className="space-y-5 rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/35 p-5 sm:p-6">
                {sortedAttributes.map(([, attr]) => (
                  <div key={`attr-${attr.attribute_id}`}>
                    <span className="text-sm font-medium text-shop_white">
                      {tValue(attr.attribute_name)}
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attr.values.map((v: GroupedAttributeOption) => (
                        <AttributeBtn
                          key={`attr-${attr.attribute_id}-${v.key}`}
                          active={selectedAttributes[attr.attribute_id] === v.key}
                          available={isValueAvailable(attr.attribute_id, v.key)}
                          onClick={() => selectAttribute(attr.attribute_id, v.key)}
                        >
                          {isColorAttribute(tValue(attr.attribute_name)) ? (
                            <span
                              className="h-5 w-5 rounded-full ring-2 ring-shop_light_gray/20"
                              style={{ backgroundColor: getBackgroundColor(v.value) }}
                            />
                          ) : (
                            <span className="px-2 text-sm text-shop_white">{tValue(v.value)}</span>
                          )}
                        </AttributeBtn>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {product.type === "variable" && !allAttributesSelected ? (
              <p className="text-sm text-amber-100/90">{t("Products.SelectAllOptions")}</p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <AddToCartBtn
                product={product}
                selection={formattedSelection}
                qty={quantity}
                disabled={!allAttributesSelected}
                priceOverride={price}
                imageOverride={primaryImage}
              />
              <AddToWishlistBtn product={product} selection={formattedSelection} qty={quantity} />
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {trustItems.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-start gap-3 rounded-xl border border-shop_light_gray/12 bg-shop_dark_primary/30 px-4 py-3 text-sm text-shop_light_gray"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-shop_secondary" aria-hidden />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}