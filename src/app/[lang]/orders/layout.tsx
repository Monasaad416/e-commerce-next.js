import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildPageMetadata({
    lang,
    path: "/orders",
    title: "Orders",
    noIndex: true,
  });
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
