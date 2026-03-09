import { useTranslations } from 'next-intl'
import React from 'react'

const PaymentStep = ({currentStep}: {currentStep: number}) => {
  const t = useTranslations();
  return (
    <div className="py-4">
        <h2 className="text-2xl font-bold mb-6 text-shop_dark">Payment Information</h2>
        <div className="max-w-2xl space-y-5">
            {t("Payment.Cash_On_Delivery")}
        </div>
    </div>
  )
}

export default PaymentStep