"use client";

import { Button } from "../ui/button";
import { FaArrowRight } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const ViewAllBtn = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex justify-center my-10 sm:my-12">
      <Button
        asChild
        className="h-12 rounded-full border border-shop_secondary/40 bg-shop_dark_primary px-8 text-base font-semibold text-shop_white shadow-md transition hover:bg-shop_secondary hover:text-shop_dark_primary focus-visible:ring-2 focus-visible:ring-shop_secondary focus-visible:ring-offset-2 focus-visible:ring-offset-shop_dark_primary"
      >
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center justify-center gap-2"
        >
          <span>{t("Products.ViewAllProducts")}</span>
          <FaArrowRight
            className="h-3.5 w-3.5 shrink-0 rtl:rotate-180"
            aria-hidden
          />
        </Link>
      </Button>
    </div>
  );
};

export default ViewAllBtn;