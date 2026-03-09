// In QtyBtns.tsx
import { ICartItem } from '@/interfaces/CartStoreStateType';
import { IProduct } from '@/interfaces/productType';
import { useCartStore } from '@/stores/cartStore';
import { useState, useEffect } from 'react';

interface QtyBtnsProps {
    item: ICartItem | IProduct;
    selection: object;
    onQuantityChange?: (quantity: number) => void;
}

const QtyBtns = ({ item, selection = {}, onQuantityChange }: QtyBtnsProps) => {
    const [quantity, setQuantity] = useState(1);
    const { incrementQuantity, decrementQuantity } = useCartStore();

    // Update local quantity when item changes
    useEffect(() => {
        if ('quantity' in item) {
            setQuantity(item.qty);
        }
    }, [item]);

    // const handleIncrement = () => {
    //     const newQuantity = quantity + 1;
    //     setQuantity(newQuantity);
    //     if (onQuantityChange) {
    //         onQuantityChange(newQuantity);
    //     } else if ('id' in item) {
    //         incrementQuantity(String(item.id), selection, newQuantity);
    //     }
    // };

    const handleIncrement = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        
        if (onQuantityChange) {
            onQuantityChange(newQuantity);
        } else if ('id' in item) {
            incrementQuantity(String(item.id), selection); 
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            if (onQuantityChange) {
                onQuantityChange(newQuantity);
            } else if ('id' in item) {
                decrementQuantity(String(item.id), selection);
            }
        }
    };

    return (
        <div className="flex items-center border w-28 bg-white shadow-sm overflow-hidden">
            <button
                className="w-10 h-10 flex items-center justify-center bg-shop_dark_primary hover:bg-shop_white hover:text-shop_dark_primary text-white font-bold active:bg-gray-300 transition-colors"
                onClick={handleDecrement}
                disabled={quantity === 1}
            >
                -
            </button>

            <span className="flex-1 text-center font-medium text-shop_black">
                {quantity}
            </span>

            <button
                className="w-10 h-10 flex items-center justify-center bg-shop_dark_primary hover:bg-shop_white hover:text-shop_dark_primary text-white font-bold active:bg-gray-300 transition-colors"                
                onClick={handleIncrement}
            >
                +
            </button>
        </div>


    );
};

export default QtyBtns;