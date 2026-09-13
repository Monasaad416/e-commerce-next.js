import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { ICartItem } from "@/interfaces/CartStoreStateType";
import { IProduct } from "@/interfaces/productType";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

interface QtyBtnsProps {
    item: ICartItem | IProduct;
    selection: object;
    onQuantityChange?: (quantity: number) => void;
}

const QtyBtns = ({ item, selection = {}, onQuantityChange }: QtyBtnsProps) => {
    const [quantity, setQuantity] = useState(1);
    const { incrementQuantity, decrementQuantity } = useCartStore();

    useEffect(() => {
        if ("qty" in item) {
            setQuantity(item.qty);
        }
    }, [item]);

    const handleIncrement = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);

        if (onQuantityChange) {
            onQuantityChange(newQuantity);
        } else if ("id" in item) {
            incrementQuantity(String(item.id), selection);
        }
    };

    const handleDecrement = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
            if (onQuantityChange) {
                onQuantityChange(newQuantity);
            } else if ("id" in item) {
                decrementQuantity(String(item.id), selection);
            }
        }
    };

    const btnCls =
        "flex h-9 w-9 items-center justify-center text-shop_light_gray transition-colors hover:bg-shop_secondary hover:text-shop_dark_primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-shop_light_gray/60";

    return (
        <div className="inline-flex items-center overflow-hidden rounded-xl border border-shop_light_gray/20 bg-shop_dark_primary/60">
            <button
                type="button"
                className={cn(btnCls, "border-e border-shop_light_gray/15")}
                onClick={handleDecrement}
                disabled={quantity === 1}
                aria-label="Decrease quantity"
            >
                <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="flex h-9 min-w-[2.5rem] items-center justify-center text-sm font-semibold text-shop_white">
                {quantity}
            </span>

            <button
                type="button"
                className={cn(btnCls, "border-s border-shop_light_gray/15")}
                onClick={handleIncrement}
                aria-label="Increase quantity"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};

export default QtyBtns;
