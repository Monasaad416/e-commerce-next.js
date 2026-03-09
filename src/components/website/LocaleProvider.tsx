'use client';

import { useEffect } from 'react';
import { useLocaleStore } from '@/stores/localeStore';

interface LocaleProviderProps {
    lang: 'ar' | 'en';
    children: React.ReactNode;
}

export default function LocaleProvider({ lang, children }: LocaleProviderProps) {
    const setLang = useLocaleStore((state) => state.setLang);

    useEffect(() => {
        setLang(lang);
    }, [lang, setLang]);

    return <>{children}</>;
}