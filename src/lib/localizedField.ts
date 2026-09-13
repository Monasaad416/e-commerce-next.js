/** CMS fields from Filament: either `{ en, ar }` or a single string (some APIs resolve by request locale). */
export function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, "")
}

export function getLocalizedString(value: unknown, lang: string): string {
  if (value == null) return ""
  if (typeof value === "string") return stripHtml(value)
  if (typeof value === "object" && !Array.isArray(value)) {
    const v = (value as Record<string, unknown>)[lang]
    return typeof v === "string" ? stripHtml(v) : ""
  }
  return ""
}
