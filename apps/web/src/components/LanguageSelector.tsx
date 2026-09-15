'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LOCALES, SupportedLanguageCode } from '@farm-seva/shared';
import { SupportedLocale } from '../i18n/translations';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'login' | 'footer' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'navbar', className = '' }) => {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguageCode) => {
    setLocale(code as SupportedLocale);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('navbar.switchLanguage', 'Select Language')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition border shadow-xs ${
          variant === 'navbar'
            ? 'bg-emerald-900/80 border-emerald-500/60 text-amber-300 hover:bg-emerald-800 focus:ring-2 focus:ring-amber-400'
            : variant === 'login'
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500'
            : 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700'
        }`}
      >
        <Globe className="w-4 h-4 shrink-0 text-amber-400" />
        <span className="truncate max-w-[100px]">{currentOption.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-elevated border border-slate-200 py-1.5 z-50 animate-fadeIn"
        >
          <div className="px-3 py-1.5 text-[10px] font-black tracking-wider text-slate-400 uppercase border-b border-slate-100">
            {t('navbar.switchLanguage', 'Select Language')}
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {SUPPORTED_LOCALES.map((item) => {
              const isSelected = item.code === locale;
              return (
                <button
                  key={item.code}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(item.code as SupportedLanguageCode)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-left transition ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-700 font-black'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{item.nativeName}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{item.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
