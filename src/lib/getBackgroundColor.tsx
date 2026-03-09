const getBackgroundColor = (color: { en: string; ar: string } | string | any): string => {
    if (!color) return "#ccc";
    
    // Handle string input
    if (typeof color === 'string') {
        return getColorFromString(color.trim().toLowerCase());
    }
    
    // Handle object with en/ar properties
    if (color.en || color.ar) {
        const colorValue = color.en || color.ar;
        if (colorValue) {
            return getColorFromString(colorValue);
        }
    }
    
    // Fallback for other object types
    return getColorFromString(String(color).trim().toLowerCase());
};

// Helper function to convert color strings to hex values
const getColorFromString = (colorStr: string): string => {
    if (!colorStr) return "#ccc";
    
    const normalizedColor = colorStr.trim().toLowerCase();
    const colorMap: Record<string, string> = {
        red: "#ff0000",
        green: "#008000",
        blue: "#0000ff",
        yellow: "#ffff00",
        black: "#000000",
        white: "#ffffff",
        gray: "#808080",
        grey: "#808080",
        orange: "#ffa500",
        purple: "#800080",
        pink: "#ffc0cb",
        brown: "#a52a2a",
    };

    if (colorMap[normalizedColor]) return colorMap[normalizedColor];
    if (/^#?([0-9A-F]{3}){1,2}$/i.test(normalizedColor)) {
        return normalizedColor.startsWith("#") ? normalizedColor : `#${normalizedColor}`;
    }
    if (/^(rgb|hsl)a?\(/i.test(normalizedColor)) return normalizedColor;
    return "#ccc";
};

export default getBackgroundColor;