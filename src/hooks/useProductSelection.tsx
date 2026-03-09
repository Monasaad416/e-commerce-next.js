import { useState } from "react";

export const UseProductSelection = (product: object) => {
  const [selection, setSelection] = useState({
    size: product?.sizes?.[0] || "",
    color: product?.colors?.[0] || "",
  });

  const changeType = (type: "size" | "color", value: string) => {
    setSelection(prev => ({ ...prev, [type]: value }));
    //console.log(`Selected ${type}: ${value}`);
  };

  return {
    selection,
    changeType
  };
};
