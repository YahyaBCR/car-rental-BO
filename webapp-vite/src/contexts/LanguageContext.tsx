import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../constants/apiConstants';

type Language = 'fr' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>('fr');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Initialize language from localStorage or i18n detected language
    const storedLang = localStorage.getItem('flitcar_language') as Language;
    const initialLang = storedLang || (i18n.language.startsWith('ar') ? 'ar' : i18n.language.startsWith('en') ? 'en' : 'fr');

    setLanguage(initialLang);
    setIsRTL(initialLang === 'ar');
    i18n.changeLanguage(initialLang);

    // Set document direction and lang attribute
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = initialLang;
  }, [i18n]);

  const changeLanguage = async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      setIsRTL(lang === 'ar');

      // Update localStorage
      localStorage.setItem('flitcar_language', lang);

      // Update document direction and lang attribute
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;

      // Update user preference in backend if authenticated
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/api/auth/language-preference`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept-Language': lang,
            },
            body: JSON.stringify({ languagePreference: lang }),
          });
        } catch (error) {
          console.error('Failed to update language preference in backend:', error);
        }
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
