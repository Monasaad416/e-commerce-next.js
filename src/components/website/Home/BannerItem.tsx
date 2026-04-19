"use client"

import Image from "next/image"
import { useLocale } from "next-intl"

export function BannerItem({
  image,
  alt,
  title,
  subtitle,
}: {
  image: string
  alt?: string
  title: string
  subtitle: string
}) {
  const locale = useLocale()
  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <div
      dir={dir}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl"
      style={{ backgroundColor: "#f5f0eb" }}
    >
      {image && (
        <div className="relative aspect-[5/4] w-full overflow-hidden">
          <Image
            src={image}
            alt={alt?.trim() ? alt : title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            loading="eager"
            unoptimized
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center px-5 py-4 text-start">
        <p
          className="text-sm font-semibold tracking-wide"
          style={{ color: "#3d2b1f" }}
        >
          {title}
        </p>
        <p
          className="mt-1 line-clamp-2 text-xs leading-5"
          style={{ color: "#8b7355" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  )
}
