// src/hooks/useProductAttributes.tsx

import { useMemo, useState, useEffect } from "react";
import { IProduct, AttributeValue } from "@/interfaces/productType";
import { GroupedAttributes } from "@/interfaces/GroupedAttributesType";

export const useProductAttributes = (product?: IProduct) => {
  /**
   * Selection is stored as a stable "valueKey" per attribute (NOT AttributeValue.id).
   * This prevents disabling valid values that exist in other variants with different row ids.
   */
  const [selectedAttributes, setSelectedAttributes] =
    useState<Record<number, string>>({});

  const variants = product?.variants ?? [];

  const stableValueKey = (value: AttributeValue["value"]) => {
    if (!value || typeof value !== "object") return String(value ?? "");
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([k, v]) => `${k}:${String(v)}`).join("|");
  };

  const isColorName = (attrName: any) => {
    const nameString =
      attrName === null || typeof attrName !== "object"
        ? ""
        : (Object.values(attrName)[0] || "").toString().toLowerCase();
    return ["color", "colour", "اللون"].includes(nameString);
  };

  // ================= GROUP ATTRIBUTES =================
  const groupedAttributes: GroupedAttributes = useMemo(() => {
    if (!variants.length) return {};

    return variants
      .flatMap((variant) => variant.attribute_values)
      .reduce((acc, attr) => {
        const attributeId = attr.attribute_id;
        const key = stableValueKey(attr.value);

        if (!acc[attributeId]) {
          acc[attributeId] = {
            attribute_id: attributeId,
            attribute_name: attr.attribute_name,
            values: [],
          };
        }

        // ✅ dedupe by stable key (NOT by attr.id)
        const alreadyExists = acc[attributeId].values.some((v) => v.key === key);

        if (!alreadyExists) {
          acc[attributeId].values.push({
            key,
            id: attr.id, // representative only
            value: attr.value,
          });
        }

        return acc;
      }, {} as GroupedAttributes);
  }, [variants]);


  // ================= SELECT FIRST VARIANT =================
  // ================= SELECT FIRST VARIANT =================
  useEffect(() => {
    if (!variants.length) return;

    const initial: Record<number, string> = {};

    // Prefer selecting color first (primary attribute)
    const colorAttrId = Object.entries(groupedAttributes).find(([, attr]) =>
      isColorName(attr.attribute_name)
    )?.[0];

    if (colorAttrId) {
      const colorIdNum = Number(colorAttrId);
      const firstColor = groupedAttributes[colorIdNum]?.values?.[0];
      if (firstColor) initial[colorIdNum] = firstColor.key;
    }

    // Fill the rest with the first available value given current selection
    Object.keys(groupedAttributes).forEach((attrIdStr) => {
      const attrIdNum = Number(attrIdStr);
      if (initial[attrIdNum]) return;

      const firstAvailable = groupedAttributes[attrIdNum].values.find((v) => {
        // Temporarily set the value to check availability
        const tempSelections = { ...initial, [attrIdNum]: v.key };
        return variants.some(variant =>
          variant.attribute_values.some(a =>
            a.attribute_id === attrIdNum &&
            stableValueKey(a.value) === v.key
          )
        );
      });

      if (firstAvailable) {
        initial[attrIdNum] = firstAvailable.key;
      }
    });

    // If still empty (no grouped attrs), fallback to first variant's values
    if (!Object.keys(initial).length && variants[0]) {
      variants[0].attribute_values.forEach((attr) => {
        initial[attr.attribute_id] = stableValueKey(attr.value);
      });
    }

    setSelectedAttributes(initial);
  }, [variants, groupedAttributes]);

  // ================= CHECK AVAILABILITY =================
  const isValueAvailable = (attributeId: number, valueKey: string): boolean => {
    // Get the attribute being checked
    const currentAttr = groupedAttributes[attributeId];
    if (!currentAttr) return false;

    // Always enable the primary attribute (color)
    if (isColorName(currentAttr.attribute_name)) {
      return true;
    }

    // Get all selected attributes
    const currentSelections = { ...selectedAttributes };

    // For non-color attributes, check if there's a variant that matches:
    // 1. The current attribute's value
    // 2. All other selected attributes
    return variants.some(variant => {
      // Check if variant has the value we're checking
      const hasValue = variant.attribute_values.some(
        a => a.attribute_id === attributeId &&
          stableValueKey(a.value) === valueKey
      );
      if (!hasValue) return false;

      // Check if variant matches all other selected attributes
      return Object.entries(currentSelections).every(([attrId, selectedKey]) => {
        const attrIdNum = Number(attrId);
        if (attrIdNum === attributeId) return true; // Skip self

        return variant.attribute_values.some(
          a => a.attribute_id === attrIdNum &&
            stableValueKey(a.value) === selectedKey
        );
      });
    });
  };

  // ================= SELECT ATTRIBUTE =================
  const selectAttribute = (attributeId: number, valueKey: string) => {
    setSelectedAttributes((prev) => {
      // Create a new selection with the clicked attribute
      const newSelected = { ...prev, [attributeId]: valueKey };

      // For each attribute, ensure its selection is valid with the new state
      Object.entries(groupedAttributes).forEach(([attrIdStr, attr]) => {
        const attrId = Number(attrIdStr);

        // Skip the attribute that was just changed
        if (attrId === attributeId) return;

        const currentKey = newSelected[attrId];

        // Check if current selection is still valid
        const isCurrentValid = currentKey
          ? variants.some((variant) =>
            variant.attribute_values.some((a) =>
              a.attribute_id === attrId &&
              stableValueKey(a.value) === currentKey &&
              // Ensure this variant also has all other selected attributes
              Object.entries(newSelected).every(([selId, selKey]) => {
                if (Number(selId) === attrId) return true;
                return variant.attribute_values.some((a) =>
                  a.attribute_id === Number(selId) &&
                  stableValueKey(a.value) === selKey
                );
              })
            )
          )
          : false;

        // If current selection is invalid, find the first valid option
        if (!isCurrentValid) {
          const firstValid = attr.values.find((v: { key: string }) =>
            variants.some((variant) =>
              variant.attribute_values.some((a) =>
                a.attribute_id === attrId &&
                stableValueKey(a.value) === v.key &&
                // Ensure this variant also has all other selected attributes
                Object.entries(newSelected).every(([selId, selKey]) => {
                  if (Number(selId) === attrId) return true;
                  return variant.attribute_values.some((a) =>
                    a.attribute_id === Number(selId) &&
                    stableValueKey(a.value) === selKey
                  );
                })
              )
            )
          );

          if (firstValid) {
            newSelected[attrId] = firstValid.key;
          } else {
            // If no valid option found, remove the selection
            delete newSelected[attrId];
          }
        }
      });

      return newSelected;
    });
  };
  return {
    groupedAttributes,
    selectedAttributes,
    selectAttribute,
    isValueAvailable,
  };
};