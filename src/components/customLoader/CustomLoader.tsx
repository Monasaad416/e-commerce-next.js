"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export type AppLoaderProps = {
  /** Full viewport (pages) vs shorter block (e.g. product grid inside a section). */
  variant?: "fullscreen" | "inline";
  className?: string;
};

/**
 * App-wide loading UI — matches the legacy client-layout spinner (ring + caption on dark bg).
 */
export function AppLoader({ variant = "fullscreen", className }: AppLoaderProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-shop_dark_primary text-shop_white px-6",
        variant === "fullscreen"
          ? "min-h-screen"
          : "min-h-[min(24rem,55vh)] w-full py-16",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="h-10 w-10 rounded-full border-2 border-shop_light_gray/30 border-t-shop_secondary animate-spin" />
      <p className="text-sm text-shop_light_gray">
        {isAr ? "جاري التحميل…" : "Loading…"}
      </p>
    </div>
  );
}

/** @deprecated Use `AppLoader` — kept for existing imports. */
export function CustomSpinner(props: AppLoaderProps) {
  return <AppLoader {...props} />;
}

export default AppLoader;
