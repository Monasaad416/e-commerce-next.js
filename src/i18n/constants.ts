/** Used by next-intl server + client so dates/times don’t trigger ENVIRONMENT_FALLBACK. */
export const APP_TIME_ZONE =
  process.env.NEXT_PUBLIC_TIME_ZONE ?? "Asia/Riyadh";
