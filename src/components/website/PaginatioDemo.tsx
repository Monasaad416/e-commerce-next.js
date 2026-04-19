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
    <Pagination dir={isRTL ? "rtl" : "ltr"} className="my-10">
      <PaginationContent className="gap-1.5 rounded-full border border-[#d9c1a0] bg-[#f8efe3] px-2 py-1 shadow-[0_10px_24px_rgba(61,43,31,0.12)]">

        {/* Previous */}
        <PaginationItem>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[#5f4732] transition hover:bg-[#efdfcc] hover:text-[#3d2b1f]",
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
              className={cn(
                "h-9 min-w-9 rounded-full border border-transparent bg-transparent px-3 text-sm font-semibold text-[#6a4f37] transition hover:border-[#d8bb95] hover:bg-[#efdfcc] hover:text-[#3d2b1f]",
                page === currentPage &&
                  "border-[#bc9767] bg-[#3d2b1f] text-[#f3dfc0] shadow-[0_8px_18px_rgba(61,43,31,0.24)] hover:bg-[#3d2b1f] hover:text-[#f3dfc0]"
              )}
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
              "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[#5f4732] transition hover:bg-[#efdfcc] hover:text-[#3d2b1f]",
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
