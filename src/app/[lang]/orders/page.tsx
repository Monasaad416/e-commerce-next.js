"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export default function Orders() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  const { token, name } = useAuthStore();

  // fake data (replace later with API)
  const orders = [
    {
      id: "ORD-1001",
      date: "2026-04-10",
      status: "Delivered",
      total: 250,
    },
    {
      id: "ORD-1002",
      date: "2026-04-08",
      status: "Processing",
      total: 120,
    },
    {
      id: "ORD-1003",
      date: "2026-04-05",
      status: "Cancelled",
      total: 90,
    },
  ];

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-xl font-bold">{t('Auth.You_Must_Login_First')}</h1>
          <Link href={`/${locale}`} className="text-shop_secondary underline">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-400">
          {t("Orders.Orders")}
        </h1>
        <p className="text-gray-500">{t('Auth.welcome')} {name}</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white border rounded-xl overflow-hidden">

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">{t('Orders.Order_ID')}</th>
              <th className="p-4">{t('Orders.Date')}</th>
              <th className="p-4">{t('Orders.Status')}</th>
              <th className="p-4">{t('Orders.Total')}</th>
              <th className="p-4">{t('Orders.Action')}</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">

                <td className="p-4 font-medium text-gray-800">
                  {order.id}
                </td>

                <td className="p-4 text-gray-600">
                  {order.date}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-4 font-medium">
                  ${order.total}
                </td>

                <td className="p-4">
                  <button className="text-shop_secondary hover:underline">
                    View
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* Empty state (optional) */}
      {orders.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No orders found
        </div>
      )}

    </div>
  );
}
