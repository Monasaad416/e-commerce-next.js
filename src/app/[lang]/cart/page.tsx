'use client';

import { useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import OrderDetailsStep from '@/components/website/CartSteps/OrderDetailsStep';
import ShippingStep, { ShippingStepRef } from '@/components/website/CartSteps/ShippingStep';
import PaymentStep from '@/components/website/CartSteps/PaymentStep';
import PlaceOrderStep from '@/components/website/CartSteps/PlaceOrderStep';
import OrderSummary from '@/components/website/CartSteps/OrderSummary';
import { ShippingType } from '@/interfaces/ShippingType';
// import { useCartStore } from '@/stores/cartStore';
import { useTranslations, useLocale } from 'next-intl';

const Cart = () => {
    const router = useRouter();
    const locale = useLocale();
    const searchParams = useSearchParams();
    const activeStep = parseInt(searchParams.get('step') || '1');
    const shippingRef = useRef<ShippingStepRef | null>(null);
    const [formData, setFormData] = useState<ShippingType | null>(null);
    // const {removeFromCart} = useCartStore();
    const t = useTranslations();


    // const handleRemoveFromCart = (productId: string) => {
    //     removeFromCart(productId);
    // };


    const steps = [
        { id: 1, label: t("Cart.Details") },
        { id: 2, label: t("Cart.Address") },
        { id: 3, label: t("Cart.Payment") },
        { id: 4, label: t("Cart.Review") },
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
    
// Update handleNext to handle the new return type
const handleNext = async () => {
    if (activeStep === 2) {
        if (!shippingRef.current) {
            console.error('Shipping ref is not attached');
            return;
        }
        
        const { valid, data } = await shippingRef.current.validate();
        if (!valid || !data) {
            console.log('Validation failed');
            return;
        }
        
        // Save the valid data
        setFormData(data);
        console.log('formData', formData);
    }
    
    if (activeStep < steps.length) {
        router.push(`/${locale}/cart?step=${activeStep + 1}`);
    }
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
                <div className={`w-full ${activeStep != 4 ? 'md:w-2/3' : 'md:w-full'} bg-white rounded-lg shadow-sm p-6`}>
                    {activeStep === 1 && (
                        <OrderDetailsStep  currentStep={activeStep}/>
                    )}

                  {activeStep === 2 && (
                        <ShippingStep 
                            ref={shippingRef}
                            currentStep={activeStep}
                            onNext={handleShippingSubmit} 
                            formData={formData}
                        />
                    )}

                    {activeStep === 3 &&(
                        <PaymentStep currentStep={activeStep}/>
                    )}
                    {activeStep === 4 && 
                     <PlaceOrderStep currentStep={activeStep}/>
                    }
                </div>

                {activeStep != 4 && <div className="w-full md:w-1/3">
                    <OrderSummary/>
                </div>}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={handleBack}
                    className={`px-6 py-2 rounded-md ${activeStep <= 1
                            ? 'invisible'
                            : 'bg-shop_white text-shop_black hover:bg-shop_light'
                        }`}
                    disabled={activeStep === 1}
                >
                    Back
                </button>
                <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-shop_black text-white rounded-md hover:bg-shop_light transition-colors"
                    disabled={activeStep > steps.length}
                >
                    {activeStep === steps.length ? 'Place Order' : 'Continue'}
                </button>
            </div>
        </div>
    );
}


export default Cart