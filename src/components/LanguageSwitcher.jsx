import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language switcher / Selector de idioma"
      className={`inline-flex items-center rounded-full bg-[#1a1a1a] border border-[#333333] p-1 font-mono text-xs tracking-wider ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('es')}
        aria-pressed={lang === 'es'}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
          lang === 'es'
            ? 'bg-[#F5F5F5] text-[#0d0d0d] font-semibold shadow-sm'
            : 'text-[#A0A0A0] hover:text-[#F5F5F5]'
        }`}
      >
        ES
      </button>
      <span className="text-[#444444] select-none px-0.5" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
          lang === 'en'
            ? 'bg-[#F5F5F5] text-[#0d0d0d] font-semibold shadow-sm'
            : 'text-[#A0A0A0] hover:text-[#F5F5F5]'
        }`}
      >
        EN
      </button>
    </div>
  );
}
