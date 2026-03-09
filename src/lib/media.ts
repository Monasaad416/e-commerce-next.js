export function resolveImageUrl(path?: string | null) {
    if (!path) return "/no-image.png";

    // already full url
    if (path.startsWith("http")) return path;

    const baseUrl = process.env.NEXT_PUBLIC_STORAGE_BASE_URL || 'http://laravel-next-ecomm.test/storage';
    return `${baseUrl}/${path}`;
}
