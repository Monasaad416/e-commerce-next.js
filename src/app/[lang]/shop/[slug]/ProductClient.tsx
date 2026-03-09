"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import AddToCartBtn from "@/components/website/AddToCartBtn";
import QtyBtns from "@/components/website/CartSteps/QtyBtns";
import ProductImagePreview from "@/components/website/Products/ProductImagePreview";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/lib/media";

import { useLocalizedValue } from "@/hooks/useLocalizedValue";
import { useProduct } from "@/hooks/useProduct";
import { useProductAttributes } from "@/hooks/useProductAttribute";
import { GroupedAttributeOption } from "@/interfaces/GroupedAttributesType";
import AttributeBtn from "@/components/website/AttributeBtn";
import getBackgroundColor from "@/lib/getBackgroundColor";
import AddToWishlistBtn from "@/components/website/AddToWishlistBtn";

export default function ProductClient({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const tValue = useLocalizedValue();

  const { data: productData, isLoading, error } = useProduct(locale, productSlug);
  const product = productData?.data;

  const { groupedAttributes, selectedAttributes, selectAttribute, isValueAvailable } =
    useProductAttributes(product || { variants: [] });

  const [quantity, setQuantity] = useState(1);

  // ---------------- Quantity handler ----------------
  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  }, []);

  // ---------------- Helpers ----------------
  const isColorAttribute = (name: string) =>
    ["color", "colour", "اللون"].includes(name.toLowerCase());

  const stableValueKey = (value: any) => {
    if (!value || typeof value !== "object") return String(value ?? "");
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([k, v]) => `${k}:${String(v)}`).join("|");
  };

  const matchedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;

    return product.variants.find((variant: any) => {
      if (!variant.attribute_values || !Array.isArray(variant.attribute_values)) return false;

      const variantAttributes = variant.attribute_values.reduce(
        (acc: Record<string, string>, attr: any) => {
          acc[attr.attribute_id] = stableValueKey(attr.value);
          return acc;
        },
        {}
      );

      //  only match if all selected attributes are present
      return Object.entries(selectedAttributes).every(
        ([attrId, valueId]) => variantAttributes[attrId] === valueId
      );
    }) || null;
  }, [product, selectedAttributes]);

  // ---------------- Images ----------------
  const allImages = useMemo(() => {
    if (!product) return [];
    if (product.type === "simple") {
      return product.images?.map((img: any) => resolveImageUrl(img.image_path)) || [];
    }
    if (product.type === "variable") {
      const v = matchedVariant ?? product.variants[0];
      const featured = v?.featured_image ? [resolveImageUrl(v.featured_image)] : [];
      const others = v?.images?.map((img: any) => resolveImageUrl(img.url)) || [];
      return Array.from(new Set([...featured, ...others]));
    }
    return [];
  }, [product, matchedVariant]);

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

    const result: Record<string, any> = {};

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
      if (imagePath) result.image = resolveImageUrl(imagePath);
    }

    return result;
  }, [selectedAttributes, groupedAttributes, matchedVariant, locale]);

  const sortedAttributes = useMemo(() => {
    const entries = Object.entries(groupedAttributes ?? {});
    return entries.sort(([, a], [, b]) => {
      const aIsColor = isColorAttribute(tValue(a.attribute_name));
      const bIsColor = isColorAttribute(tValue(b.attribute_name));
      if (aIsColor && !bIsColor) return -1;
      if (!aIsColor && bIsColor) return 1;
      return a.attribute_id - b.attribute_id;
    });
  }, [groupedAttributes, locale]);

  // ---------------- Price ----------------
  const price = useMemo(() => {
    if (!product) return 0;

    if (product.type === "simple") return product.selling_price ?? 0;

    // For variable product, use the price of the matched variant
    if (product.type === "variable") {
      if (matchedVariant) return matchedVariant.selling_price ?? 0;

      // fallback if no variant matches
      return product.variants[0]?.selling_price ?? 0;
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

  // ---------------- Render ----------------
  if (isLoading) return <div>Loading...</div>;

  if (error || !product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">{t("Products.ProductNotFound")}</h2>
        <p className="text-gray-600 mt-2">
          {error?.message || t("Products.TheRequestedProductCouldNotBeFound")}
        </p>
        <Button
          className="bg-shop_dark_primary hover:bg-shop_dark_primary/90 my-8"
          onClick={() => router.push(`/${locale}/shop`)}
        >
          &larr; {t("Products.BackToShop")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 mt-12 mb-24 grid grid-cols-1 lg:grid-cols-2 gap-14">

      {/* IMAGE SECTION */}
      <ProductImagePreview images={allImages || []} />

      {/* DETAILS SECTION */}
      <div className="flex flex-col gap-6">
        {/* Title */}
        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
          {tValue(product.name)}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-shop_dark">${price}</span>
          <span className="text-sm text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">
            {tValue('Products.InStock')}
          </span>
        </div>

        <div className="h-px bg-gray-200 my-2" />

        {/* Quantity */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{tValue('Products.Quantity')}</p>
          <QtyBtns
            item={product}
            selection={formattedSelection}
            onQuantityChange={handleQuantityChange}
          />
        </div>

        {/* Attributes */}
        <div className="space-y-4 flex-1">
          {sortedAttributes.map(([attrId, attr]) => (
            <div key={`attr-${attr.attribute_id}`}>
              <span className="text-sm font-medium text-gray-700">
                {tValue(attr.attribute_name)}
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {attr.values.map((v: GroupedAttributeOption) => (
                  <AttributeBtn
                    key={`attr-${attr.attribute_id}-${v.key}`}
                    active={selectedAttributes[attr.attribute_id] === v.key}
                    available={isValueAvailable(attr.attribute_id, v.key)}
                    onClick={() => selectAttribute(attr.attribute_id, v.key)}
                  >
                    {isColorAttribute(tValue(attr.attribute_name)) ? (
                      <span
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: getBackgroundColor(v.value) }}
                      />
                    ) : (
                      <span className="px-2 text-sm">{tValue(v.value)}</span>
                    )}
                  </AttributeBtn>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <AddToCartBtn
            product={product}
            selection={formattedSelection}
            qty={quantity}
            disabled={!allAttributesSelected}
            priceOverride={price}
            imageOverride={primaryImage}
          />
          <AddToWishlistBtn product={product} selection={formattedSelection} qty={quantity}/>
        </div>

        {/* Extra Info */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">🚚 <span>Free delivery</span></div>
          <div className="flex items-center gap-2">🔄 <span>30 days return</span></div>
          <div className="flex items-center gap-2">🔒 <span>Secure payment</span></div>
          <div className="flex items-center gap-2">⭐ <span>Top rated</span></div>
        </div>
      </div>
    </div>
  );
}