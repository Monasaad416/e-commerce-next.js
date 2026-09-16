/**
 * Map color names (EN + AR + leather tones) and hex/rgb to CSS colors.
 * Used by product card swatches and shop color filters.
 */

type ColorInput = { en?: string; ar?: string } | string | null | undefined;

const COLOR_MAP: Record<string, string> = {
  // Basic
  red: "#b91c1c",
  green: "#166534",
  blue: "#1d4ed8",
  yellow: "#ca8a04",
  black: "#1a120b",
  white: "#f5f0e8",
  gray: "#6b7280",
  grey: "#6b7280",
  orange: "#c2410c",
  purple: "#6b21a8",
  pink: "#db2777",
  brown: "#6b3f2a",

  // Leather tones (EN)
  tan: "#c4a574",
  cognac: "#9a4e2c",
  burgundy: "#6b1e2a",
  navy: "#1e2a44",
  olive: "#556b2f",
  camel: "#c19a6b",
  beige: "#d4c4a8",
  cream: "#f5ecd7",
  espresso: "#3b2416",
  chocolate: "#4a2c1a",
  mahogany: "#4c1f14",
  sienna: "#8b4513",
  chestnut: "#954535",
  whiskey: "#a05a2c",
  honey: "#c9a227",
  sand: "#c2b280",
  natural: "#cbb892",
  dark: "#2a1d14",
  light: "#e8dcc8",

  // Arabic
  أحمر: "#b91c1c",
  احمر: "#b91c1c",
  أخضر: "#166534",
  اخضر: "#166534",
  أزرق: "#1d4ed8",
  ازرق: "#1d4ed8",
  أصفر: "#ca8a04",
  اصفر: "#ca8a04",
  أسود: "#1a120b",
  اسود: "#1a120b",
  أبيض: "#f5f0e8",
  ابيض: "#f5f0e8",
  رمادي: "#6b7280",
  برتقالي: "#c2410c",
  بنفسجي: "#6b21a8",
  وردي: "#db2777",
  بني: "#6b3f2a",
  أسمر: "#6b3f2a",
  اسمر: "#6b3f2a",
  بيج: "#d4c4a8",
  كريمي: "#f5ecd7",
  كحلي: "#1e2a44",
  زيتي: "#556b2f",
  عسلي: "#c9a227",
  طبيعي: "#cbb892",
  كونياك: "#9a4e2c",
  نحاسي: "#9a4e2c",
  خمري: "#6b1e2a",
  قهوة: "#3b2416",
  شوكولاتة: "#4a2c1a",
  كاكي: "#c2b280",
  رملي: "#c2b280",
  فاتح: "#e8dcc8",
  غامق: "#2a1d14",
};

/** Canonical English slug for filter matching across locales. */
const CANONICAL_ALIASES: Record<string, string> = {
  brown: "brown",
  بني: "brown",
  أسمر: "brown",
  اسمر: "brown",
  chocolate: "brown",
  شوكولاتة: "brown",
  espresso: "espresso",
  قهوة: "espresso",
  black: "black",
  أسود: "black",
  اسود: "black",
  tan: "tan",
  camel: "tan",
  عسلي: "honey",
  honey: "honey",
  cognac: "cognac",
  كونياك: "cognac",
  نحاسي: "cognac",
  burgundy: "burgundy",
  خمري: "burgundy",
  navy: "navy",
  كحلي: "navy",
  olive: "olive",
  زيتي: "olive",
  beige: "beige",
  بيج: "beige",
  cream: "cream",
  كريمي: "cream",
  natural: "natural",
  طبيعي: "natural",
  sand: "sand",
  رملي: "sand",
  كاكي: "sand",
  red: "red",
  أحمر: "red",
  احمر: "red",
  green: "green",
  أخضر: "green",
  اخضر: "green",
  blue: "blue",
  أزرق: "blue",
  ازرق: "blue",
  yellow: "yellow",
  أصفر: "yellow",
  اصفر: "yellow",
  white: "white",
  أبيض: "white",
  ابيض: "white",
  gray: "gray",
  grey: "gray",
  رمادي: "gray",
  orange: "orange",
  برتقالي: "orange",
  purple: "purple",
  بنفسجي: "purple",
  pink: "pink",
  وردي: "pink",
};

function getColorFromString(colorStr: string): string {
  if (!colorStr) return "#6b3f2a";

  const normalizedColor = colorStr.trim().toLowerCase();
  if (COLOR_MAP[normalizedColor]) return COLOR_MAP[normalizedColor];

  if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalizedColor)) {
    return normalizedColor.startsWith("#")
      ? normalizedColor
      : `#${normalizedColor}`;
  }
  if (/^(rgb|hsl)a?\(/i.test(normalizedColor)) return normalizedColor;

  // Soft fallback: leather brown instead of generic gray
  return "#6b3f2a";
}

const getBackgroundColor = (color: ColorInput): string => {
  if (!color) return "#6b3f2a";

  if (typeof color === "string") {
    return getColorFromString(color.trim().toLowerCase());
  }

  if (color.en || color.ar) {
    const colorValue = color.en || color.ar;
    if (colorValue) return getColorFromString(colorValue);
  }

  return getColorFromString(String(color).trim().toLowerCase());
};

/** Stable filter key shared by EN/AR labels (e.g. brown ↔ بني). */
export function getCanonicalColorKey(color: ColorInput): string {
  if (!color) return "";

  if (typeof color === "string") {
    const raw = color.trim().toLowerCase();
    if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
      return raw.startsWith("#") ? raw : `#${raw}`;
    }
    return CANONICAL_ALIASES[raw] ?? raw;
  }

  const en = color.en?.trim().toLowerCase() ?? "";
  const ar = color.ar?.trim().toLowerCase() ?? "";
  if (en && CANONICAL_ALIASES[en]) return CANONICAL_ALIASES[en];
  if (ar && CANONICAL_ALIASES[ar]) return CANONICAL_ALIASES[ar];
  if (en) return CANONICAL_ALIASES[en] ?? en;
  if (ar) return CANONICAL_ALIASES[ar] ?? ar;
  return "";
}

export function getColorDisplayLabel(
  color: ColorInput,
  lang: string,
): string {
  if (!color) return "";
  if (typeof color === "string") return color.trim();
  if (lang === "ar") return (color.ar || color.en || "").trim();
  return (color.en || color.ar || "").trim();
}

export default getBackgroundColor;
