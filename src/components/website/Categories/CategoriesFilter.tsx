'use client'

import { useLocalizedValue } from "@/hooks/useLocalizedValue";
import { useQueryParam } from "@/hooks/useQueryParam";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { resolveImageUrl } from "@/lib/media";
import { useCategories } from "@/hooks/useCategories";

const CategoriesFilter = () => {
  const { value: selectedCategory, setValue } = useQueryParam("category");
  const tValue = useLocalizedValue();
  const t = useTranslations();
  const { data } = useCategories();
  const categories = data?.data?.categories || [];

  return (
    <div className="bg-shop_medium_primary mx-auto p-4 md:block hidden">
      <ul className="flex space-x-4 justify-center">
        <li>
          <button
            onClick={() => setValue(null)}
            className={!selectedCategory ? "bg-white px-3 rounded-full shadow-md py-1" : "text-white py-1"}
          >
            {t("Categories.All")}
          </button>
        </li>


        {categories.map((category) => {
          const imageUrl = resolveImageUrl(category.img);

          return (
            <li key={category.id}>
              <button
                onClick={() => setValue(category.slug)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full
                  ${selectedCategory === category.slug
                    ? "bg-white shadow-md"
                    : "text-white"}`}
              >
              <Image
                src={imageUrl}
                width={20}
                height={20}
                alt={tValue(category.name)}
                unoptimized
                placeholder="empty"
                loading="eager"
                style={{
                  filter: selectedCategory === category.slug ?'': 'brightness(0) invert(1)' 
                }}
              />
                {tValue(category.name)}
              </button>
            </li>
          );
        })}

      </ul>
    </div>
  );
};

export default CategoriesFilter;
