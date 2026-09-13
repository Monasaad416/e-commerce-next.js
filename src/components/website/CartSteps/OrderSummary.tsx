import { useMemo } from 'react';
import { ShieldCheck, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCartStore } from '@/stores/cartStore';
import { formatMoney } from '@/lib/formatMoney';
import { getCartUnitPrice } from '@/lib/cartPricing';

const OrderSummary = () => {
    const cart = useCartStore((s) => s.cart);
    const t = useTranslations();

    // Derive totals from `cart` so +/- reflects instantly for guests and logged-in
    // users alike (the store's `subtotal` is only refreshed after a backend sync).
    const subtotal = useMemo(
        () =>
            cart
                .filter((i) => i.is_available !== false)
                .reduce(
                    (sum, i) => sum + getCartUnitPrice(i) * Number(i.qty ?? 0),
                    0,
                ),
        [cart],
    );

    const shipping = 0;
    const total = subtotal + shipping;
    const availableItemsCount = cart.filter((i) => i.is_available !== false).length;

    return (
        <aside className="sticky top-24 rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/50 p-6 shadow-lg shadow-black/20">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-shop_white">
                    {t('Cart.Review')}
                </h3>
                <span className="rounded-full border border-shop_secondary/30 bg-shop_secondary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-shop_secondary">
                    {availableItemsCount}/{cart.length}
                </span>
            </div>

            <p className="mb-5 text-xs text-shop_light_gray/70">
                {availableItemsCount} / {cart.length} items available
            </p>

            <div className="space-y-3 border-t border-shop_light_gray/10 pt-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-shop_light_gray/85">Subtotal</span>
                    <span className="font-medium text-shop_white">
                        {formatMoney(subtotal)}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-shop_light_gray/85">Shipping</span>
                    <span className="font-semibold text-emerald-300">Free</span>
                </div>
            </div>

            <div className="my-5 h-px bg-shop_light_gray/15" />

            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-shop_light_gray/80">
                    Total
                </span>
                <span className="text-2xl font-bold text-shop_secondary">
                    {formatMoney(total)}
                </span>
            </div>

            <ul className="mt-6 space-y-2 rounded-xl border border-shop_light_gray/10 bg-shop_dark_primary/40 p-3 text-xs text-shop_light_gray/80">
                <li className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 shrink-0 text-shop_secondary" />
                    <span>{t('Products.TrustFreeDelivery')}</span>
                </li>
                <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-shop_secondary" />
                    <span>{t('Products.TrustSecurePayment')}</span>
                </li>
            </ul>
        </aside>
    );
};

export default OrderSummary;
