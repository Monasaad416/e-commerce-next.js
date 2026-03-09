export async function getProduct(lang: string, slug: string) {
  const response = await fetch(`http://laravel-next-ecomm.test/api/v1/${lang}/products/${slug}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}