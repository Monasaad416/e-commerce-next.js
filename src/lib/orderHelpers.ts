import { IOrder, IOrderItem, OrderDetail } from "@/interfaces/OrderType";

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function extractOrders(payload: unknown): IOrder[] {
  const root = asRecord(payload);
  if (!root) return [];

  const data = asRecord(root.data);
  const candidates = [
    root.orders,
    data?.orders,
    data?.data,
    Array.isArray(root.data) ? root.data : null,
    Array.isArray(payload) ? payload : null,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) return value as IOrder[];
  }
  return [];
}

export function extractOrderDetail(payload: unknown): OrderDetail | null {
  const root = asRecord(payload);
  if (!root) return null;

  const data = asRecord(root.data);
  const orderCandidate =
    asRecord(root.order) ??
    asRecord(data?.order) ??
    (data && "id" in data ? data : null) ??
    (root && "id" in root && !Array.isArray(root.data) ? root : null);

  if (!orderCandidate || typeof orderCandidate.id === "undefined") {
    return null;
  }

  const order = orderCandidate as unknown as IOrder;

  const itemCandidates = [
    root.items,
    data?.items,
    data?.order_items,
    order.items,
    order.order_items,
  ];

  let items: IOrderItem[] = [];
  for (const value of itemCandidates) {
    if (Array.isArray(value)) {
      items = value as IOrderItem[];
      break;
    }
  }

  return { order, items };
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
