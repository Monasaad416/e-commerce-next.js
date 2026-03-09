import { useTranslations } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useCategories } from '@/hooks/useCategories';
import { useLocalizedValue } from '@/hooks/useLocalizedValue';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/media';
import Link from 'next/link';
import { useQueryParam } from '@/hooks/useQueryParam';

const BrowseByCategory = () => {
    const t = useTranslations();
    const tValue = useLocalizedValue();
    const { data } = useCategories();
    const categories = data?.data?.categories || [];
    const { value: selectedCategory, setValue } = useQueryParam("category");
    

  return (
    <div className='m-6'>
        <h2 className='text-2xl font-bold'>{t("Categories.BrowseByCategory")}</h2>

        <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={50}
            slidesPerView={6}
            navigation
            pagination={{ clickable: true }}
            className="mySwiper mx-auto mt-6 mb-8"
        >
            {categories.map((category) => {
                const imageUrl = resolveImageUrl(category.img);
                return (
                    <SwiperSlide key={category.id}>
<div className={`relative bg-white rounded-2xl m-4 p-6 flex flex-col items-center cursor-pointer transition-all duration-300 border-2
    ${selectedCategory === category.slug
        ? "border-shop_dark_primary shadow-xl scale-105 bg-gradient-to-br from-shop_dark_primary/5 to-shop_dark_primary/10"
        : "border-gray-200 hover:border-shop_dark_primary/50 hover:shadow-lg hover:scale-102 hover:bg-gray-50"}`}
    onClick={() => setValue(category.slug)}
>
    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-300
        ${selectedCategory === category.slug
            ? "bg-shop_dark_primary scale-100"
            : "bg-gray-300 scale-0"}`}
    />
    <Image
        src={imageUrl}
        width={48}
        height={48}
        alt={tValue(category.name)}
        unoptimized
        placeholder="empty"
        loading="eager"
        className="mb-3 transition-all duration-300"
        style={{
            filter: selectedCategory === category.slug ? 'none' : 'brightness(0) invert(0.3)'
        }}
    />
    <h3 className={`text-base font-semibold transition-all duration-300 text-center
        ${selectedCategory === category.slug
            ? "text-shop_dark_primary"
            : "text-gray-700"}`}
    >
        {tValue(category.name)}
    </h3>
</div>
                    </SwiperSlide>
                );
            })}
        </Swiper>
    </div>
  )
}

export default BrowseByCategory;