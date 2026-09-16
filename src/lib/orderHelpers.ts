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

  // Prefer flattening attributes before returning on id
  if ("id" in obj || "order_id" in obj) {
    return flattenOrderRecord(obj);
  }

  const nested = asRecord(obj.data);
  if (nested) return unwrapData(nested, depth + 1);

  return flattenOrderRecord(obj);
}

function looksLikeOrder(value: unknown): value is Record<string, unknown> {
  const obj = asRecord(value);
  return Boolean(obj && ("id" in obj || "order_id" in obj));
}

/** Merge JSON:API `attributes` / nested `data` / `order` onto one flat order object. */
function flattenOrderRecord(
  raw: Record<string, unknown>,
  depth = 0,
): Record<string, unknown> {
  if (depth > 4) return raw;

  let flat: Record<string, unknown> = { ...raw };

  const attrs = asRecord(raw.attributes);
  if (attrs) flat = { ...attrs, ...flat };

  const nestedOrder = asRecord(raw.order);
  if (nestedOrder) {
    flat = { ...flattenOrderRecord(nestedOrder, depth + 1), ...flat };
  }

  const data = asRecord(raw.data);
  if (
    data &&
    ("id" in data ||
      "order_id" in data ||
      "attributes" in data ||
      "total" in data ||
      "status" in data)
  ) {
    flat = { ...flattenOrderRecord(data, depth + 1), ...flat };
  }

  return flat;
}

function normalizeOrder(raw: Record<string, unknown>): IOrder {
  const flat = flattenOrderRecord(raw);
  const id = flat.id ?? flat.order_id;
  const createdAt =
    coerceDateString(flat.created_at) ||
    coerceDateString(flat.createdAt) ||
    coerceDateString(flat.date) ||
    coerceDateString(flat.order_date) ||
    coerceDateString(flat.orderDate) ||
    coerceDateString(flat.placed_at) ||
    coerceDateString(flat.placedAt) ||
    coerceDateString(flat.formatted_date) ||
    coerceDateString(flat.formattedDate) ||
    findDateDeep(flat) ||
    findAnyDateString(flat);

  return {
    ...(flat as unknown as IOrder),
    id: Number(id),
    ...(createdAt ? { created_at: createdAt } : {}),
  };
}

/** Walk object for any date-like key (Laravel Resource / nested payloads). */
function findDateDeep(
  value: unknown,
  depth = 0,
): string | undefined {
  if (depth > 3) return undefined;

  const direct = coerceDateString(value);
  if (direct && depth > 0) return direct;

  const obj = asRecord(value);
  if (!obj) return undefined;

  for (const [key, nested] of Object.entries(obj)) {
    if (
      /date|created|updated|placed|time/i.test(key) &&
      !/update_payment|status/i.test(key)
    ) {
      const found = coerceDateString(nested);
      if (found) return found;
    }
  }

  for (const key of ["attributes", "order", "data", "meta", "timestamps"]) {
    if (key in obj) {
      const found = findDateDeep(obj[key], depth + 1);
      if (found) return found;
    }
  }

  return undefined;
}

/** Last resort: find any YYYY-MM-DD (or similar) string in the object tree. */
function findAnyDateString(value: unknown, depth = 0): string | undefined {
  if (depth > 4) return undefined;

  if (typeof value === "string") {
    if (/\d{4}-\d{2}-\d{2}/.test(value) || /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(value)) {
      return value.trim();
    }
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const entry of value.slice(0, 8)) {
      const found = findAnyDateString(entry, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  const obj = asRecord(value);
  if (!obj) return undefined;

  for (const [key, nested] of Object.entries(obj)) {
    if (/date|created|updated|placed|time/i.test(key)) {
      const found = findAnyDateString(nested, depth + 1);
      if (found) return found;
    }
  }

  for (const nested of Object.values(obj)) {
    if (asRecord(nested) || Array.isArray(nested) || typeof nested === "string") {
      const found = findAnyDateString(nested, depth + 1);
      if (found) return found;
    }
  }

  return undefined;
}

/** Accept ISO strings, timestamps, or Laravel/Carbon objects. */
function coerceDateString(value: unknown): string | undefined {
  if (value == null) return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "—" || trimmed === "-" || trimmed === "null") {
      return undefined;
    }
    // Numeric string timestamp
    if (/^\d{10,13}$/.test(trimmed)) {
      const n = Number(trimmed);
      const d = new Date(trimmed.length >= 13 ? n : n * 1000);
      return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
    }
    return trimmed;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value > 1e12 ? value : value * 1000);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  const obj = asRecord(value);
  if (!obj) return undefined;

  // Carbon / DateTime serialized to array/object
  if (typeof obj.date === "string" && obj.date.trim()) {
    return obj.date.trim().replace(" ", "T");
  }
  if (typeof obj.$date === "string" && obj.$date.trim()) return obj.$date.trim();
  if (typeof obj.datetime === "string" && obj.datetime.trim()) {
    return obj.datetime.trim().replace(" ", "T");
  }
  // { carbon: true, timestamp: 1710000000 } style
  if (typeof obj.timestamp === "number") {
    return coerceDateString(obj.timestamp);
  }
  return undefined;
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

  const outer = asRecord(root.data);
  // Laravel paginate + Resource::collection inside response()->json():
  // { success, data: { data: [ orders ], links, meta } }
  // Correct additional() style:
  // { success, data: [ orders ], links, meta }
  const candidates = [
    root.orders,
    outer?.orders,
    // paginated resource collection (most common with their controller)
    outer && Array.isArray(outer.data) ? outer.data : null,
    Array.isArray(root.data) ? root.data : null,
    // single-wrapped list
    coerceArray(outer?.data),
    Array.isArray(payload) ? payload : null,
  ];

  for (const value of candidates) {
    const arr = coerceArray(value) ?? (Array.isArray(value) ? value : null);
    if (!arr?.length) continue;

    // Skip if this "array" is not orders (e.g. accidental meta)
    const mapped = arr
      .map((row) => {
        const record = unwrapData(row) ?? asRecord(row);
        if (!record) return null;
        return normalizeOrder(record);
      })
      .filter((row): row is IOrder => row != null && Number.isFinite(row.id));

    if (mapped.length) return mapped;
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

  let order = normalizeOrder(orderCandidate);
  if (!Number.isFinite(order.id)) return null;

  // Date sometimes lives on the wrapper, not inside OrderResource
  if (!getOrderDateValue(order)) {
    const outerDate =
      findDateDeep(dataLayer) ||
      findDateDeep(root) ||
      findDateDeep(unwrapped);
    if (outerDate) {
      order = { ...order, created_at: outerDate };
    }
  }

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
  let order = match;
  if (!getOrderDateValue(order)) {
    const outerDate = findDateDeep(asRecord(payload)) || findDateDeep(raw);
    if (outerDate) order = { ...order, created_at: outerDate };
  }
  return { order, items };
}

export function getOrderDateValue(order: Partial<IOrder> | null | undefined) {
  if (!order) return undefined;
  const raw = order as Record<string, unknown>;

  const candidates = [
    order.created_at,
    raw.date,
    raw.order_date,
    raw.orderDate,
    raw.createdAt,
    raw.placed_at,
    raw.placedAt,
    order.updated_at,
    raw.updatedAt,
  ];

  for (const value of candidates) {
    const coerced = coerceDateString(value);
    if (coerced) return coerced;
  }

  return findDateDeep(raw);
}

export function formatOrderDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  // "Y-m-d H:i:s" from Laravel parses fine in most engines; replace space for Safari
  const normalized = value.includes(" ") && !value.includes("T")
    ? value.replace(" ", "T")
    : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    // Try d/m/Y or d-m-Y
    const m = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
    if (m) {
      const day = Number(m[1]);
      const month = Number(m[2]);
      const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
      const parsed = new Date(year, month - 1, day);
      if (!Number.isNaN(parsed.getTime())) {
        return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(parsed);
      }
    }
    return value;
  }
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
