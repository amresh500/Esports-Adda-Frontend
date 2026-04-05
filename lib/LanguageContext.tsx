"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "./translations/en";
import ne from "./translations/ne";
import type { Translations } from "./translations/en";

export type Language = "en" | "ne";

interface LanguageContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
  isNepali: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  t: en,
  setLanguage: () => {},
  isNepali: false,
});

const STORAGE_KEY = "esports-adda-lang";

const dictionaries: Record<Language, Translations> = { en, ne };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Read persisted preference on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "ne" || stored === "en") {
        setLanguageState(stored);
      }
    } catch {
      // localStorage not available (SSR safety)
    }
  }, []);

  // Update <html lang="..."> whenever language changes
  useEffect(() => {
    document.documentElement.lang = language === "ne" ? "ne" : "en";
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        t: dictionaries[language],
        setLanguage,
        isNepali: language === "ne",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
