'use client'
import HomeBanner from "@/components/website/Home/HomeBanner"
import ProductsList from "@/components/website/Products/ProductsList"
import ViewAllBtn from "@/components/website/ViewAllBtn"
import { useEffect, useState } from "react"
import { usePageContent } from "@/hooks/usePageContent"
import SecHomeBanner from "@/components/website/Home/SecHomeBanner"
import CraftProcess from "@/components/website/Home/CraftProcess"
import { resolveImageUrl } from "@/lib/media"
import CustomLoader from "@/components/customLoader/CustomLoader"



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
  if (paramsError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-5 py-4 text-center text-shop_white shadow-lg">
          <p className="font-semibold text-red-200">Something went wrong</p>
          <p className="mt-2 text-sm text-red-100/90">{paramsError.message}</p>
        </div>
      </div>
    );
  }
  if (isContentError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-5 py-4 text-center text-shop_white shadow-lg">
          <p className="font-semibold text-red-200">Could not load home content</p>
          <p className="mt-2 text-sm text-red-100/90">{contentError?.message}</p>
        </div>
      </div>
    );
  }
  if (!params?.lang) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-shop_white">
        <p>Language not specified</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* <CategoriesFilter /> */}
      <HomeBanner
        title={stripHtml(content?.main_banner_title?.[params.lang] || '')}
        subtitle={stripHtml(content?.main_banner_subtitle?.[params.lang] || '')}
        btnText={stripHtml(content?.main_banner_button_text?.[params.lang] || '')}
        btnLink={content?.main_banner_button_link}
        imageUrl={resolveImageUrl(content?.main_banner_image)}
      />

      <SecHomeBanner content={content} />
      <CraftProcess />
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <ProductsList limit={8} />
        <ViewAllBtn />
      </section>
    </div>
  );
}

export default Home;