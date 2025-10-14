'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'sl' | 'en' | 'de' | 'hr' | 'hu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('sl');
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['sl', 'en', 'de', 'hr', 'hu'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    // Load translations for current language
    fetch(`/locales/${language}.json`)
      .then(res => res.json())
      .then(data => setTranslations(data))
      .catch(err => console.error('Failed to load translations:', err));
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Language names for the selector
export const languageNames: Record<Language, string> = {
  sl: 'Slovenščina',
  en: 'English',
  de: 'Deutsch',
  hr: 'Hrvatski',
  hu: 'Magyar'
};

// Language flags (emoji)
export const languageFlags: Record<Language, string> = {
  sl: '🇸🇮',
  en: '🇬🇧',
  de: '🇩🇪',
  hr: '🇭🇷',
  hu: '🇭🇺'
};
