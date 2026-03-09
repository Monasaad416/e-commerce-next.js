import { create } from "zustand";

type Locale = "ar" | "en";

interface LocaleState {
  lang: Locale;
  setLang: (lang: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  lang: "en",
  setLang: (lang) => set({ lang }),
}));
