"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { API_URLS } from "@/app/Services/Urls";
import { AppLoader } from "@/components/customLoader/CustomLoader";
import { OrderDetail } from "@/interfaces/OrderType";
import { formatMoney } from "@/lib/formatMoney";
import getAuthHeaders from "@/lib/getAuthHeaders";
import {
  asRecord,
  extractOrderDetail,
  findOrderDetailInList,
  formatAddress,
  formatOrderDateFromOrder,
  orderItemName,
  resolveParamId,
  statusClass,
} from "@/lib/orderHelpers";
import { useAuthStore } from "@/stores/authStore";

export default function OrderDetailsPage() {
  const locale = useLocale();
  const t = useTranslations();
  const params = useParams<{ id: string }>();
  const orderId = resolveParamId(params?.id);

  const { token, _hasHydrated } = useAuthStore();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!token) {
      setDetail(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!orderId) {
      setDetail(null);
      setLoading(false);
      setError(t("Orders.NotFound"));
      return;
    }

    const id = orderId;
    let cancelled = false;

    async function loadFromOrdersList(): Promise<OrderDetail | null> {
      const listRes = await fetch(API_URLS.ORDER.GET_ALL_ORDERS(locale), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (listRes.status === 401) {
        useAuthStore.getState().setToken(null);
        throw new Error(t("Auth.authentication_failed"));
      }

      const listPayload = await listRes.json();
      if (!listRes.ok) {
        const msg = asRecord(listPayload)?.message;
        throw new Error(
          typeof msg === "string" ? msg : t("Orders.LoadFailed"),
        );
      }

      return findOrderDetailInList(listPayload, id);
    }

    async function loadOrder() {
      setLoading(true);
      setError(null);

      try {
        // 1) Prefer show endpoint when Laravel has it
        const response = await fetch(API_URLS.ORDER.GET_ORDER(locale, id), {
          method: "GET",
          headers: getAuthHeaders(),
        });

        console.log("response", response);

        if (response.status === 401) {
          useAuthStore.getState().setToken(null);
          if (!cancelled) {
            setDetail(null);
            setError(t("Auth.authentication_failed"));
          }
          return;
        }

        // 2) Show route missing / not found → fall back to GET /orders list
        if (response.status === 404) {
          const fromList = await loadFromOrdersList();
          if (!fromList) throw new Error(t("Orders.NotFound"));
          if (!cancelled) setDetail(fromList);
          return;
        }

        const payload = await response.json();
        const payloadRecord = asRecord(payload);
        const apiMessage =
          typeof payloadRecord?.message === "string"
            ? payloadRecord.message
            : typeof payloadRecord?.error === "string"
              ? payloadRecord.error
              : null;

        // Laravel sometimes returns 404 body with 200, or "route could not be found"
        const routeMissing =
          typeof apiMessage === "string" &&
          /could not be found/i.test(apiMessage);

        if (!response.ok || routeMissing) {
          const fromList = await loadFromOrdersList();
          if (fromList) {
            if (!cancelled) setDetail(fromList);
            return;
          }
          throw new Error(apiMessage ?? t("Orders.NotFound"));
        }

        const parsed = extractOrderDetail(payload);
        if (!parsed) {
          const fromList = await loadFromOrdersList();
          if (fromList) {
            if (!cancelled) setDetail(fromList);
            return;
          }
          throw new Error(apiMessage ?? t("Orders.NotFound"));
        }

        if (!cancelled) setDetail(parsed);
      } catch (err) {
        if (!cancelled) {
          setDetail(null);
          setError(
            err instanceof Error ? err.message : t("Orders.LoadFailed"),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOrder();
    return () => {
      cancelled = true;
    };
  }, [_hasHydrated, token, locale, orderId, t]);

  if (!_hasHydrated || (token && loading)) {
    return <AppLoader />;
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">{t("Auth.You_Must_Login_First")}</h1>
          <Link href={`/${locale}`} className="text-shop_secondary underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const order = detail?.order;
  const items = detail?.items ?? [];
  const status = order?.status || order?.payment_status || "—";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("Orders.OrderDetails")}
            {order ? ` #${order.id}` : ""}
          </h1>
          {order && (
            <p className="text-gray-500">
              {t("Orders.OrderDate")}: {formatOrderDateFromOrder(order, locale)}
            </p>
          )}
        </div>
        <Link
          href={`/${locale}/orders`}
          className="text-shop_secondary hover:underline text-sm font-medium"
        >
          {t("Orders.BackToOrders")}
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {order && (
        <>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="bg-white border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">{t("Orders.OrderStatus")}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusClass(status)}`}
                >
                  {status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">{t("Orders.PaymentStatus")}</span>
                <span className="capitalize font-medium">
                  {order.payment_status || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">{t("Orders.ShippingStatus")}</span>
                <span className="capitalize font-medium">
                  {order.shipping_status || "—"}
                </span>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5 space-y-3">
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  {t("Orders.ShippingAddress")}
                </p>
                <p className="text-gray-800">{formatAddress(order.address)}</p>
              </div>
              {order.notes ? (
                <div>
                  <p className="text-gray-500 text-sm mb-1">{t("Orders.Notes")}</p>
                  <p className="text-gray-800">{order.notes}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-white border rounded-xl overflow-hidden mb-6">
            <div className="px-4 py-3 border-b bg-gray-50 font-medium">
              {t("Orders.Order_Items")}
            </div>
            <table className="w-full text-left">
              <thead className="border-b text-sm text-gray-500">
                <tr>
                  <th className="p-4">{t("Orders.Order_Items")}</th>
                  <th className="p-4">{t("Orders.Qty")}</th>
                  <th className="p-4">{t("Orders.Total")}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id || `${item.product_id}-${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-800">
                        {orderItemName(item)}
                      </div>
                      {item.product_variant_id != null && (
                        <div className="text-xs text-gray-500">
                          Variant #{item.product_variant_id}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{item.qty}</td>
                    <td className="p-4 font-medium">
                      {formatMoney(item.total ?? item.subtotal ?? item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">—</div>
            )}
          </div>

          <div className="bg-white border rounded-xl p-5 space-y-2 max-w-md ms-auto">
            <div className="flex justify-between text-gray-600">
              <span>{t("Orders.Subtotal")}</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t("Orders.Discount")}</span>
              <span>{formatMoney(order.discount)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t("Orders.ShippingFee")}</span>
              <span>{formatMoney(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
              <span>{t("Orders.OrderTotal")}</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
