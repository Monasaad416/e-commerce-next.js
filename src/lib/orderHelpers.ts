import { IOrder, IOrderItem, OrderDetail } from "@/interfaces/OrderType";

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Unwrap Laravel JsonResource double-nesting: { data: { data: order } }. */
function unwrapData(value: unknown, depth = 0): Record<string, unknown> | null {
  const obj = asRecord(value);
  if (!obj || depth > 4) return obj;

  if ("id" in obj) return obj;

  const nested = asRecord(obj.data);
  if (nested) return unwrapData(nested, depth + 1);

  return obj;
}

function looksLikeOrder(value: unknown): value is Record<string, unknown> {
  const obj = asRecord(value);
  return Boolean(obj && ("id" in obj || "order_id" in obj));
}

function normalizeOrder(raw: Record<string, unknown>): IOrder {
  const id = raw.id ?? raw.order_id;
  return {
    ...(raw as unknown as IOrder),
    id: Number(id),
  };
}

function extractItems(...candidates: unknown[]): IOrderItem[] {
  for (const value of candidates) {
    if (!Array.isArray(value)) continue;
    return value
      .map((item) => unwrapData(item) ?? asRecord(item))
      .filter(Boolean)
      .map((item) => item as unknown as IOrderItem);
  }
  return [];
}

export function extractOrders(payload: unknown): IOrder[] {
  const root = asRecord(payload);
  if (!root) return [];

  const data = unwrapData(root.data) ?? asRecord(root.data);
  const candidates = [
    root.orders,
    data?.orders,
    asRecord(root.data)?.orders,
    asRecord(root.data)?.data,
    data && Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown }).data
      : null,
    Array.isArray(root.data) ? root.data : null,
    Array.isArray(payload) ? payload : null,
  ];

  for (const value of candidates) {
    if (!Array.isArray(value)) continue;
    return value
      .map((row) => unwrapData(row) ?? asRecord(row))
      .filter(looksLikeOrder)
      .map((row) => normalizeOrder(row!));
  }

  return [];
}

/**
 * Handles:
 * - { success, data: OrderResource } → often { data: { data: order } }
 * - { data: { order, items } }
 * - { order, items }
 */
export function extractOrderDetail(payload: unknown): OrderDetail | null {
  const root = asRecord(payload);
  if (!root) return null;

  const dataLayer = asRecord(root.data);
  const unwrapped = unwrapData(root.data) ?? unwrapData(root.order) ?? null;

  const orderCandidate =
    asRecord(root.order) ??
    asRecord(dataLayer?.order) ??
    (looksLikeOrder(unwrapped) ? unwrapped : null) ??
    (looksLikeOrder(dataLayer) ? dataLayer : null) ??
    (looksLikeOrder(root) ? root : null);

  if (!orderCandidate) return null;

  const order = normalizeOrder(orderCandidate);
  if (!Number.isFinite(order.id)) return null;

  const items = extractItems(
    root.items,
    dataLayer?.items,
    dataLayer?.order_items,
    unwrapped?.items,
    unwrapped?.order_items,
    order.items,
    order.order_items,
    // Resource may nest relations under data
    asRecord(dataLayer?.data)?.items,
    asRecord(dataLayer?.data)?.order_items,
  );

  return { order, items };
}

export function getOrderDateValue(order: Partial<IOrder> | null | undefined) {
  if (!order) return undefined;
  const raw = order as Record<string, unknown>;
  const candidates = [
    order.created_at,
    raw.date,
    raw.order_date,
    raw.createdAt,
    order.updated_at,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

export function formatOrderDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatOrderDateFromOrder(
  order: Partial<IOrder> | null | undefined,
  locale: string,
) {
  return formatOrderDate(getOrderDateValue(order), locale);
}

export function statusClass(status: string) {
  const key = status.trim().toLowerCase();
  if (
    key === "delivered" ||
    key === "completed" ||
    key === "paid" ||
    key === "success"
  ) {
    return "bg-green-100 text-green-700";
  }
  if (
    key === "processing" ||
    key === "pending" ||
    key === "shipped" ||
    key === "unpaid"
  ) {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-red-100 text-red-700";
}

export function orderItemName(item: IOrderItem) {
  return (
    item.name ||
    item.product?.name ||
    (item.product_id ? `#${item.product_id}` : "Item")
  );
}

export function formatAddress(address: unknown): string {
  if (typeof address === "string" && address.trim()) return address;
  const obj = asRecord(address);
  if (!obj) return "—";

  const parts = [
    obj.address,
    obj.street,
    obj.city,
    obj.state,
    obj.zip,
    obj.zip_code,
    obj.zipCode,
    obj.country,
    obj.phone,
  ]
    .filter((v) => typeof v === "string" && v.trim())
    .map(String);

  return parts.length ? parts.join(", ") : "—";
}

export function resolveParamId(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}
