import { useCartStore } from '@/stores/cartStore';

const OrderSummary = () => {
    const {cart} = useCartStore();
    const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
    const shipping = 5;
    const tax = 1;
    const total = subtotal > 0 ? subtotal + shipping + tax : 0;
  return (
    <div>
        {/* Order Summary - Full width on mobile, 1/3 on larger screens */}
        <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-bold mb-4 text-shop_dark">Order Summary</h2>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="font-medium">${subtotal > 0 ? shipping : 0}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span className="font-medium">${subtotal > 0 ? tax : 0}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between text-lg font-bold text-shop_dark">
                        <span>Total</span>
                        <span>${total}</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
  )
}

export default OrderSummary