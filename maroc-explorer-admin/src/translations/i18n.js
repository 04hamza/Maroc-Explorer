import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslation from './fr/translation.json';
import arTranslation from './ar/translation.json';
import enTranslation from './en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frTranslation },
      ar: { translation: arTranslation },
      en: { translation: enTranslation },
    },
    lng: localStorage.getItem('language') || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;