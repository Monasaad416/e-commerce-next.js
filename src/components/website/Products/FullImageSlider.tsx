'use client'

import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

export default function FullImageSlider({
  images = [],
  onClose,
  initialIndex = 0,
}: {
  images: string[];
  onClose: () => void;
  initialIndex?: number;
}) {
  if (!images.length) return null;

  const start = Math.max(0, Math.min(initialIndex, images.length - 1));

  return (
    <div className="fixed inset-0 z-50 bg-black/90">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white text-3xl z-50"
      >
        ✕
      </button>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={30}
        slidesPerView={1}
        initialSlide={start}
        className="w-full h-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="flex items-center justify-center h-full">
              <Image
                src={img}
                alt={`Image ${i + 1}`}
                width={1200}
                height={800}
                className="object-contain max-h-[90vh]"
                priority
                unoptimized={process.env.NODE_ENV !== 'production'}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}