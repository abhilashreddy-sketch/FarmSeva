'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, SupportedLocale } from '../i18n/translations';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  // Load language priority: 1. user.preferredLanguage -> 2. localStorage -> 3. 'en'
  useEffect(() => {
    if (user && user.preferredLanguage && TRANSLATIONS[user.preferredLanguage as SupportedLocale]) {
      setLocaleState(user.preferredLanguage as SupportedLocale);
      localStorage.setItem('farm_seva_locale', user.preferredLanguage);
      return;
    }

    const savedLocale = typeof window !== 'undefined' ? (localStorage.getItem('farm_seva_locale') as SupportedLocale) : null;
    if (savedLocale && TRANSLATIONS[savedLocale]) {
      setLocaleState(savedLocale);
    }
  }, [user]);

  const setLocale = (newLocale: SupportedLocale) => {
    if (!TRANSLATIONS[newLocale]) return;
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farm_seva_locale', newLocale);
    }

    // Background sync preferredLanguage to authenticated user profile
    if (user && token) {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmseva.onrender.com';
      fetch(`${API_BASE_URL}/api/v1/farmer/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredLanguage: newLocale }),
      }).catch((err) => {
        console.warn('⚠️ Background sync of preferredLanguage failed:', err);
      });
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
