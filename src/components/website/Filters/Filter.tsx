'use client';
import React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from '@/lib/utils';

interface SliderProps {
  className?: string;
  [key: string]: any;
}

const Filter = ({ className, ...props }: SliderProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedSort = searchParams.get('sort');
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 1000;

  const handleChangeRouter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === '') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    // Update the URL with the new query parameters
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceChange = (value: number[]) => {
    const [min, max] = value;
    const params = new URLSearchParams(searchParams.toString());

    if (min > 0) {
      params.set('minPrice', min.toString());
    } else {
      params.delete('minPrice');
    }

    if (max < 1000) {
      params.set('maxPrice', max.toString());
    } else {
      params.delete('maxPrice');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  return (
    <div className="flex flex-row justify-between items-center w-[50%]">

      <Select onValueChange={(value) => handleChangeRouter(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Sort by</SelectLabel>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="low-to-high">Price: Low to High</SelectItem>
            <SelectItem value="high-to-low">Price: High to Low</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="w-[30%] px-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-shop_dark font-bold">${minPrice}</span>
          <span className="text-shop_dark font-bold">${maxPrice === 1000 ? '1000+' : maxPrice}</span>
        </div>
        <div className="px-4">
          <Slider
            value={[minPrice, maxPrice]}
            min={0}
            max={1000}
            step={10}
            minStepsBetweenThumbs={10}
            onValueChange={handlePriceChange}
            className={cn("price-slider w-full", className)}
            {...props}
          />
        </div>

      </div>
      <div className="w-[20%]">
        <input type="text" placeholder="Search" className="w-full px-4 py-2 rounded-lg" />
      </div>
    </div>
  )
}

export default Filter