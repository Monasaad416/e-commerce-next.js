import { useCartStore } from '@/stores/cartStore';

const OrderSummary = () => {
  const { cart } = useCartStore();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
      
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-5">
        Order Summary
      </h3>

      {/* Items Count */}
      <p className="text-sm text-gray-500 mb-4">
        {cart.length} items
      </p>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4"></div>

      {/* Subtotal */}
      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <span>Subtotal</span>
        <span className="font-medium text-gray-900">
          ${subtotal.toFixed(2)}
        </span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <span>Shipping</span>
        <span className="text-green-600 font-medium">
          Free
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Total */}
      <div className="flex justify-between text-base font-semibold text-gray-900 mb-6">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      {/* Button */}
      <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition">
        Proceed to Checkout
      </button>

    </div>
  );
};

export default OrderSummary;