import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, defaultNS } from './resources';

/**
 * One shared instance, initialized before the app renders (see main.tsx). LanguageProvider
 * drives it via `i18n.changeLanguage(...)`; it never keeps its own separate "current language"
 * value that could drift from this instance's.
 */
void i18n.use(initReactI18next).init({
  resources,
  defaultNS,
  fallbackLng: 'vi',
  supportedLngs: ['vi', 'en'],
  lng: 'vi',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export { i18n };
