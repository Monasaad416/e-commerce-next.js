import { useLocale } from "next-intl"
import { resolveImageUrl } from "@/lib/media"
import { BannerItem } from "./BannerItem"
import Image from "next/image"

const SecHomeBanner = ({ content }: { content: any }) => {
  const locale = useLocale()

  return (
    <section className="w-[80%] mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="space-y-6">
          <BannerItem
            image={resolveImageUrl(content?.sec_banner_first_half_part1_image)}
            title={content?.sec_banner_first_half_part1_title?.[locale]}
            subtitle={content?.sec_banner_first_half_part1_subtitle?.[locale]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BannerItem
              image={resolveImageUrl(content?.sec_banner_first_half_part2_image)}
              title={content?.sec_banner_first_half_part2_title?.[locale]}
              subtitle={content?.sec_banner_first_half_part2_subtitle?.[locale]}
            />

            <BannerItem
              image={resolveImageUrl(content?.sec_banner_first_half_part3_image)}
              title={content?.sec_banner_first_half_part3_title?.[locale]}
              subtitle={content?.sec_banner_first_half_part3_subtitle?.[locale]}
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-shop_light_gray p-6 rounded-lg flex gap-6 items-center">
          <div className="relative md:w-52 w-20 md:h-52 h-20 ">
            <Image
              src={resolveImageUrl(content?.sec_banner_sec_half_image)}
              fill
              className="object-cover rounded-md"
              alt="banner"
              loading="eager"
              unoptimized
            />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              {content?.sec_banner_sec_half_title?.[locale]}
            </h2>
            <p className="text-sm sm:text-base">
              {content?.sec_banner_sec_half_subtitle?.[locale]}
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default SecHomeBanner
