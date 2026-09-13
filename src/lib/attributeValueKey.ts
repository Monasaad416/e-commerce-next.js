import type { AttributeValue } from "@/interfaces/productType";

/** Normalize API values (object, JSON string, or plain string) before building keys. */
export function normalizeAttributeValue(
  value: AttributeValue["value"] | unknown
): AttributeValue["value"] | string {
  if (value == null) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as AttributeValue["value"];
      }
    } catch {
      /* plain string, e.g. hex color */
    }
    return trimmed;
  }

  return value as AttributeValue["value"];
}

/** Stable key for matching attribute values across variants (locale-agnostic). */
export function stableAttributeValueKey(
  value: AttributeValue["value"] | unknown
): string {
  const normalized = normalizeAttributeValue(value);

  if (!normalized || typeof normalized !== "object") {
    return String(normalized ?? "").trim().toLowerCase();
  }

  const entries = Object.entries(normalized).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  return entries.map(([k, v]) => `${k}:${String(v).trim().toLowerCase()}`).join("|");
}
