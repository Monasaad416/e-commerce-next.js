import { HiOutlineShoppingCart } from "react-icons/hi2";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useCartStore } from "@/stores/cartStore";

const CartIcon = () => {
  const locale = useLocale();
  const { cart } = useCartStore();
  
  // Calculate total items in cart (sum of all quantities)
  const totalItems = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <Link
      href={`/${locale}/cart`}
      className="relative inline-flex items-center justify-center w-10 h-10"
    >
      <HiOutlineShoppingCart
        className="text-2xl text-shop_dark"
        style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
      />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}

export default CartIcon;