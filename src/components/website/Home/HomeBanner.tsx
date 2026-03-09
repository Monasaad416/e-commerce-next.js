import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import Title from '@/components/website/Title'
import { IHomeBannerProps } from '@/interfaces/HomeBannerType'






const HomeBanner = ({ title, subtitle, imageUrl , btnText, btnLink}: IHomeBannerProps ) => {
  const locale = useLocale();

  return (
    <section>
      <div className='flex md:flex-row flex-col items-center justify-between bg-shop_dark_primary xl:px-50 md:px-20 md:py-10'>
        <div className='w-[70%] h-[100%] md:text-start md:text-start text-center md:my-5 my-10'>
          <Title className='mb-5 text-shop_white font-bold text-3xl'>{title}</Title>
          <p className='text-shop_white mb-5'>{subtitle}</p>
          <br/>
          <Link href={`/${locale}/${btnLink}`} className='bg-shop_dark_primary text-shop_white border border-shop_white px-3 py-2 hover:bg-shop_light_primary hover:text-shop_dark_primary hover:cursor-pointer hoverEffect'>{btnText}</Link>
        </div>
        <div className='md:w-[30%] w-[80%] md:h-[100%] h-[30%] md:mt-0 md:mb-0 mt-15 mb-0'>
          <Image src={imageUrl} width={300} height={100} alt="banner" 
            placeholder="empty"
            loading="eager"
            unoptimized
            className='object-contain'
           />
        </div>
      </div>
    </section>
  )
}

export default HomeBanner