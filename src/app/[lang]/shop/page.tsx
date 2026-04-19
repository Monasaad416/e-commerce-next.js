'use client';

import { useMemo, useState, use, useEffect } from 'react';
import { useTranslations } from 'next-intl'
import { useProducts } from '@/hooks/useProducts';
import { IProduct } from '@/interfaces/productType';
import ProductsList from '@/components/website/Products/ProductsList';
import PageBreadCrumb from '@/components/website/PageBreadCrumb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Collapsible,CollapsibleContent,CollapsibleTrigger } from '@/components/ui/collapsible'
import { FaAngleDown } from 'react-icons/fa';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ICategory } from '@/interfaces/categoryType';
import { useCategories } from '@/hooks/useCategories';
import { useLocalizedValue } from '@/hooks/useLocalizedValue';
import { ShopProps } from '@/interfaces/ShopProps';
import { PaginationDemo } from '@/components/website/PaginatioDemo';
import CustomLoader from '@/components/customLoader/CustomLoader';

const Shop = ({ params }: ShopProps) => {
  const { lang } = use(params);
  const t = useTranslations();
  const tValue = useLocalizedValue();
  const isRTL = lang === "ar";
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const { data, isLoading, error } = useProducts({ locale: lang });
  const { data: categoriesData } = useCategories();

  const filteredProducts = useMemo<IProduct[]>(() => {
    if (!data?.data?.products) return [];

    let products = [...data.data.products];

    if (selectedCategorySlug) {
      products = products.filter(
        (product) => product.category_slug === selectedCategorySlug
      );
    }

    products = products.filter((product) => {
      const price =
        product.type === "simple"
          ? Number(product.selling_price)
          : Number(product.variants?.[0]?.selling_price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedColors) {
      products = products.filter((product) =>
        product.variants?.some((variant) =>
          variant.attribute_values?.some((attr) => {
            const attrName =
              attr.attribute_name?.[lang] ?? attr.attribute_name?.en ?? "";
            const attrValue = attr.value?.[lang] ?? attr.value?.en ?? "";
            return (
              ["color", "colour", "اللون"].includes(attrName.toLowerCase()) &&
              attrValue.toLowerCase() === selectedColors.toLowerCase()
            );
          })
        )
      );
    }

    return products;
  }, [data, selectedCategorySlug, priceRange, selectedColors, lang]);

  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredProducts.length / 8));
  }, [filteredProducts]);

  const ITEMS_PER_PAGE = 8;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const products = data?.data?.products;
  const availableColors = useMemo<string[]>(() => {
    if (!products?.length) return [];
    const colors = products.flatMap(
      (product) =>
        product.variants?.flatMap((variant) =>
          variant.attribute_values
            ?.filter((attr) => {
              const name = attr.attribute_name?.[lang] ?? attr.attribute_name?.en ?? "";
              return ["color", "colour", "اللون"].includes(name.toLowerCase());
            })
            .map((attr) => (attr.value?.[lang] ?? attr.value?.en ?? "").toLowerCase())
            .filter(Boolean)
        ) ?? []
    );
    return Array.from(new Set(colors));
  }, [products, lang]);

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedCategorySlug("");
    setSelectedColors("");
  };

  if (isLoading) return <CustomLoader />;
  if (error) return <p className="p-6">Something went wrong</p>;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <PageBreadCrumb page="Shop" />

      <section
        dir={isRTL ? "rtl" : "ltr"}
        className="mb-6 overflow-hidden rounded-[2rem] border px-5 py-8 sm:px-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,244,235,0.95) 0%, rgba(245,236,224,0.98) 100%)",
          borderColor: "#dcc3a0",
          boxShadow: "0 16px 38px rgba(61,43,31,0.1)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7355]">
          {isRTL ? "مصنوعات جلدية يدوية" : "Handmade Leather Goods"}
        </p>
        <h1
          className="mt-2 text-3xl font-bold sm:text-4xl"
          style={{ color: "#3d2b1f", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {isRTL ? "تسوق التشكيلة الكاملة" : "Shop The Full Collection"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7c6348]">
          {isRTL
            ? "استعرض منتجات الجلد الطبيعي المصنوعة بعناية، مع خيارات مرنة للتصنيف والسعر واللون."
            : "Browse premium handmade leather pieces with curated filters for category, price, and color."}
        </p>
      </section>

      <div className="grid grid-cols-12 gap-5">
        <aside className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="sticky top-24 rounded-2xl border border-[#e1c9a8] bg-[#f8f1e7] p-4 shadow-[0_12px_30px_rgba(61,43,31,0.12)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#3d2b1f]">
                {isRTL ? "تصفية النتائج" : "Filter Results"}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#8b5f3c] underline underline-offset-4"
              >
                {isRTL ? "إعادة تعيين" : "Reset"}
              </button>
            </div>

            <Collapsible defaultOpen className="mb-4 border-b border-[#e5d3bc] pb-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group h-9 w-full justify-between px-2 text-[#3d2b1f]">
                  {t('Products.Price')}
                  <FaAngleDown className="transition group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 px-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[#6f553d]">{t('Products.From')}</label>
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="mt-1 border-[#d7b890] bg-[#fffaf3]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#6f553d]">{t('Products.To')}</label>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="mt-1 border-[#d7b890] bg-[#fffaf3]"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#6f553d]">{t('Products.PriceRange')}</span>
                  <Slider
                    value={priceRange}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                    className="mt-3 price-slider"
                  />
                  <div className="mt-2 flex justify-between text-xs text-[#7c6348]">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen className="mb-4 border-b border-[#e5d3bc] pb-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group h-9 w-full justify-between px-2 text-[#3d2b1f]">
                  {t('Categories.Categories')}
                  <FaAngleDown className="transition group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 px-2 pt-2">
                {categoriesData?.data?.categories?.map((category: ICategory) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedCategorySlug === category.slug}
                      onCheckedChange={(checked) =>
                        setSelectedCategorySlug(checked ? category.slug : "")
                      }
                    />
                    <label
                      className="cursor-pointer text-sm text-[#5f4732]"
                      onClick={() =>
                        setSelectedCategorySlug(
                          selectedCategorySlug === category.slug ? "" : category.slug
                        )
                      }
                    >
                      {tValue(category.name)}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="group h-9 w-full justify-between px-2 text-[#3d2b1f]">
                  {t('Colors.Colors')}
                  <FaAngleDown className="transition group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 px-2 pt-2">
                {availableColors.map((color) => (
                  <div key={color} className="flex items-center gap-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedColors === color}
                      onCheckedChange={(checked) => setSelectedColors(checked ? color : "")}
                    />
                    <label htmlFor={`color-${color}`} className="cursor-pointer text-sm capitalize text-[#5f4732]">
                      {color}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-8 lg:col-span-9">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#e7d6c2] bg-[#fbf6ef] px-4 py-3">
            <p className="text-sm font-medium text-[#5f4732]">
              {isRTL
                ? `${filteredProducts.length} منتج متاح`
                : `${filteredProducts.length} products available`}
            </p>
            {(selectedCategorySlug || selectedColors || priceRange[0] !== 0 || priceRange[1] !== 1000) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#8b5f3c] underline underline-offset-4"
              >
                {isRTL ? "مسح الفلاتر" : "Clear filters"}
              </button>
            )}
          </div>

          <ProductsList products={paginatedProducts} />
          <PaginationDemo currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </main>
      </div>
    </div>
  );
};

export default Shop;
