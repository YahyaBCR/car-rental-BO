import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    debug: true, // Force debug mode to see what's happening
    supportedLngs: ['fr', 'en', 'ar'],

    lng: 'fr', // Set default language explicitly

    interpolation: {
      escapeValue: false, // React already protects from XSS
    },

    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
      requestOptions: {
        cache: 'no-store', // Prevent caching issues
      },
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'flitcar_language',
    },

    react: {
      useSuspense: false, // Disable Suspense to allow re-rendering on language change
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
  });

export default i18n;
