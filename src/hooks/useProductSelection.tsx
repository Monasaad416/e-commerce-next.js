import { useState, useEffect } from "react";
import { IProduct, IProductVariant, AttributeValue } from "@/interfaces/productType";


function getSelectionFromVariant(variant: IProductVariant) {
  const attrSelection: any = {};
  variant.attribute_values?.forEach((attr: AttributeValue) => {
    const attrKey = Object.values(attr.attribute_name)[0];
    const attrValue = Object.values(attr.value)[0];
    attrSelection[attrKey] = attrValue;
  });
  if (variant.featured_image) {
    attrSelection.image = variant.featured_image;
  }
  // Always include product_variant_id for cart operations
  attrSelection.product_variant_id = variant.id;
  return attrSelection;
}


function findMatchingVariant(variants: IProductVariant[], selection: any) {
  return variants.find((variant) => {
    return variant.attribute_values?.every((attr: AttributeValue) => {
      const attrKey = Object.values(attr.attribute_name)[0];
      const attrValue = Object.values(attr.value)[0];
      return selection[attrKey] === attrValue;
    });
  });
}

export const UseProductSelection = (product: IProduct) => {
  const [selection, setSelection] = useState<any>({});

  useEffect(() => {
    if (!product) return;
    if (product.type === "variable" && product.variants && product.variants.length > 0) {
      setSelection(getSelectionFromVariant(product.variants[0]));
    } else if (product.type === "simple") {
      setSelection({});
    }
  }, [product]);

  
  const setAttribute = (attrKey: string, attrValue: string) => {
    setSelection((prev: any) => {
      const newSelection = { ...prev, [attrKey]: attrValue };
      // ابحث عن variant يطابق الاختيار الجديد
      if (product.type === "variable" && product.variants) {
     
        const matched = findMatchingVariant(product.variants, newSelection);

        
        if (matched) {
          if (matched.featured_image) {
            newSelection.image = matched.featured_image;
          }
          newSelection.product_variant_id = matched.id;

  
        } else {
          delete newSelection.product_variant_id;
        }
      }
      return newSelection;
    });
  };

  
  let matchedVariant: IProductVariant | undefined = undefined;
  if (product.type === "variable" && product.variants) {
    matchedVariant = findMatchingVariant(product.variants, selection);
  }

  return {
    selection,
    setAttribute, //  to change the selection based on user input
    matchedVariant //  to get the currently selected variant details (like price, stock,image, etc.)
  };
};
