"use server"
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { auth } from "@/lib/auth";
import { ICartItem } from "@/interfaces/CartStoreStateType";
import { API_URLS } from "@/app/Services/Urls";
import getAuthHeaders from "./getAuthHeaders";
import { routing } from "@/i18n/routings";

export type CreateOrderResult =
  | { sessionUrl: string; orderId?: string; error?: undefined }
  | { sessionUrl?: undefined; orderId?: undefined; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function extractOrderId(payload: Record<string, unknown>): string | null {
  const data = asRecord(payload.data);
  const order = asRecord(payload.order) ?? asRecord(data?.order);

  const candidates = [
    payload.order_id,
    payload.id,
    order?.id,
    data?.order_id,
    data?.id,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function extractCheckoutUrl(payload: Record<string, unknown>): string | null {
  const data = asRecord(payload.data);
  const order = asRecord(payload.order) ?? asRecord(data?.order);

  const candidates = [
    payload.session_url,
    payload.checkout_url,
    payload.url,
    data?.session_url,
    data?.checkout_url,
    data?.url,
    order?.session_url,
    order?.checkout_url,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

export async function createOrder(
  cartItems: ICartItem[],
  locale: string,
): Promise<CreateOrderResult> {
  const safeLocale = routing.locales.includes(locale as "en" | "ar")
    ? locale
    : routing.defaultLocale;

  const t = await getTranslations({ locale: safeLocale, namespace: "Cart" });

  if (!cartItems.length) return { error: t("EmptyCart") };

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email) {
      return { error: t("SignInToCheckout") };
    }

    const validItems = cartItems.filter(
      (item) => item?.product_variant_id !== undefined,
    );
    if (validItems.length === 0) {
      return { error: t("ProductsUnavailable") };
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + item.qty * Number(item.price),
      0,
    );
    const shipping = 0;
    const total = subtotal + shipping;

    // 1) Create order
    const orderRes = await fetch(API_URLS.ORDER.CREATE_ORDER(safeLocale), {
      method: "POST",
      headers: getAuthHeaders() as HeadersInit,
      body: JSON.stringify({
        cartItems,
        subtotal,
        shipping,
        total,
      }),
    });

    const orderPayload = (await orderRes.json()) as Record<string, unknown>;

    if (!orderRes.ok) {
      const message =
        typeof orderPayload.message === "string"
          ? orderPayload.message
          : undefined;
      return { error: message ?? t("CreateOrderFailed") };
    }

    const orderId = extractOrderId(orderPayload);
    if (!orderId) {
      return { error: t("CreateOrderFailed") };
    }

    // 2) Start Stripe checkout for that order
    const checkoutRes = await fetch(
      API_URLS.ORDER.CHECKOUT(safeLocale, orderId),
      {
        method: "POST",
        headers: getAuthHeaders() as HeadersInit,
      },
    );

    const checkoutPayload = (await checkoutRes.json()) as Record<
      string,
      unknown
    >;

    if (!checkoutRes.ok) {
      const message =
        typeof checkoutPayload.message === "string"
          ? checkoutPayload.message
          : undefined;
      return { error: message ?? t("CheckoutSessionFailed") };
    }

    const sessionUrl = extractCheckoutUrl(checkoutPayload);
    if (!sessionUrl) {
      return { error: t("CheckoutSessionFailed") };
    }

    // Cart is cleared on the success page after payment
    return { sessionUrl, orderId };
  } catch (error) {
    console.error("Error creating order:", error);

    const raw = error instanceof Error ? error.message : "";
    if (raw.includes("Order_userId_fkey") || raw.includes("userId")) {
      return { error: t("SessionOutdated") };
    }
    if (raw.includes("productId") || raw.includes("OrderItem_productId")) {
      return { error: t("ProductNoLongerExists") };
    }

    return { error: t("CreateOrderFailed") };
  }
}
