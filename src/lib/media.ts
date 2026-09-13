const DEFAULT_STORAGE_BASE_URL = "http://laravel-next-ecomm.test/storage";
const FALLBACK_IMAGE = "/no-image.png";

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
 * Accepts:
 *   - full URLs (`http://…`, `https://…`)
 *   - protocol-relative URLs (`//host/path`)
 *   - known external hosts without scheme (`loremflickr.com/…`)
 *   - data URLs (`data:image/…`)
 *   - backend-relative paths (`variants/abc.jpg` → prefixed with the storage base)
 *
 * Returns the `/no-image.png` fallback for null / empty / whitespace input.
 */
export function resolveImageUrl(path?: string | null): string {
    if (!path) return FALLBACK_IMAGE;

    const trimmed = path.trim();
    if (!trimmed || /^(null|undefined)$/i.test(trimmed)) return FALLBACK_IMAGE;

    // Already a full URL or data URL.
    if (/^(https?:|data:)/i.test(trimmed)) {
        return trimmed;
    }

    // Protocol-relative — default to https so pages served over https don't warn.
    if (trimmed.startsWith("//")) return `https:${trimmed}`;

    // Bare external host (e.g. seeder stored `loremflickr.com/960/960/...`).
    const firstSegment = trimmed.split("/", 1)[0].toLowerCase();
    if (KNOWN_EXTERNAL_HOSTS.includes(firstSegment)) {
        return `https://${trimmed}`;
    }

    // Otherwise treat it as a Laravel storage-relative path.
    const baseUrl = (
        process.env.NEXT_PUBLIC_STORAGE_BASE_URL ||
        process.env.NEXT_PUBLIC_IMAGE_URL ||
        DEFAULT_STORAGE_BASE_URL
    ).replace(/\/+$/, "");
    const relative = trimmed.replace(/^\/+/, "");
    return `${baseUrl}/${relative}`;
}
