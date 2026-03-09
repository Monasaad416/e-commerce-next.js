'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

function toArabicNumerals(num: number): string {
  const arabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  return num.toString().split("").map(n => arabic[+n]).join("");
}

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationDemo({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const t = useTranslations("Pagination");
  const locale = useLocale();
  const isRTL = locale === "ar";

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination dir={isRTL ? "rtl" : "ltr"} className="my-8">
      <PaginationContent>

        {/* Previous */}
        <PaginationItem>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm",
              currentPage === 1 && "opacity-50 pointer-events-none"
            )}
          >
            {isRTL ? <ChevronRight /> : <ChevronLeft />}
            {t("Previous")}
          </button>
        </PaginationItem>

        {/* Pages */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {isRTL ? toArabicNumerals(page) : page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm",
              currentPage === totalPages && "opacity-50 pointer-events-none"
            )}
          >
            {t("Next")}
            {isRTL ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}
