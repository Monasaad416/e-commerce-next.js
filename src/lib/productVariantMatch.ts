import type { IProduct, IProductVariant } from "@/interfaces/productType";
import type { GroupedAttributes } from "@/interfaces/GroupedAttributesType";
import { stableAttributeValueKey } from "@/lib/attributeValueKey";

export function variantAttributeMap(
  variant: IProductVariant
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const av of variant.attribute_values ?? []) {
    map[String(av.attribute_id)] = stableAttributeValueKey(av.value);
  }
  return map;
}

/**
 * Find the variant that matches current attribute selections.
 * When every attribute group has a selection, requires an exact variant match.
 */
export function findMatchingProductVariant(
  variants: IProductVariant[],
  selectedAttributes: Record<number, string>,
  groupedAttributes: GroupedAttributes
): IProductVariant | null {
  const entries = Object.entries(selectedAttributes).filter(([, key]) => Boolean(key));
  if (!entries.length) return null;

  const totalGroups = Object.keys(groupedAttributes).length;
  const requireExact = totalGroups > 0 && entries.length >= totalGroups;

  return (
    variants.find((variant) => {
      const map = variantAttributeMap(variant);
      if (!entries.every(([attrId, key]) => map[attrId] === key)) return false;
      if (requireExact) return Object.keys(map).length === entries.length;
      return true;
    }) ?? null
  );
}

/** Resolve product from GET /products/{slug} payload shapes. */
export function getProductFromApiResponse(
  payload: Record<string, unknown> | null | undefined
): IProduct | undefined {
  if (!payload) return undefined;

  const data = payload.data;
  if (!data || typeof data !== "object") return undefined;

  const record = data as Record<string, unknown>;

  if (record.product && typeof record.product === "object") {
    return record.product as IProduct;
  }

  if ("variants" in record || "type" in record || "slug" in record) {
    return record as unknown as IProduct;
  }

  return undefined;
}

export function variantPrice(variant: IProductVariant | null | undefined): number {
  if (!variant) return 0;
  return Number(variant.selling_price ?? variant.discount_price ?? 0);
}
