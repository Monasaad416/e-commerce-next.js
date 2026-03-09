'use client';

interface SelectSizeProps {
    sizes: string[];
    selectedSize: string;
    onSizeChange: (size: string) => void;
}

const SelectSize = ({ sizes, selectedSize, onSizeChange }: SelectSizeProps) => {


    if (!sizes || sizes?.length === 0) {
        console.warn('No sizes available for this product');
        return null;
    }

    return (
        <div className="flex flex-col gap-2 w-full mt-5">
            <select
                value={selectedSize}
                onChange={(e) => {
                    onSizeChange(e.target.value);
                }}
                className="
                    border border-gray-300 rounded-md px-3 py-2 
                    text-sm cursor-pointer w-full
                    focus:ring-2 focus:ring-shop_dark focus:border-shop_dark
                "
            >
                {sizes.map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectSize;