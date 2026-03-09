import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLocale, useTranslations } from 'next-intl';


const PageBreadCrumb = ({page}: {page:string}) => {
    const t = useTranslations();
    const locale = useLocale();
  return (
        <div className="container-fluid m-8">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink className="text-xl" href="/">{t('Home.title')}</BreadcrumbLink>
                    </BreadcrumbItem>

           <BreadcrumbSeparator
  className={locale === 'ar' ? 'rotate-180' : ''}
/>


                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-xl">{t(`${page}.title`)}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </div>
  )
}

export default PageBreadCrumb