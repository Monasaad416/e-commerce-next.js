"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { API_URLS } from "@/app/Services/Urls";
import { AppLoader } from "@/components/customLoader/CustomLoader";
import { IOrder } from "@/interfaces/OrderType";
import { formatMoney } from "@/lib/formatMoney";
import getAuthHeaders from "@/lib/getAuthHeaders";
import {
  asRecord,
  extractOrders,
  formatOrderDateFromOrder,
  statusClass,
} from "@/lib/orderHelpers";
import { useAuthStore } from "@/stores/authStore";

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

        const payload = await response.json();
        console.log("orders payload", payload);

        if (response.status === 401) {
          useAuthStore.getState().setToken(null);
          if (!cancelled) {
            setOrders([]);
            setError(t("Auth.authentication_failed"));
          }
          return;
        }

        if (!response.ok) {
          const message =
            asRecord(payload)?.message ??
            asRecord(payload)?.error ??
            t("Orders.LoadFailed");
          throw new Error(
            typeof message === "string" ? message : t("Orders.LoadFailed"),
          );
        }

        if (!cancelled) {
          setOrders(extractOrders(payload));
        }
      } catch (err) {
        if (!cancelled) {
          setOrders([]);
          setError(
            err instanceof Error ? err.message : t("Orders.LoadFailed"),
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
                    {formatOrderDateFromOrder(order, locale)}
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
                    <Link
                      href={`/${locale}/orders/${order.id}`}
                      className="text-shop_secondary hover:underline"
                    >
                      {t("Orders.View")}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!error && orders.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          {t("Orders.NoOrdersFound")}
        </div>
      )}
    </div>
  );
}
