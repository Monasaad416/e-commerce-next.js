
export const CURRENCY_CODE = "EGP" as const;

/** Locale used for number grouping / symbol placement. */
export const CURRENCY_LOCALE = "en-US" as const;

export function formatMoney(
  amount: number | string | null | undefined,
  options?: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat(options?.locale ?? CURRENCY_LOCALE, {
    style: "currency",
    currency: options?.currency ?? CURRENCY_CODE,
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(safe);
}
