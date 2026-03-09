'use client';

interface SelectColorProps {
    colors: string[];
    selectedColor: string;
    onColorChange: (color: string) => void;
}

// Helper function to convert color name to hex
const getColorHex = (color: string): string => {
    const colorMap: Record<string, string> = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#EF4444',
        'blue': '#3B82F6',
        'green': '#10B981',
        'yellow': '#F59E0B',
        'pink': '#EC4899',
        'purple': '#8B5CF6',
        'indigo': '#6366F1',
        'gray': '#6B7280'
    };
    return colorMap[color.toLowerCase()] || color; // Return the color as-is if not in the map (in case it's already a hex code)
};

const SelectColor = ({ colors, selectedColor, onColorChange }: SelectColorProps) => {
    if (!colors || colors?.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-5">
            <ul className="flex gap-2 items-center">
                {colors.map((color) => {
                    const colorValue = getColorHex(color);
                    return (
                        <li
                            key={color}
                            onClick={() => onColorChange(color)}
                            className={`
                                w-6 h-6 rounded-full cursor-pointer border-2 
                                hover:ring-2 hover:ring-offset-1
                                ${selectedColor === color
                                    ? "ring-2 ring-black ring-offset-1 border-shop"
                                    : "border-gray-200"
                                }
                            `}
                            style={{ backgroundColor: colorValue }}
                            title={color}
                        />
                    );
                })}
            </ul>
        </div>
    );
};

export default SelectColor;