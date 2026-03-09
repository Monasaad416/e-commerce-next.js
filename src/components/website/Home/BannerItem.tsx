import Image from "next/image"
import Title from "@/components/website/Title"

export function BannerItem({
  image,
  title,
  subtitle,
  btnText,
  btnLink
}: {
  image: string
  title: string
  subtitle: string
  btnText?: string
  btnLink?: string
}) {
  return (
    <div className="flex gap-4 items-center bg-shop_light_gray p-4 rounded-lg">
      {image && (
        <div className="relative w-20 h-20 shrink-0">
          <Image
            src={image}
            fill
            className="object-cover rounded-md"
            alt={title}
            loading="eager"
            unoptimized
          />
        </div>
      )}

      <div>
        <Title className="text-base sm:text-lg font-bold mb-1">
          {title}
        </Title>
        <p className="text-sm text-shop_dark_primary">
          {subtitle}
        </p>
      </div>
    </div>
  )
}
