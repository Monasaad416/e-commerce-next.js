import type { IProduct } from "@/interfaces/productType";
import getBackgroundColor from "@/lib/getBackgroundColor";
import { getLocalizedValue } from "@/lib/i18n/getLocalizedValue";

const COLOR_ATTR_NAMES = new Set(["color", "colour", "اللون"]);

export function isColorAttributeName(attributeName: unknown): boolean {
  if (attributeName == null) return false;
  const names =
    typeof attributeName === "string"
      ? [attributeName]
      : Object.values(attributeName as Record<string, unknown>).map((v) =>
          v != null ? String(v) : ""
        );
  return names.some((n) => COLOR_ATTR_NAMES.has(n.toLowerCase()));
}

/** Distinct CSS colors (hex/rgb) for color-type attributes across all variants. */
export function getDistinctVariantColors(product: IProduct): string[] {
  if (product.type !== "variable" || !product.variants?.length) return [];

  const seen = new Set<string>();
  const out: string[] = [];

  for (const variant of product.variants) {
    for (const av of variant.attribute_values ?? []) {
      if (!isColorAttributeName(av.attribute_name)) continue;
      const css = getBackgroundColor(av.value as Parameters<typeof getBackgroundColor>[0]);
      if (seen.has(css)) continue;
      seen.add(css);
      out.push(css);
    }
  }

  return out;
}

/** Normalized color labels for shop filters (localized text / hex). */
export function getProductColorLabels(product: IProduct, lang: string): string[] {
  if (product.type !== "variable" || !product.variants?.length) return [];

  const labels: string[] = [];
  for (const variant of product.variants) {
    for (const av of variant.attribute_values ?? []) {
      if (!isColorAttributeName(av.attribute_name)) continue;
      const label = getLocalizedValue(av.value, lang).trim().toLowerCase();
      if (label) labels.push(label);
    }
  }
  return labels;
}

export function getDistinctProductColorLabels(
  products: IProduct[],
  lang: string
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const product of products) {
    for (const label of getProductColorLabels(product, lang)) {
      if (seen.has(label)) continue;
      seen.add(label);
      out.push(label);
    }
  }
  return out;
}

export function productMatchesColorFilter(
  product: IProduct,
  colorLabel: string,
  lang: string
): boolean {
  const target = colorLabel.trim().toLowerCase();
  if (!target) return true;
  return getProductColorLabels(product, lang).includes(target);
}
