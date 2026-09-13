export type LocalizedValue =
  | string
  | Record<string, unknown>
  | null
  | undefined;

function normalizeLocalizedValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  if (text === "" || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") {
    return "";
  }
  return text;
}

export function getLocalizedValue(
  value: LocalizedValue,
  lang: string,
  fallbackLang = "en"
): string {
  if (!value) return "";

  // If value is string
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (typeof parsed === "object" && parsed !== null) {
        const candidates = [parsed[lang], parsed[fallbackLang], ...Object.values(parsed)];
        for (const candidate of candidates) {
          const normalized = normalizeLocalizedValue(candidate);
          if (normalized) return normalized;
        }
        return "";
      }

      return normalizeLocalizedValue(parsed);
    } catch {
      return normalizeLocalizedValue(value);
    }
  }

  // If value is already object
  if (typeof value === "object") {
    const candidates = [value[lang], value[fallbackLang], ...Object.values(value)];
    for (const candidate of candidates) {
      const normalized = normalizeLocalizedValue(candidate);
      if (normalized) return normalized;
    }
    return "";
  }

  return "";
}
