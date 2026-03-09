import { getLocalizedValue, LocalizedValue } from "@/lib/i18n/getLocalizedValue";
import { useLocaleStore } from "@/stores/localeStore";

export function useLocalizedValue() {
  const lang = useLocaleStore((s) => s.lang);

  return (value: LocalizedValue) =>
    getLocalizedValue(value, lang);
}
