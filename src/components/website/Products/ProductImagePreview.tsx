"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import FullImageSlider from "./FullImageSlider";
import { cn } from "@/lib/utils";

export default function ProductImagePreview({
  images = [],
  imageAlt = "",
}: {
  images: string[];
  /** Accessible name for the main image (e.g. product title). */
  imageAlt?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const imagesKey = useMemo(() => images.join("|"), [images]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [imagesKey]);

  const list = images.filter(Boolean);
  const mainSrc = list[activeIndex] ?? list[0];
  const unoptimized = process.env.NODE_ENV !== "production";

  if (!isMounted || !list.length) {
    return (
      <div
        className="w-full aspect-square max-h-[min(560px,75vh)] min-h-[280px] rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/40 animate-pulse"
        aria-hidden
      />
    );
  }

  return (
    <>
      <div className="space-y-4 lg:sticky lg:top-24">
        <div
          className="relative w-full aspect-square max-h-[min(560px,75vh)] min-h-[280px] cursor-zoom-in overflow-hidden rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/25 shadow-lg shadow-black/20"
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          aria-label="Open gallery"
        >
          <Image
            src={mainSrc}
            alt={imageAlt || "Product"}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={unoptimized}
          />
        </div>

        {list.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {list.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                  i === activeIndex
                    ? "border-shop_secondary ring-2 ring-shop_secondary/30 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
                aria-label={`Image ${i + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized={unoptimized}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {open && (
        <FullImageSlider images={list} initialIndex={activeIndex} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
