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

/** Arrays, or Laravel Resource collections: { data: [...] }. */
function coerceArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  const obj = asRecord(value);
  if (obj && Array.isArray(obj.data)) return obj.data;
  return null;
}

function looksLikeOrderItem(value: unknown): boolean {
  const obj = unwrapData(value) ?? asRecord(value);
  if (!obj) return false;
  return (
    "product_id" in obj ||
    "productId" in obj ||
    "order_id" in obj ||
    ("qty" in obj && ("price" in obj || "total" in obj || "subtotal" in obj)) ||
    ("quantity" in obj && ("price" in obj || "total" in obj))
  );
}

function localizeName(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value;
  const obj = asRecord(value);
  if (!obj) return undefined;
  const en = obj.en;
  const ar = obj.ar;
  if (typeof en === "string" && en.trim()) return en;
  if (typeof ar === "string" && ar.trim()) return ar;
  return undefined;
}

function normalizeOrderItem(raw: Record<string, unknown>): IOrderItem {
  const product = asRecord(raw.product);
  const name =
    localizeName(raw.name) ||
    localizeName(raw.product_name) ||
    localizeName(raw.productName) ||
    localizeName(product?.name) ||
    localizeName(product?.title);

  return {
    id: Number(raw.id ?? 0),
    order_id: Number(raw.order_id ?? raw.orderId ?? 0),
    product_id: Number(raw.product_id ?? raw.productId ?? product?.id ?? 0),
    product_variant_id:
      raw.product_variant_id != null
        ? Number(raw.product_variant_id)
        : raw.productVariantId != null
          ? Number(raw.productVariantId)
          : undefined,
    name,
    image:
      (typeof raw.image === "string" && raw.image) ||
      (typeof product?.image === "string" && product.image) ||
      undefined,
    qty: Number(raw.qty ?? raw.quantity ?? 1),
    price: Number(raw.price ?? 0),
    discount_price: Number(raw.discount_price ?? raw.discountPrice ?? 0),
    subtotal: Number(raw.subtotal ?? 0),
    total: Number(raw.total ?? raw.subtotal ?? raw.price ?? 0),
    product: product
      ? {
          id: product.id != null ? Number(product.id) : undefined,
          name: localizeName(product.name),
          image: typeof product.image === "string" ? product.image : undefined,
          slug: typeof product.slug === "string" ? product.slug : undefined,
        }
      : undefined,
  };
}

function extractItems(...candidates: unknown[]): IOrderItem[] {
  for (const value of candidates) {
    const arr = coerceArray(value);
    if (!arr?.length) continue;

    const mapped = arr
      .map((item) => unwrapData(item) ?? asRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map(normalizeOrderItem);

    if (mapped.length) return mapped;
  }
  return [];
}

/** Pull items from common Laravel relation / resource keys on an order object. */
function collectItemsFromOrder(order: Record<string, unknown>): IOrderItem[] {
  const keys = [
    "items",
    "order_items",
    "orderItems",
    "products",
    "lines",
    "order_lines",
    "details",
    "orderDetails",
  ];

  for (const key of keys) {
    const found = extractItems(order[key]);
    if (found.length) return found;
  }

  // Last resort: any nested array/resource that looks like line items
  for (const value of Object.values(order)) {
    const arr = coerceArray(value);
    if (!arr?.length) continue;
    if (arr.some(looksLikeOrderItem)) {
      const found = extractItems(arr);
      if (found.length) return found;
    }
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
    const arr = coerceArray(value);
    if (!arr) continue;
    return arr
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
 * - items as Resource collection: { data: [ ... ] }
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
    root.order_items,
    dataLayer?.items,
    dataLayer?.order_items,
    dataLayer?.orderItems,
    unwrapped?.items,
    unwrapped?.order_items,
    unwrapped?.orderItems,
    asRecord(dataLayer?.data)?.items,
    asRecord(dataLayer?.data)?.order_items,
  );

  const resolvedItems =
    items.length > 0 ? items : collectItemsFromOrder(orderCandidate);

  return { order, items: resolvedItems };
}

/** Find one order in a list payload (fallback when show route is missing). */
export function findOrderDetailInList(
  payload: unknown,
  orderId: string | number,
): OrderDetail | null {
  const target = String(orderId);
  const orders = extractOrders(payload);
  const match = orders.find(
    (order) =>
      String(order.id) === target ||
      String((order as { order_id?: number }).order_id ?? "") === target,
  );
  if (!match) return null;

  const raw = match as unknown as Record<string, unknown>;
  const items = collectItemsFromOrder(raw);
  return { order: match, items };
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
