import en from './en.json';
import es from './es.json';
import id from './id.json';

export const SUPPORTED_LANGS = ['en', 'es', 'id'] as const;
export type Lang = typeof SUPPORTED_LANGS[number];

export const LANG_META: Record<Lang, { flag: string; label: string; locale: string }> = {
  en: { flag: '🇺🇸', label: 'English', locale: 'en-US' },
  es: { flag: '🇪🇸', label: 'Español', locale: 'es-ES' },
  id: { flag: '🇮🇩', label: 'Bahasa Indonesia', locale: 'id-ID' },
};

const translations = { en, es, id };

export function useTranslations(lang: Lang) {
  const dict = translations[lang];
  return function t(key: string): string {
    const keys = key.split('.');
    let val: any = dict;
    for (const k of keys) {
      val = val?.[k];
    }
    return typeof val === 'string' ? val : key;
  };
}

export function isValidLang(lang: string): lang is Lang {
  return SUPPORTED_LANGS.includes(lang as Lang);
}
