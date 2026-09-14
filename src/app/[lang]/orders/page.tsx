"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { API_URLS } from "@/app/Services/Urls";
import { AppLoader } from "@/components/customLoader/CustomLoader";
import { IOrder, OrdersResponse } from "@/interfaces/OrderType";
import { formatMoney } from "@/lib/formatMoney";
import getAuthHeaders from "@/lib/getAuthHeaders";
import { useAuthStore } from "@/stores/authStore";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function extractOrders(payload: unknown): IOrder[] {
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

function formatOrderDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function statusClass(status: string) {
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

export default function Orders() {
  const locale = useLocale();
  const t = useTranslations();
  const { token, name, _hasHydrated } = useAuthStore();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!token) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URLS.ORDER.GET_ALL_ORDERS(locale), {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          useAuthStore.getState().setToken(null);
          if (!cancelled) {
            setOrders([]);
            setError(t("Auth.authentication_failed"));
          }
          return;
        }

        const payload = (await response.json()) as OrdersResponse | unknown;

        if (!response.ok) {
          const message =
            asRecord(payload)?.message ??
            asRecord(payload)?.error ??
            t("Auth.authentication_failed");
          throw new Error(
            typeof message === "string" ? message : "Failed to load orders",
          );
        }

        if (!cancelled) {
          setOrders(extractOrders(payload));
        }
      } catch (err) {
        if (!cancelled) {
          setOrders([]);
          setError(
            err instanceof Error ? err.message : "Failed to load orders",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [_hasHydrated, token, locale, t]);

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t("Orders.Orders")}</h1>
        <p className="text-gray-500">
          {t("Auth.welcome")} {name}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">{t("Orders.Order_ID")}</th>
              <th className="p-4">{t("Orders.Date")}</th>
              <th className="p-4">{t("Orders.Status")}</th>
              <th className="p-4">{t("Orders.Total")}</th>
              <th className="p-4">{t("Orders.Action")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const status = order.status || order.payment_status || "—";
              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">#{order.id}</td>
                  <td className="p-4 text-gray-600">
                    {formatOrderDate(order.created_at, locale)}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusClass(status)}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{formatMoney(order.total)}</td>
                  <td className="p-4">
                    <span className="text-shop_secondary/70 text-sm">
                      {t("Orders.OrderDetails")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!error && orders.length === 0 && (
        <div className="text-center py-10 text-gray-500">No orders found</div>
      )}
    </div>
  );
}
