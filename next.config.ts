import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const LARAVEL_API_ORIGIN =
  process.env.LARAVEL_API_ORIGIN ?? "http://laravel-next-ecomm.test";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/en/manifest.json", destination: "/manifest.json" },
      { source: "/ar/manifest.json", destination: "/manifest.json" },
      // Browser → same-origin proxy; Next.js forwards to Laravel (avoids CORS).
      {
        source: "/api/v1/:path*",
        destination: `${LARAVEL_API_ORIGIN}/api/v1/:path*`,
      },
    ];
  },
  images: {
    // Backend (`laravel-next-ecomm.test`) resolves to 127.0.0.1 via the Windows
    // hosts file, and Next.js 16 blocks the optimizer from fetching upstream
    // images on private IPs ("resolved to private ip"). Until the backend has a
    // publicly reachable URL, bypass the optimizer so <Image> serves the raw
    // upstream image.
    unoptimized: true,
    remotePatterns: [
      // Local Laravel backend (dev)
      { protocol: "http", hostname: "laravel-next-ecomm" },
      { protocol: "http", hostname: "laravel-next-ecomm.test" },
      { protocol: "http", hostname: "localhost" },

      // External image hosts used by Laravel seeders / CMS content
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placeholder.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts"); // ✅ explicit path
export default withNextIntl(nextConfig);