/**
 * Currency Utilities
 */

import type { Currency, ExchangeRates } from '../types/currency.types';
import { CURRENCIES } from '../types/currency.types';

/**
 * Convertit un prix de MAD vers une devise
 */
export const convertFromMAD = (
  amountInMAD: number,
  targetCurrency: Currency,
  rates: ExchangeRates | null
): number => {
  if (!rates || !rates[targetCurrency]) {
    return amountInMAD;
  }

  const rate = rates[targetCurrency];
  const convertedAmount = amountInMAD / rate;

  return parseFloat(convertedAmount.toFixed(2));
};

/**
 * Convertit un prix d'une devise vers MAD
 */
export const convertToMAD = (
  amount: number,
  currency: Currency,
  rates: ExchangeRates | null
): number => {
  if (!rates || !rates[currency]) {
    return amount;
  }

  const rate = rates[currency];
  const amountInMAD = amount * rate;

  return parseFloat(amountInMAD.toFixed(2));
};

/**
 * Formate un prix pour l'affichage
 */
export const formatPrice = (
  amountInMAD: number | string,
  currency: Currency,
  rates: ExchangeRates | null,
  options?: {
    showMADEquivalent?: boolean;
    decimals?: number;
  }
): string => {
  // Convert string to number if needed
  const amount = typeof amountInMAD === 'string' ? parseFloat(amountInMAD) : amountInMAD;

  // Handle invalid numbers
  if (isNaN(amount)) {
    console.error('formatPrice: Invalid amount provided:', amountInMAD);
    return `${CURRENCIES[currency].symbol}0.00`;
  }

  const currencyInfo = CURRENCIES[currency];
  const convertedAmount = convertFromMAD(amount, currency, rates);
  const decimals = options?.decimals ?? 2;

  const formatted = `${currencyInfo.symbol}${convertedAmount.toFixed(decimals)}`;

  // Optionnel : afficher l'équivalent en MAD
  if (options?.showMADEquivalent) {
    return `${formatted} (≈ ${amount.toFixed(0)} DH)`;
  }

  return formatted;
};

/**
 * Formate un prix simple sans conversion
 */
export const formatCurrencyAmount = (
  amount: number,
  currency: Currency,
  decimals: number = 2
): string => {
  const currencyInfo = CURRENCIES[currency];
  return `${currencyInfo.symbol}${amount.toFixed(decimals)}`;
};

/**
 * Détecte la devise par défaut selon la localisation
 */
export const detectCurrency = (): Currency => {
  try {
    // Vérifier localStorage en premier
    const saved = localStorage.getItem('preferred_currency') as Currency;
    if (saved && (saved === 'USD' || saved === 'EUR')) {
      return saved;
    }

    // Détecter selon la langue du navigateur
    const language = navigator.language.toLowerCase();

    // Pays européens utilisant l'Euro
    const euroCountries = [
      'fr', 'de', 'es', 'it', 'pt', 'nl', 'be', 'at', 'ie', 'fi',
      'gr', 'sk', 'si', 'ee', 'lv', 'lt', 'lu', 'mt', 'cy'
    ];

    const countryCode = language.split('-')[1] || language;

    if (euroCountries.some(code => countryCode.includes(code))) {
      return 'EUR';
    }

    // Par défaut : USD
    return 'USD';
  } catch (error) {
    return 'USD';
  }
};

/**
 * Sauvegarde la devise préférée
 */
export const saveCurrencyPreference = (currency: Currency): void => {
  localStorage.setItem('preferred_currency', currency);
};

/**
 * Formate un prix en MAD uniquement (pour les owners)
 * Les owners doivent toujours voir les prix en MAD car ce sont les montants réels
 */
export const formatMAD = (
  amountInMAD: number | string,
  options?: {
    decimals?: number;
    showCurrency?: boolean;
  }
): string => {
  // Convert string to number if needed
  const amount = typeof amountInMAD === 'string' ? parseFloat(amountInMAD) : amountInMAD;

  // Handle invalid numbers
  if (isNaN(amount)) {
    console.error('formatMAD: Invalid amount provided:', amountInMAD);
    return '0.00 DH';
  }

  const decimals = options?.decimals ?? 2;
  const showCurrency = options?.showCurrency ?? true;

  const formatted = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showCurrency ? `${formatted} DH` : formatted;
};
