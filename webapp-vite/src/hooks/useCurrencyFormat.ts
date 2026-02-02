/**
 * Currency Format Hook
 * Utilise Redux pour accéder à la devise et aux taux
 */

import { useCallback, useEffect } from 'react';
import { useAppSelector } from './useRedux';
import { formatPrice as utilFormatPrice } from '../utils/currencyUtils';

export const useCurrencyFormat = () => {
  const currency = useAppSelector((state) => state.currency.current);
  const rates = useAppSelector((state) => state.currency.rates);
  const version = useAppSelector((state) => state.currency.version); // Subscribe to version changes

  useEffect(() => {
    console.log('✅ useCurrencyFormat: currency changed to', currency, 'with rates', rates, '| version:', version);
  }, [currency, rates, version]);

  const formatPrice = (amountInMAD: number): string => {
    const result = utilFormatPrice(amountInMAD, currency, rates);
    console.log(`💰 formatPrice(${amountInMAD}) = ${result} [currency: ${currency}] [v${version}]`);
    return result;
  };

  return { formatPrice, currency, rates };
};
