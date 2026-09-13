import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import noImage from '@/assets/imgs/no-image.jpg';
import { useCartStore } from '@/stores/cartStore';
import { useLocalizedValue } from '@/hooks/useLocalizedValue';
import { resolveImageUrl } from '@/lib/media';
import { cn } from '@/lib/utils';
import QtyBtns from './QtyBtns';
import { formatMoney } from '@/lib/formatMoney';
import {
    getCartLineTotal,
    getCartUnitPrice,
    hasCartDiscount,
} from '@/lib/cartPricing';

const OrderDetailsStep = ({}: { currentStep?: number } = {}) => {
    const { cart, removeFromCart } = useCartStore();
    const t = useTranslations();
    const tValue = useLocalizedValue();

    const handleRemoveFromCart = (cartItemId: string, selection?: object) => {
        removeFromCart(cartItemId, selection);
    };

    return (
        <div className="py-2">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-shop_white sm:text-2xl">
                    {t('Cart.ShoppingCart')}
                </h2>
                <span className="rounded-full border border-shop_light_gray/20 bg-shop_dark_primary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-shop_light_gray">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Desktop: table-like grid. Mobile: cards. */}
            <div className="overflow-hidden rounded-2xl border border-shop_light_gray/15 bg-shop_dark_primary/30">
                {/* Header row - desktop only */}
                <div className="hidden grid-cols-[1.8fr_0.7fr_0.9fr_0.7fr_auto] items-center gap-4 border-b border-shop_light_gray/10 bg-shop_dark_primary/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-shop_light_gray/75 md:grid">
                    <span>{t('Products.Product')}</span>
                    <span>{t('Products.Price')}</span>
                    <span>{t('Products.Quantity')}</span>
                    <span>{t('Products.Total')}</span>
                    <span className="sr-only">Remove</span>
                </div>

                <ul className="divide-y divide-shop_light_gray/10">
                    {cart.map((item, index) => {
                        const variantImage = resolveImageUrl(
                        item?.selection?.image || item?.image || noImage.src,
                        );
                        const unavailable = item?.is_available === false;
                        const unitPrice = getCartUnitPrice(item);
                        const lineTotal = getCartLineTotal(item);
                        const onSale = hasCartDiscount(item);

                        const selectionLine = Object.entries(item?.selection || {})
                            .filter(([key]) => key !== 'image' && key !== 'product_variant_id')
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' • ');

                        return (
                            <li
                                key={`${item.id}-${JSON.stringify(item.selection)}-${index}`}
                                className={cn(
                                    'grid grid-cols-1 gap-4 p-4 transition-colors hover:bg-shop_dark_primary/40 sm:p-5',
                                    'md:grid-cols-[1.8fr_0.7fr_0.9fr_0.7fr_auto] md:items-center',
                                    unavailable && 'opacity-80',
                                )}
                            >
                                {/* Product cell */}
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-shop_light_gray/15 bg-shop_dark_primary/60">
                                        <Image
                                            src={variantImage}
                                            alt={tValue(item?.name) || item?.id || 'Product'}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                            loading="eager"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-shop_white sm:text-base">
                                            {tValue(item?.name) || item?.id}
                                        </p>
                                        {selectionLine && (
                                            <p className="mt-1 line-clamp-2 text-xs text-shop_light_gray/70">
                                                {selectionLine}
                                            </p>
                                        )}
                                        {unavailable ? (
                                            <p className="mt-2 inline-flex rounded-full border border-red-500/35 bg-red-950/40 px-2.5 py-0.5 text-[11px] font-medium text-red-100">
                                                {item?.availability_message || t('Products.OutStock')}
                                                {item?.available_qty != null
                                                    ? ` (Available: ${item.available_qty})`
                                                    : ''}
                                            </p>
                                        ) : null}

                                        {/* Mobile-only price + total */}
                                        <div className="mt-3 flex items-center gap-4 md:hidden">
                                            <span className="text-xs text-shop_light_gray/70">
                                                {onSale ? (
                                                    <>
                                                        <span className="me-1.5 line-through opacity-60">
                                                            {formatMoney(item.price)}
                                                        </span>
                                                        {formatMoney(unitPrice)}
                                                    </>
                                                ) : (
                                                    formatMoney(unitPrice)
                                                )}
                                            </span>
                                            <span className="text-sm font-semibold text-shop_secondary">
                                                {formatMoney(lineTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price cell - desktop */}
                                <div className="hidden text-sm font-medium text-shop_light_gray md:block">
                                    {onSale ? (
                                        <div className="space-y-0.5">
                                            <p className="text-xs line-through opacity-60">
                                                {formatMoney(item.price)}
                                            </p>
                                            <p>{formatMoney(unitPrice)}</p>
                                        </div>
                                    ) : (
                                        formatMoney(unitPrice)
                                    )}
                                </div>

                                {/* Qty cell */}
                                <div className="flex items-center md:block">
                                    {unavailable ? (
                                        <span className="text-xs font-medium text-red-300">
                                            {t('Products.OutStock')}
                                        </span>
                                    ) : (
                                        <QtyBtns item={item} selection={item.selection || {}} />
                                    )}
                                </div>

                                {/* Total cell - desktop */}
                                <div className="hidden text-sm font-semibold text-shop_secondary md:block">
                                    {formatMoney(lineTotal)}
                                </div>

                                {/* Remove */}
                                <div className="flex justify-end md:justify-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveFromCart(item.id, item.selection)
                                        }
                                        className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-shop_light_gray/15 bg-shop_dark_primary/50 text-shop_light_gray/70 transition-colors hover:border-red-500/40 hover:bg-red-950/40 hover:text-red-300"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default OrderDetailsStep;
