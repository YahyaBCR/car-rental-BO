/**
 * Currency Selector Component
 */

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { setCurrency } from '../../store/slices/currencySlice';
import type { Currency } from '../../types/currency.types';
import { CURRENCIES } from '../../types/currency.types';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className = '',
  showLabel = false
}) => {
  const dispatch = useAppDispatch();
  const currency = useAppSelector((state) => state.currency.current);
  const rates = useAppSelector((state) => state.currency.rates);
  const [isOpen, setIsOpen] = useState(false);

  const currencies: Currency[] = ['USD', 'EUR'];

  const handleSelect = (selectedCurrency: Currency) => {
    dispatch(setCurrency(selectedCurrency));
    setIsOpen(false);
  };

  const currentCurrency = CURRENCIES[currency];

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-textSecondary mb-1">
          Devise
        </label>
      )}

      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className="text-base">{currentCurrency.flag}</span>
        <span className="text-xs font-medium text-textPrimary">{currentCurrency.code}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {currencies.map((curr) => {
              const info = CURRENCIES[curr];
              const rate = rates?.[curr];
              const isSelected = curr === currency;

              return (
                <button
                  key={curr}
                  onClick={() => handleSelect(curr)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{info.flag}</span>
                    <div className="text-left">
                      <div className="font-semibold text-textPrimary flex items-center space-x-2">
                        <span>{info.symbol}</span>
                        <span>{info.code}</span>
                      </div>
                      <div className="text-xs text-textSecondary">{info.name}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}

            {/* Exchange Rates Info */}
            {rates && rates.USD && rates.EUR && (
              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <div className="text-xs text-textSecondary space-y-1">
                  <div className="font-semibold mb-1">Taux actuels:</div>
                  <div>1 USD = {rates.USD.toFixed(2)} DH</div>
                  <div>1 EUR = {rates.EUR.toFixed(2)} DH</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Compact Currency Selector (for mobile/small spaces)
 */
export const CurrencySelectorCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const currency = useAppSelector((state) => state.currency.current);

  const currencies: Currency[] = ['USD', 'EUR'];

  return (
    <select
      value={currency}
      onChange={(e) => dispatch(setCurrency(e.target.value as Currency))}
      className={`px-2 py-1 bg-white border border-gray-300 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
    >
      {currencies.map((curr) => {
        const info = CURRENCIES[curr];
        return (
          <option key={curr} value={curr}>
            {info.flag} {info.symbol} {curr}
          </option>
        );
      })}
    </select>
  );
};
