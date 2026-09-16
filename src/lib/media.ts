import {
  isPlaceholderImageUrl,
  leatherImageForKey,
  resolveLeatherAwareUrl,
} from "@/lib/leatherMedia";

const DEFAULT_STORAGE_BASE_URL = "http://laravel-next-ecomm.test/storage";
const FALLBACK_IMAGE = "/leather/leather.jpg";

// Hosts that seeders / CMS content may reference directly. Anything matching
// one of these is treated as a full URL even if the scheme was omitted.
const KNOWN_EXTERNAL_HOSTS = [
  "loremflickr.com",
  "picsum.photos",
  "placehold.co",
  "placeholder.com",
  "via.placeholder.com",
  "images.unsplash.com",
  "source.unsplash.com",
];

/**
 * Convert a backend-provided image path into a URL the browser can load.
 *
 * Placeholder seeder hosts (loremflickr, picsum, …) are swapped for local
 * leather product photos so the storefront stays on-brand.
 */
export function resolveImageUrl(
  path?: string | null,
  options?: { key?: string },
): string {
  if (!path) {
    return options?.key ? leatherImageForKey(options.key) : FALLBACK_IMAGE;
  }

  const trimmed = path.trim();
  if (!trimmed || /^(null|undefined)$/i.test(trimmed)) {
    return options?.key ? leatherImageForKey(options.key) : FALLBACK_IMAGE;
  }

  let resolved: string;

  // Already a full URL or data URL.
  if (/^(https?:|data:)/i.test(trimmed)) {
    resolved = trimmed;
  } else if (trimmed.startsWith("//")) {
    // Protocol-relative — default to https so pages served over https don't warn.
    resolved = `https:${trimmed}`;
  } else if (trimmed.startsWith("/leather/") || trimmed.startsWith("/no-image")) {
    resolved = trimmed;
  } else {
    // Bare external host (e.g. seeder stored `loremflickr.com/960/960/...`).
    const firstSegment = trimmed.split("/", 1)[0].toLowerCase();
    if (KNOWN_EXTERNAL_HOSTS.includes(firstSegment)) {
      resolved = `https://${trimmed}`;
    } else {
      // Otherwise treat it as a Laravel storage-relative path.
      const baseUrl = (
        process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
        process.env.NEXT_PUBLIC_IMAGE_URL ||
        DEFAULT_STORAGE_BASE_URL
      ).replace(/\/+$/, "");
      const relative = trimmed.replace(/^\/+/, "");
      resolved = `${baseUrl}/${relative}`;
    }
  }

  if (isPlaceholderImageUrl(resolved)) {
    return resolveLeatherAwareUrl(resolved, {
      key: options?.key ?? trimmed,
    });
  }

  return resolved;
}
