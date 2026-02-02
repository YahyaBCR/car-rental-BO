/**
 * General Settings Page
 * Allows users to configure Language, Currency and other preferences
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaGlobe, FaCoins, FaBell, FaChevronRight, FaCheck } from 'react-icons/fa6';
import { FlitCarColors } from '../../constants/colors';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { setCurrency } from '../../store/slices/currencySlice';
import { CURRENCIES } from '../../types/currency.types';
import type { Currency } from '../../types/currency.types';
import BottomSheet from '../../components/common/BottomSheet';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const dispatch = useAppDispatch();
  const currency = useAppSelector((state) => state.currency.current);
  const rates = useAppSelector((state) => state.currency.rates);

  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
  ];

  const currencies: Currency[] = ['USD', 'EUR'];

  const currentLanguage = languages.find(lang => lang.code === language);
  const currentCurrency = CURRENCIES[currency];

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode as 'fr' | 'en' | 'ar');
    setIsLanguageSheetOpen(false);
  };

  const handleCurrencyChange = (curr: Currency) => {
    dispatch(setCurrency(curr));
    setIsCurrencySheetOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-14">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors -ml-2"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 ml-2">{t('nav.settings')}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Language & Region Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {t('settings.languageRegion', 'Langue & Région')}
            </h2>
          </div>

          {/* Language Setting - Clickable Row */}
          <button
            onClick={() => setIsLanguageSheetOpen(true)}
            className="w-full px-4 py-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${FlitCarColors.primary}10` }}
              >
                <FaGlobe style={{ color: FlitCarColors.primary }} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t('settings.language', 'Langue')}</div>
                <div className="text-sm text-gray-500">{currentLanguage?.flag} {currentLanguage?.name}</div>
              </div>
            </div>
            <FaChevronRight className="text-gray-400" />
          </button>

          {/* Currency Setting - Clickable Row */}
          <button
            onClick={() => setIsCurrencySheetOpen(true)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${FlitCarColors.primary}10` }}
              >
                <FaCoins style={{ color: FlitCarColors.primary }} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t('settings.currency', 'Devise')}</div>
                <div className="text-sm text-gray-500">{currentCurrency.flag} {currentCurrency.symbol} {currentCurrency.code}</div>
              </div>
            </div>
            <FaChevronRight className="text-gray-400" />
          </button>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {t('settings.notifications', 'Notifications')}
            </h2>
          </div>

          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${FlitCarColors.primary}10` }}
              >
                <FaBell style={{ color: FlitCarColors.primary }} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{t('settings.pushNotifications', 'Notifications push')}</div>
                <div className="text-sm text-gray-500">{t('settings.pushNotificationsDesc', 'Recevoir les alertes importantes')}</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ backgroundColor: 'var(--toggle-bg, #e5e7eb)' }}
              ></div>
              <style>{`
                input:checked + div { background-color: ${FlitCarColors.primary} !important; }
              `}</style>
            </label>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-gray-400 mt-8">
          <p>FlitCar v1.0.0</p>
        </div>
      </div>

      {/* Language Bottom Sheet */}
      <BottomSheet
        isOpen={isLanguageSheetOpen}
        onClose={() => setIsLanguageSheetOpen(false)}
        title={t('settings.selectLanguage', 'Choisir la langue')}
      >
        <div className="py-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
                language === lang.code ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-base font-medium text-gray-900">{lang.name}</span>
              </div>
              {language === lang.code && (
                <FaCheck style={{ color: FlitCarColors.primary }} className="text-lg" />
              )}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Currency Bottom Sheet */}
      <BottomSheet
        isOpen={isCurrencySheetOpen}
        onClose={() => setIsCurrencySheetOpen(false)}
        title={t('settings.selectCurrency', 'Choisir la devise')}
      >
        <div className="py-2">
          {currencies.map((curr) => {
            const info = CURRENCIES[curr];
            const rate = rates?.[curr];
            const isSelected = curr === currency;

            return (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                className={`w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{info.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {info.symbol} {info.code}
                    </div>
                    <div className="text-sm text-gray-500">{info.name}</div>
                  </div>
                </div>
                {isSelected && (
                  <FaCheck style={{ color: FlitCarColors.primary }} className="text-lg" />
                )}
              </button>
            );
          })}

          {/* Exchange Rates Info */}
          {rates && rates.USD && rates.EUR && (
            <div className="mx-4 mt-4 p-4 bg-gray-100 rounded-xl">
              <div className="text-sm text-gray-600">
                <div className="font-semibold mb-2">{t('settings.exchangeRates', 'Taux actuels')}:</div>
                <div className="space-y-1">
                  <div>1 USD = {rates.USD.toFixed(2)} DH</div>
                  <div>1 EUR = {rates.EUR.toFixed(2)} DH</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default SettingsPage;
