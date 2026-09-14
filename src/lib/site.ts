export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://orchid-gilt-nu.vercel.app"
  ).replace(/\/$/, "");
}

export const SITE_NAME = "ORCHID";
