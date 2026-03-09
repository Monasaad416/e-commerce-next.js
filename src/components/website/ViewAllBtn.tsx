'use client';


import { Button } from "../ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const ViewAllBtn = () => {

      const t = useTranslations();
      const locale =  useLocale();

    return (
      <div className="flex justify-center my-8">
        <Button
            className="border border-gray-300 py-6 rounded-xl font-semibold bg-shop_dark_primary hover:bg-shop_white hover:text-shop_dark_primary transition"
        >   
          <FaArrowLeft className="mr-1 h-3 w-3" />
          <Link href={`${locale}/shop`}>
            {t("Products.ViewAllProducts")}
          </Link>
        </Button>
      </div>
    );
};

export default ViewAllBtn;