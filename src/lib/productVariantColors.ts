import type { IProduct } from "@/interfaces/productType";
import getBackgroundColor, {
  getCanonicalColorKey,
  getColorDisplayLabel,
} from "@/lib/getBackgroundColor";

const COLOR_ATTR_NAMES = new Set(["color", "colour", "اللون"]);

export function isColorAttributeName(attributeName: unknown): boolean {
  if (attributeName == null) return false;
  const names =
    typeof attributeName === "string"
      ? [attributeName]
      : Object.values(attributeName as Record<string, unknown>).map((v) =>
          v != null ? String(v) : "",
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
      const css = getBackgroundColor(
        av.value as Parameters<typeof getBackgroundColor>[0],
      );
      if (seen.has(css)) continue;
      seen.add(css);
      out.push(css);
    }
  }

  return out;
}

export type ProductColorOption = {
  /** Stable key for filtering (EN/AR aliases collapse here). */
  key: string;
  /** Localized label for UI. */
  label: string;
  /** CSS swatch color. */
  css: string;
};

/** Color options for a single product (for filters + matching). */
export function getProductColorOptions(
  product: IProduct,
  lang: string,
): ProductColorOption[] {
  if (product.type !== "variable" || !product.variants?.length) return [];

  const byKey = new Map<string, ProductColorOption>();

  for (const variant of product.variants) {
    for (const av of variant.attribute_values ?? []) {
      if (!isColorAttributeName(av.attribute_name)) continue;
      const value = av.value as Parameters<typeof getBackgroundColor>[0];
      const key = getCanonicalColorKey(value);
      if (!key || byKey.has(key)) continue;
      byKey.set(key, {
        key,
        label: getColorDisplayLabel(value, lang) || key,
        css: getBackgroundColor(value),
      });
    }
  }

  return Array.from(byKey.values());
}

/** @deprecated use getProductColorOptions — kept for callers expecting string labels */
export function getProductColorLabels(product: IProduct, lang: string): string[] {
  return getProductColorOptions(product, lang).map((o) => o.key);
}

export function getDistinctProductColorOptions(
  products: IProduct[],
  lang: string,
): ProductColorOption[] {
  const byKey = new Map<string, ProductColorOption>();
  for (const product of products) {
    for (const option of getProductColorOptions(product, lang)) {
      if (!byKey.has(option.key)) byKey.set(option.key, option);
    }
  }
  return Array.from(byKey.values());
}

export function getDistinctProductColorLabels(
  products: IProduct[],
  lang: string,
): string[] {
  return getDistinctProductColorOptions(products, lang).map((o) => o.key);
}

export function productMatchesColorFilter(
  product: IProduct,
  colorKey: string,
  lang: string,
): boolean {
  const target = colorKey.trim().toLowerCase();
  if (!target) return true;
  return getProductColorOptions(product, lang).some(
    (o) => o.key === target || o.label.toLowerCase() === target,
  );
}
