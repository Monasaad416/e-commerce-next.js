import ShopClient from './ShopClient';
import { ShopProps } from '@/interfaces/ShopProps';

export default async function ShopPage({ params }: ShopProps) {
  const { lang } = await params;
  const langNorm = lang === 'ar' ? 'ar' : 'en';

  return <ShopClient lang={langNorm} />;
}
