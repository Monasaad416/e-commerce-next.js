import Image from 'next/image'
import noImage from '@/assets/imgs/no-image.jpg'
import { FaTrashAlt } from "react-icons/fa";
import { useCartStore } from '@/stores/cartStore';
import QtyBtns from './QtyBtns';
import { useTranslations } from 'next-intl';
import { useLocalizedValue } from '@/hooks/useLocalizedValue';
import { resolveImageUrl } from '@/lib/media';

const OrderDetailsStep = ({}: { currentStep?: number } = {}) => {
    const {cart,removeFromCart} = useCartStore();
    const handleRemoveFromCart = (cartItemId: string) => {
        removeFromCart(cartItemId);
    };
    const t = useTranslations();
    const tValue = useLocalizedValue();

  return (
    <div className="py-4">
        <h2 className="text-2xl font-bold mb-6 text-shop_dark">Your Cart</h2>
        {/* Cart Items Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="min-w-full">
                
                {/* Header */}
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    {t('Products.Product')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    {t('Products.Price')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    {t('Products.Quantity')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    {t('Products.Total')}
                    </th>
                    <th className="px-6 py-4"></th>
                </tr>
                </thead>

                {/* Body */}
                <tbody className="divide-y divide-gray-100">
                {cart.map((item, index) => {
                    console.log(item)
                    let variantImage: string | undefined;
                    variantImage = resolveImageUrl(
                        item?.selection?.image ? item.selection?.image : noImage.src
                    );

                    return (
                        <tr
                            key={`${item.id}-${JSON.stringify(item.selection)}-${index}`}
                            className="hover:bg-gray-50 transition"
                        >
                            {/* Product */}
                            <td className="px-6 py-6">
                                <div className="flex items-center gap-4">

                                    {/* Image */}
                                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                                        <Image
                                            src={variantImage}
                                            alt="Product"
                                            fill
                                            sizes="50px"
                                            className="object-cover"
                                            loading="eager"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {tValue(item?.name)}
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {Object.entries(item?.selection || {})
                                                .filter(([key]) => key !== "image" && key !== "product_variant_id")
                                                .map(([key, value]) => `${key}: ${value}`)
                                                .join(" • ")}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                                ${item?.price}
                            </td>

                            {/* Quantity */}
                            <td className="px-6 py-5">
                                <QtyBtns item={item} selection={item.selection || {}} />
                            </td>

                            {/* Total */}
                            <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                                ${item?.price * item?.qty}
                            </td>

                            {/* Remove */}
                            <td className="px-6 py-5 text-right">
                                <button
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    className="p-2 rounded-md hover:bg-red-50 transition group"
                                >
                                    <FaTrashAlt className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default OrderDetailsStep