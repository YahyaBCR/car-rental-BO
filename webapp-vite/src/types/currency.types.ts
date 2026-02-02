/**
 * Currency Types
 */

export type Currency = 'USD' | 'EUR';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
}

export interface ExchangeRates {
  USD: number;
  EUR: number;
}

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: ExchangeRates | null;
  isLoading: boolean;
  formatPrice: (amountInMAD: number) => string;
  convertFromMAD: (amountInMAD: number) => number;
  convertToMAD: (amount: number) => number;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺'
  }
};
