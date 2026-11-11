import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import es from '../locales/es.json';
import en from '../locales/en.json';

const dictionaries = { es, en };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('kdarnet_lang');
      return saved === 'en' || saved === 'es' ? saved : 'es';
    } catch {
      return 'es';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kdarnet_lang', lang);
    } catch {
      // Ignore storage errors in restricted environments
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = useCallback((nextLang) => {
    if (nextLang && (nextLang === 'es' || nextLang === 'en')) {
      setLang(nextLang);
    } else {
      setLang((prev) => (prev === 'es' ? 'en' : 'es'));
    }
  }, []);

  const t = dictionaries[lang] || dictionaries.es;

  return (
    <LanguageContext.Provider value={{ lang, setLang: toggleLanguage, t }}>
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
