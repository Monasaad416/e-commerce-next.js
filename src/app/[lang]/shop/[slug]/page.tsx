
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { getProduct } from '@/lib/getProduct';

interface ProductPageProps {
  params: { 
    lang: string; 
    slug: string 
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProduct(resolvedParams.lang, resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description,

  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <ProductClient productSlug={resolvedParams.slug} />;
}