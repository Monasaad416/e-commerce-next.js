'use client';

import { useMemo, useState, use, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
import CategoriesFilter from '@/components/website/Categories/CategoriesFilter';

const Shop = ({ params }: ShopProps) => {
    const { lang } = use(params);
    const t = useTranslations();
    const tValue = useLocalizedValue();
    const searchParams = useSearchParams();
    //   const selectedCategory = searchParams.get('category');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
    const [selectedColors, setSelectedColors] = useState<string>('');
    const [sortType, setSortType] = useState<string>('newest');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    //Fetch products (React Query)
    const { data, isLoading, error } = useProducts({ locale: lang });

    //Fetch categories (React Query)
    const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();




    //Apply filters + sorting
    const filteredProducts = useMemo<IProduct[]>(() => {
      if (!data?.data?.products) return [];

      let products = [...data?.data?.products];

      // Filter by selected category
      if (selectedCategorySlug) {
            products = products.filter(product => 
            product.category_slug === selectedCategorySlug
          );
      }

      // Filter by price
      products = products.filter((product) => {
          let price: number;
          if (product.type === "simple") {
          price = Number(product?.selling_price);
          } else {
          price = Number(product.variants?.[0]?.selling_price);
          }
          return price >= priceRange[0] && price <= priceRange[1];
      });

      // filter by colors
      if (selectedColors) {
        products = products.filter(product =>
          product.variants?.some(variant =>
            variant.attribute_values?.some(attr => {
              const attrName =
                attr.attribute_name?.[lang] ??
                attr.attribute_name?.en ??
                '';

              const attrValue =
                attr.value?.[lang] ??
                attr.value?.en ??
                '';

              return (
                ['color', 'colour', 'اللون'].includes(attrName.toLowerCase()) &&
                attrValue.toLowerCase() === selectedColors.toLowerCase()
              );
            })
          )
        );
      }
      return products;
    }, [data, selectedCategorySlug, priceRange, sortType, selectedColors]);

    useEffect(() => {
      setCurrentPage(1);
      setTotalPages(Math.ceil(filteredProducts.length / 4));
  }, [filteredProducts]);


  const ITEMS_PER_PAGE = 4;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);




    
  const products = data?.data?.products;
   
  // Extract available colors
  const availableColors = useMemo<string[]>(() => {

    if (!products?.length) return [];

    const colors = products.flatMap(product =>
      product.variants?.flatMap(variant =>
        variant.attribute_values
          ?.filter(attr => {
            const name =
              attr.attribute_name?.[lang] ??
              attr.attribute_name?.en ??
              '';

            return ['color', 'colour', 'اللون'].includes(
              name.toLowerCase()
            );
          })
          .map(attr =>
            (
              attr.value?.[lang] ??
              attr.value?.en ??
              ''
            ).toLowerCase()
          )
          .filter(Boolean)
      ) ?? []
    );

    return Array.from(new Set(colors));
  }, [products, lang]);


    if (isLoading) return <p className="p-6">Loading...</p>;
    if (error) return <p className="p-6">Something went wrong</p>;

    return (
        <div className="container-fluid">
        <PageBreadCrumb page="Shop" />
        <CategoriesFilter />  

        <div className="grid grid-cols-12 gap-4">
            <aside className="col-span-12 md:col-span-3 px-4">
                {/* price filter */}
                <Collapsible defaultOpen className="my-4">
                    <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="group w-full justify-between">
                        {t('Products.Price')}
                        <FaAngleDown className="group-data-[state=open]:rotate-180 transition" />
                    </Button>
                    </CollapsibleTrigger>
                    <hr/>

                    <CollapsibleContent className="p-4 space-y-3">
                    
                        <div className="flex items-center gap-2">
                        <div>
                            <label className="text-sm">{t('Products.From')}</label>
                            <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) =>
                                setPriceRange([Number(e.target.value), priceRange[1]])
                            }
                            />
                        </div>

                        <div>
                            <label className="text-sm">{t('Products.To')}</label>
                            <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) =>
                                setPriceRange([priceRange[0], Number(e.target.value)])
                            }
                            />
                        </div>
                        </div>

                        <div className="w-full">
                            <div className="p-4">
                                <span className="text-sm font-medium">{t('Products.PriceRange')}</span>
                                <Slider
                                    value={priceRange}
                                    max={1000}
                                    step={10}
                                    onValueChange={(value) => setPriceRange(value as [number, number])}
                                    className="mt-2"
                                />
                                <div className="flex justify-between text-sm text-gray-600 mt-1">
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>


                {/* categories filter */}
                <Collapsible defaultOpen className="my-4">
                    <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="group w-full justify-between">
                        {t('Categories.Categories')}
                        <FaAngleDown className="group-data-[state=open]:rotate-180 transition" />
                    </Button>
                    </CollapsibleTrigger>
                    <hr/>

                    <CollapsibleContent className="p-4 space-y-3">      
                        <div className="flex items-center gap-2">
                            <div>
                                {categoriesData?.data?.categories?.map((category: ICategory) => (
                                    <div key={category.id}>
                                        <Checkbox 
                                            checked={selectedCategorySlug === category?.slug}
                                            onCheckedChange={(checked) => {
                                                setSelectedCategorySlug(checked ? category?.slug : '');
                                            }}
                                            />
                                            <label className="mx-2 cursor-pointer" onClick={() => {
                                            setSelectedCategorySlug(selectedCategorySlug === category.slug ? '' : category.slug);
                                            }}>
                                            {tValue(category?.name)}
                                            </label>
                                    </div>
                                ))}
            
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* colors filter */}
                <Collapsible defaultOpen className="my-4">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="group w-full justify-between">
                          {t('Colors.Colors')}
                          <FaAngleDown className="group-data-[state=open]:rotate-180 transition" />
                      </Button>
                    </CollapsibleTrigger>
                    <hr/>

                    <CollapsibleContent className="p-4 space-y-3">
                      <div className="space-y-2">
                        {availableColors.map((color) => (
                          <div key={color} className="flex items-center gap-2">
                            <Checkbox
                              id={`color-${color}`}
                              checked={selectedColors === color}
                              onCheckedChange={(checked) =>
                                setSelectedColors(checked ? color : '')
                              }
                            />
                            <label
                              htmlFor={`color-${color}`}
                              className="cursor-pointer capitalize"
                            >
                              {color}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>

                </Collapsible>


                    {/* <CategoriesFilter lang={resolvedParams.lang} /> */}
                {/* <div className="flex flex-col md:flex-row justify-between items-center gap-4 my-6">
                    <div className="w-full md:w-auto">
                        <Select value={sortType} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sort by</SelectLabel>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="priceHighToLow">Price High to Low</SelectItem>
                                    <SelectItem value="priceLowToHigh">Price Low to High</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    

                </div> */}
        
            </aside>

            {/*Products (9 cols) */}
            <main className="col-span-12 md:col-span-9">
              <ProductsList products={paginatedProducts}  />

              <PaginationDemo currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </main>
        </div>
        </div>
    );
};

export default Shop;
