import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Public Laravel origin (no trailing slash).
 * Local: http://laravel-next-ecomm.test
 * Prod (Vercel): set LARAVEL_API_ORIGIN in project env.
 */
const LARAVEL_API_ORIGIN = (
  process.env.LARAVEL_API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_ORIGIN ??
  "https://e-commerce-b4wa.onrender.com"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/en/manifest.json", destination: "/manifest.json" },
      { source: "/ar/manifest.json", destination: "/manifest.json" },
      // Browser → same-origin /api/v1/* → Laravel (avoids CORS).
      {
        source: "/api/v1/:path*",
        destination: `${LARAVEL_API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "laravel-next-ecomm" },
      { protocol: "http", hostname: "laravel-next-ecomm.test" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "e-commerce-b4wa.onrender.com" },

      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placeholder.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);
