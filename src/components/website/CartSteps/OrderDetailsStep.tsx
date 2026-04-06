import Image from 'next/image'
import noImage from '@/assets/imgs/no-image.jpg'
import { FaTrashAlt } from "react-icons/fa";
import { useCartStore } from '@/stores/cartStore';
import QtyBtns from './QtyBtns';
import { useTranslations } from 'next-intl';
import { useLocalizedValue } from '@/hooks/useLocalizedValue';

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
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Products.Product')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Products.Price')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Products.Quantity')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Products.Total')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Cart Item 1 */}
                    {cart.map((item,index) => {
                    //     console.log('item', item);
                    //    const imagePath = 
                    //     item?.type === "simple" 
                    //     ? item?.images?.featured_image 
                    //     : item?.selection?.image || noImage;
                        
                        return(
                     <tr key={`${item.id}-${JSON.stringify(item.selection)}-${index}`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-16 w-16 mx-3 relative">
                                    <Image
                                        src={item?.selection?.image||noImage}
                                        alt="Product"
                                        fill
                                        sizes="54px"
                                        priority
                                        unoptimized={process.env.NODE_ENV !== 'production'}
                                        className="rounded-md object-cover"
                                    />
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{tValue(item?.name)}</div>
                                    <div className="text-sm text-gray-500">
                                    {Object.entries(item?.selection || {})
                                        .filter(([key]) => key !== "image") // exclude the image
                                        .map(([key, value]) => `${key}: ${value}`)
                                        .join(" | ")}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item?.price}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <QtyBtns item={item} selection={item.selection}/>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            ${item?.price * item?.qty}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-red-500 hover:text-red-700">
                                <FaTrashAlt className="w-4 h-4" onClick={() => handleRemoveFromCart(item.id)}/>
                            </button>
                        </td>
                    </tr>
      
                    )})}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default OrderDetailsStep