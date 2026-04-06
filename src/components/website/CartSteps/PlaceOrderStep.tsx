"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

const PlaceOrderStep = ({}: { currentStep?: number } = {}) => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="py-12 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-5 rounded-full">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-shop_dark mb-4">
          {t("Payment.Order_Review")}
        </h2>

        {/* Description */}
        <div className="space-y-3 text-gray-600 text-base leading-relaxed">
          <p>{t("Payment.Thank_you_for_your_order!")}</p>
          <p>{t("Payment.Your_order_has_been_placed_successfully")}</p>
          <p>{t("Payment.You_will_receive_a_confirmation_email_with_your_order_details")}</p>
          <p>{t("Payment.You_can_track_your_order_in_your_account")}</p>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gray-200" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Link
            href={`/${locale}/account/orders`}
            className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 transition"
          >
            {t("Payment.Go_to_My_Orders")}
          </Link>

          <Link
            href={`/${locale}/shop`}
            className="px-6 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 transition"
          >
            {t("Payment.Continue_Shopping")}
          </Link>

        </div>
      </div>
    </div>
  );
};

export default PlaceOrderStep;