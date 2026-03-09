import { LocalizedValue } from "@/lib/i18n/getLocalizedValue"

export interface GroupedAttributeOption {
  /**
   * Stable key representing the attribute value (derived from the localized value object).
   * Do NOT use `AttributeValue.id` for option identity because it can differ per variant.
   */
  key: string;
  /**
   * Representative id from the API payload (kept for backwards-compat / debugging only).
   */
  id: number;
  value: LocalizedValue;
}

export interface GroupedAttributes {
  [attributeId: number]: {
    attribute_id: number
    attribute_name: LocalizedValue
    values: GroupedAttributeOption[]
  }
}
