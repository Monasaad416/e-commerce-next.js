'use client';

import { useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderDetailsStep from '@/components/website/CartSteps/OrderDetailsStep';
import ShippingStep, { ShippingStepRef } from '@/components/website/CartSteps/ShippingStep';
import PlaceOrderStep from '@/components/website/CartSteps/PlaceOrderStep';
import OrderSummary from '@/components/website/CartSteps/OrderSummary';
import { ShippingType } from '@/interfaces/ShippingType';
// import { useCartStore } from '@/stores/cartStore';
import { useTranslations, useLocale } from 'next-intl';
import { useLocaleStore } from '@/stores/localeStore';
import { API_URLS } from '@/app/Services/Urls';
import { OrderResponse } from '@/interfaces/OrderType';
import { useCartStore } from '@/stores/cartStore';
import getAuthHeaders from '@/lib/getAuthHeaders';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';


const Cart = () => {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const activeStep = parseInt(searchParams.get('step') || '1');
    const shippingRef = useRef<ShippingStepRef | null>(null);
    const [formData, setFormData] = useState<ShippingType | null>(null);
    // const {removeFromCart} = useCartStore();
    const t = useTranslations();
    const { cart, clearCart } = useCartStore();




    // const handleRemoveFromCart = (productId: string) => {
    //     removeFromCart(productId);
    // };


    const steps = [
        { id: 1, label: t("Cart.Details") },
        { id: 2, label: t("Cart.Address") },
        { id: 3, label: t("Cart.Review") },
    ];

    const handleBack = () => {
        if (activeStep > 1) {
            // Save form data before navigating back
            if (activeStep === 2) {
                const form = document.getElementById('shipping-form') as HTMLFormElement;
                if (form) {
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries()) as unknown as ShippingType;
                    setFormData(prev => ({ ...prev, ...data }));
                }
            }
            router.push(`/${locale}/cart?step=${activeStep - 1}`);
        }
    };

    const placeOrder = async () => {
        try {
            const lang = useLocaleStore.getState().lang;
            const API_URL = API_URLS.ORDER.CREATE_ORDER(lang);

            // // Get shipping data here, not at component level
            // const shippingData = formData || shippingRef.current?.data;


            const response = await fetch(API_URL, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    cart: cart,
                    shipping: formData,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: OrderResponse = await response.json();
            // console.log('data',data);
            // console.log('cart',cart)
            clearCart();

            return data.data;
        } catch (error) {
            console.error('Error creating order:', error);
            return null;
        }
    };

    // Update handleNext to handle the new return type
const handleNext = async () => {
    if (activeStep === 2) {
        
        if (!shippingRef.current) {
            return;
        }
        
        const { valid, data } = await shippingRef.current.validate();
        
        if (!valid || !data) {
            console.error('Validation failed');
            return;
        }
        
        // Save valid data to form state
        setFormData(data);
        
        // Only proceed to order if validation passes
        if (valid && data) {
            await placeOrder();
        } else {
            console.log('Validation failed, not placing order');
        }
    }

    if (activeStep < steps.length) {
        router.push(`/${locale}/cart?step=${activeStep + 1}`);
    }
};

    const handlePlaceOrder = async () => {
        await placeOrder();
        // Then navigate to confirmation or orders page
        // router.push(`/${locale}/account/orders`);
    };
    const handleShippingSubmit = (data: ShippingType) => {
        setFormData(data);
        router.push(`/${locale}/cart?step=3`);
    };


    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="w-full mb-12">
                <h1 className="text-3xl font-bold text-shop_dark mb-8">{t("Cart.ShoppingCart")}</h1>

                {/* Stepper */}
                <div className="relative w-full">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 "></div>
                    <div
                        className="absolute top-4 left-0 h-0.5 bg-shop_dark transition-all duration-300 ease-in-out"
                        style={{
                            width: `${((activeStep - 1) / (steps.length - 1)) * 100}%`
                        }}
                    ></div>

                    <div className="flex justify-between">
                        {steps.map((step) => {
                            const isCompleted = step.id < activeStep;
                            const isActive = step.id === activeStep;

                            return (
                                <div key={step.id} className="flex flex-col items-center z-10">
                                    <div className={`
                                        w-8 h-8 rounded-full flex items-center justify-center
                                        ${isActive ? 'bg-shop_medium_primary text-shop_white' : ''}
                                        ${isCompleted ? 'bg-shop_light_primary text-shop_black' : 'bg-white border-2 border-shop_light'}
                                        ${isCompleted ? 'ring-2 ring-shop_dark ring-offset-2' : ''}
                                        transition-colors duration-300
                                    `}>
                                        {isCompleted ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className={`${isActive ? ' text-shop_black font-bold' : 'text-shop_light_gray font-bold'}`}>{step.id}</span>
                                        )}
                                    </div>
                                    <span className={`
                                        mt-2 text-sm font-medium
                                        ${isActive || isCompleted ? 'text-shop_dark' : 'text-gray-500'}
                                    `}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex flex-col md:flex-row w-full gap-6">
                {/* Cart Items - Full width on mobile, 2/3 on larger screens */}
                <div className={`w-full ${activeStep != 3 ? 'md:w-2/3' : 'md:w-full'} bg-white rounded-lg shadow-sm p-6`}>
                    {activeStep === 1 && (
                        <OrderDetailsStep currentStep={activeStep} />
                    )}

                    {activeStep === 2 && (
                        <ShippingStep
                            ref={shippingRef}
                            currentStep={activeStep}
                            onNext={handleShippingSubmit}
                            formData={formData}
                        />
                    )}
                    {activeStep === 3 &&
                        <PlaceOrderStep currentStep={activeStep} />
                    }
                </div>

                {activeStep != 3 && <div className="w-full md:w-1/3">
                    <OrderSummary />
                </div>}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <Button
                    onClick={handleBack}
                    className={`px-6 py-2 rounded-md ${activeStep <= 1
                        ? 'invisible'
                        : 'bg-shop_white text-shop_black hover:bg-shop_light'
                        }`}
                    disabled={activeStep === 1}
                >
                    {t('Cart.Back')}
                </Button>
                <Button
                    onClick={handleNext}
                    className="px-6 py-2 bg-shop_black text-white rounded-md hover:bg-shop_light transition-colors"
                    disabled={activeStep > steps.length}
                >
                    {activeStep === 2 ? t('Cart.PlaceOrder') : t('Cart.Continue')}
                </Button>
            </div>
        </div>
    );
}


export default Cart