'use client'
import HomeBanner from "@/components/website/Home/HomeBanner"
import ProductsList from "@/components/website/Products/ProductsList"
import CategoriesFilter from "@/components/website/Categories/CategoriesFilter"
import ViewAllBtn from "@/components/website/ViewAllBtn"
import { useEffect, useState } from "react"
import { usePageContent } from "@/hooks/usePageContent"
import SecHomeBanner from "@/components/website/Home/SecHomeBanner"
import { resolveImageUrl } from "@/lib/media"
import CustomLoader from "@/components/customLoader/CustomLoader"
import BrowseByCategory from "@/components/website/Home/BrowseByCategory"
import HomeFilter from "@/components/website/Filters/HomeFilter"



interface HomeProps {
  params: Promise<{
    lang: string;
  }>;
}

const Home = ({ params: paramsPromise }: HomeProps) => {
  // First, handle the async params
  const [params, setParams] = useState<{ lang: string } | null>(null);
  const [isParamsLoading, setIsParamsLoading] = useState(true);
  const [paramsError, setParamsError] = useState<Error | null>(null);

  // Load params
  useEffect(() => {
    const loadParams = async () => {
      try {
        const resolved = await paramsPromise;
        setParams(resolved);
      } catch (err) {
        setParamsError(err as Error);
      } finally {
        setIsParamsLoading(false);
      }
    };
    loadParams();
  }, [paramsPromise]);

  // Then use the page content hook
  const {
    data: content,
    isLoading: isContentLoading,
    isError: isContentError,
    error: contentError,
  } = usePageContent( params?.lang || 'en','home');

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>?/gm, '');
  }





  // Handle loading and error states
  if (isParamsLoading || isContentLoading) return<CustomLoader/>;
  if (paramsError) return <div>Error loading page: {paramsError.message}</div>;
  if (isContentError) return <div>Error: {contentError?.message}</div>;
  if (!params?.lang) return <div>Language not specified</div>;

  return (
    <div>
      <CategoriesFilter />
      <HomeBanner
        title={stripHtml(content?.main_banner_title?.[params.lang] || '')}
        subtitle={stripHtml(content?.main_banner_subtitle?.[params.lang] || '')}
        btnText={stripHtml(content?.main_banner_button_text?.[params.lang] || '')}
        btnLink={content?.main_banner_button_link}
        imageUrl={resolveImageUrl(content?.main_banner_image)}
      />

      <SecHomeBanner content={content} />
      <div className="w-[80%] mx-auto">
        <BrowseByCategory />
        <HomeFilter />
        <ProductsList limit={8} />
        <ViewAllBtn />
      </div>

    </div>
  );
}

export default Home;