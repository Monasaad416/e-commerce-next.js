'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Check, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

import OrderDetailsStep from '@/components/website/CartSteps/OrderDetailsStep';
import ShippingStep, { ShippingStepRef } from '@/components/website/CartSteps/ShippingStep';
import PlaceOrderStep from '@/components/website/CartSteps/PlaceOrderStep';
import OrderSummary from '@/components/website/CartSteps/OrderSummary';
import AuthModal from '@/components/website/Auth/AuthModal';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ShippingType } from '@/interfaces/ShippingType';
import { OrderResponse } from '@/interfaces/OrderType';
import { useLocaleStore } from '@/stores/localeStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { API_URLS } from '@/app/Services/Urls';
import getAuthHeaders from '@/lib/getAuthHeaders';
import { cn } from '@/lib/utils';
import PaymentStep from '@/components/website/CartSteps/PaymentStep';

const Cart = () => {
    const router = useRouter();
    const locale = useLocale();
    const isRTL = locale === 'ar';
    const searchParams = useSearchParams();
    const activeStep = parseInt(searchParams.get('step') || '1');
    const shippingRef = useRef<ShippingStepRef | null>(null);
    const [formData, setFormData] = useState<ShippingType | null>(null);
    const t = useTranslations();
    const { cart, cartId, fetchCart } = useCartStore();

    const [authOpen, setAuthOpen] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const steps = [
        { id: 1, label: t('Cart.Details') },
        { id: 2, label: t('Cart.Address') },
        { id: 3, label: t('Cart.Review') },
    ];

    const handleBack = () => {
        if (activeStep > 1) {
            if (activeStep === 2) {
                const form = document.getElementById('shipping-form') as HTMLFormElement;
                if (form) {
                    const raw = new FormData(form);
                    const data = Object.fromEntries(raw.entries()) as unknown as ShippingType;
                    setFormData((prev) => ({ ...prev, ...data }));
                }
            }
            router.push(`/${locale}/cart?step=${activeStep - 1}`);
        }
    };

    const placeOrder = async (shipping: ShippingType) => {
        // 1) Gate the request behind a real auth token — avoids the server-side
        //    { message: "Unauthenticated." } 401 when the user is a guest or
        //    the auth store hasn't hydrated yet.
        const authState = useAuthStore.getState();
        if (!authState._hasHydrated) {
            // Very rare: fetch fired before persist hydrated.
            setAuthError(t('Auth.authentication_failed'));
            return null;
        }
        if (!authState.token) {
            setAuthError(t('Auth.authentication_failed'));
            setAuthOpen(true);
            return null;
        }

        try {
            if (!cartId) {
                console.error('Cannot place order: missing cartId');
                return null;
            }

            const filteredCart = cart.filter((item) => item.is_available !== false);
            if (!filteredCart.length) {
                console.error('Cannot place order: no available cart items');
                return null;
            }

            if (filteredCart.length !== cart.length) {
                console.warn('Filtering unavailable items before placing order', {
                    originalCartLength: cart.length,
                    filteredCartLength: filteredCart.length,
                });
            }

            setPlacing(true);
            const lang = useLocaleStore.getState().lang;
            const API_URL = API_URLS.ORDER.CREATE_ORDER(lang);

            // Pass validated shipping directly — don't rely on formData state
            // (setState is async and would still be null here).
            const payload = {
                cart_id: cartId,
                cart: filteredCart,
                shipping,
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });

            // 2) Handle stale / expired token explicitly.
            if (response.status === 401) {
                useAuthStore.getState().setToken(null);
                setAuthError(t('Auth.authentication_failed'));
                setAuthOpen(true);
                return null;
            }

            if (!response.ok) {
                const text = await response.text().catch(() => null);
                let body = null;
                try {
                    body = text ? JSON.parse(text) : null;
                } catch {
                    body = text;
                }
                console.error('Create order failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    body,
                });
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: OrderResponse = await response.json();
            const orderId = data.data?.order?.id;
            if (!orderId) {
                console.error('Create order succeeded but order id is missing', data);
                return null;
            }

            // 3) Start Stripe Checkout Session (Laravel)
            const checkoutRes = await fetch(API_URLS.ORDER.CHECKOUT(lang, orderId), {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            if (checkoutRes.status === 401) {
                useAuthStore.getState().setToken(null);
                setAuthError(t('Auth.authentication_failed'));
                setAuthOpen(true);
                return null;
            }

            if (!checkoutRes.ok) {
                const text = await checkoutRes.text().catch(() => null);
                console.error('Checkout failed:', {
                    status: checkoutRes.status,
                    statusText: checkoutRes.statusText,
                    body: text,
                });
                throw new Error(`Checkout HTTP error! status: ${checkoutRes.status}`);
            }

            const checkoutData = (await checkoutRes.json()) as {
                session_url?: string;
                checkout_url?: string;
                url?: string;
                data?: {
                    session_url?: string;
                    checkout_url?: string;
                    url?: string;
                };
            };

            const sessionUrl =
                checkoutData.session_url ??
                checkoutData.checkout_url ??
                checkoutData.url ??
                checkoutData.data?.session_url ??
                checkoutData.data?.checkout_url ??
                checkoutData.data?.url;

            if (!sessionUrl) {
                console.error('Checkout succeeded but session url is missing', checkoutData);
                return null;
            }

            // Cart is cleared on the success page after payment
            return sessionUrl;
        } catch (error) {
            console.error('Error creating order:', error);
            return null;
        } finally {
            setPlacing(false);
        }
    };

    const handleNext = async () => {
        if (activeStep === 2) {
            if (!shippingRef.current) return;
            const { valid, data } = await shippingRef.current.validate();
            if (!valid || !data) {
                console.error('Validation failed');
                return;
            }
            setFormData(data);
            const sessionUrl = await placeOrder(data);
            // Only redirect on a real success — otherwise stay on step 2 so
            // the AuthModal / error can be acted on.
            if (!sessionUrl) return;
            window.location.href = sessionUrl;
            return;
        }

        if (activeStep < steps.length) {
            router.push(`/${locale}/cart?step=${activeStep + 1}`);
        }
    };

    const handleShippingSubmit = (data: ShippingType) => {
        setFormData(data);
        router.push(`/${locale}/cart?step=3`);
    };

    const progress = ((activeStep - 1) / (steps.length - 1)) * 100;
    const isEmpty = cart.length === 0 && activeStep === 1;

    return (
        <div className="min-h-[calc(100vh-4rem)] border-b border-shop_light_gray/10 bg-gradient-to-b from-shop_dark_primary via-shop_dark_primary to-shop_dark_primary/95">
            <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pb-28 lg:pt-10">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList className="text-shop_light_gray sm:flex-nowrap">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link
                                    href={`/${locale}`}
                                    className="text-sm transition-colors hover:text-shop_white"
                                >
                                    {t('Home.title')}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className={isRTL ? 'rotate-180' : ''} />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-sm font-medium text-shop_white">
                                {t('Cart.ShoppingCart')}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-shop_white sm:text-4xl">
                            {t('Cart.ShoppingCart')}
                        </h1>
                        <p className="mt-2 text-sm text-shop_light_gray/80">
                            {t('Cart.Details')} &middot; {t('Cart.Address')} &middot; {t('Cart.Review')}
                        </p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="mb-10 rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/40 px-4 py-6 shadow-lg shadow-black/20 sm:px-8">
                    <div className="relative w-full">
                        <div className="absolute top-4 left-0 right-0 h-0.5 rounded-full bg-shop_light_gray/15" />
                        <div
                            className="absolute top-4 h-0.5 rounded-full bg-shop_secondary transition-all duration-500 ease-out"
                            style={{
                                width: `${progress}%`,
                                [isRTL ? 'right' : 'left']: 0,
                            }}
                        />

                        <div className="relative flex justify-between">
                            {steps.map((step) => {
                                const isCompleted = step.id < activeStep;
                                const isActive = step.id === activeStep;
                                return (
                                    <div key={step.id} className="z-10 flex flex-col items-center gap-2">
                                        <div
                                            className={cn(
                                                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                                                isActive &&
                                                    'bg-shop_secondary text-shop_dark_primary ring-4 ring-shop_secondary/20',
                                                isCompleted &&
                                                    'bg-shop_secondary/90 text-shop_dark_primary',
                                                !isActive &&
                                                    !isCompleted &&
                                                    'border border-shop_light_gray/25 bg-shop_dark_primary text-shop_light_gray/70',
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-4 w-4" strokeWidth={3} />
                                            ) : (
                                                <span>{step.id}</span>
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                'text-xs font-medium sm:text-sm',
                                                isActive
                                                    ? 'text-shop_white'
                                                    : isCompleted
                                                      ? 'text-shop_light_gray'
                                                      : 'text-shop_light_gray/60',
                                            )}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Empty cart state */}
                {isEmpty ? (
                    <div className="mx-auto max-w-lg rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/40 px-6 py-12 text-center shadow-lg shadow-black/20 sm:py-16">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-shop_secondary/10 text-shop_secondary">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-shop_white">
                            {t('Cart.ShoppingCart')}
                        </h2>
                        <p className="mt-3 text-sm text-shop_light_gray/80">
                            {t('Cart.Details')}
                        </p>
                        <Button
                            asChild
                            className="mt-8 rounded-xl bg-shop_secondary px-6 font-semibold text-shop_dark_primary hover:bg-shop_secondary/90"
                        >
                            <Link href={`/${locale}/shop`}>{t('Shop.title')}</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Step Content */}
                        <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
                            <div
                                className={cn(
                                    'w-full rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/40 p-4 shadow-lg shadow-black/20 sm:p-6',
                                    activeStep !== 3 ? 'lg:w-2/3' : 'lg:w-full',
                                )}
                            >
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
                                {activeStep === 3 && <PaymentStep />}
                                {activeStep === 4 && <PlaceOrderStep currentStep={activeStep} />}
                            </div>

                            {activeStep !== 4 && (
                                <div className="w-full lg:w-1/3">
                                    <OrderSummary />
                                </div>
                            )}
                        </div>

                        {/* Auth error (shown when the order API rejects the token) */}
                        {authError && activeStep === 2 && (
                            <div className="mt-6 rounded-xl border border-red-500/35 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                                {authError}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        {activeStep !== 3 && (
                            <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                                <Button
                                    onClick={handleBack}
                                    variant="outline"
                                    className={cn(
                                        'rounded-xl border-shop_light_gray/25 bg-shop_dark_primary/60 px-6 text-shop_white hover:border-shop_light_gray/40 hover:bg-shop_dark_primary/80 hover:text-shop_white',
                                        activeStep <= 1 && 'invisible',
                                    )}
                                    disabled={activeStep === 1 || placing}
                                >
                                    {isRTL ? (
                                        <ChevronRight className="h-4 w-4" />
                                    ) : (
                                        <ChevronLeft className="h-4 w-4" />
                                    )}
                                    {t('Cart.Back')}
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    className="rounded-xl bg-shop_secondary px-8 font-semibold text-shop_dark_primary hover:bg-shop_secondary/90 disabled:opacity-70"
                                    disabled={activeStep > steps.length || placing}
                                >
                                    {placing
                                        ? t('Cart.PlacingOrder')
                                        : activeStep === 2
                                          ? t('Cart.PlaceOrder')
                                          : t('Cart.Continue')}
                                    {isRTL ? (
                                        <ChevronLeft className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <AuthModal
                isOpen={authOpen}
                onClose={() => {
                    setAuthOpen(false);
                    setAuthError(null);
                }}
                defaultMode="login"
            />
        </div>
    );
};

export default Cart;
