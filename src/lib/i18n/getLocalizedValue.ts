export type LocalizedValue =
  | string
  | Record<string, unknown>
  | null
  | undefined;

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
        return (
          String(
            parsed[lang] ??
            parsed[fallbackLang] ??
            Object.values(parsed)[0]
          ) || ""
        );
      }

      return String(parsed);
    } catch {
      return value;
    }
  }

  // If value is already object
  if (typeof value === "object") {
    return (
      String(
        value[lang] ??
        value[fallbackLang] ??
        Object.values(value)[0]
      ) || ""
    );
  }

  return "";
}
