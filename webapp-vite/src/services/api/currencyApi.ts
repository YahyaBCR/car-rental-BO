/**
 * Currency API Service
 */

import apiClient from '../apiClient';

export interface ExchangeRates {
  USD: number;
  EUR: number;
}

export interface CurrencyRatesResponse {
  success: boolean;
  rates: ExchangeRates;
  margin: number;
  currencies: string[];
  baseCurrency: string;
  updated_at: string;
}

export interface ConversionResponse {
  success: boolean;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  margin: number;
}

export const currencyApi = {
  /**
   * Récupère les taux de change actuels
   */
  async getCurrentRates(): Promise<CurrencyRatesResponse> {
    const response = await apiClient.get<CurrencyRatesResponse>('/api/currency/rates');
    return response.data;
  },

  /**
   * Convertit un montant de MAD vers une devise
   */
  async convertPrice(amountMAD: number, targetCurrency: string): Promise<ConversionResponse> {
    const response = await apiClient.get<ConversionResponse>('/api/currency/convert', {
      params: { amount: amountMAD, currency: targetCurrency }
    });
    return response.data;
  },

  /**
   * Met à jour un taux de change (Admin)
   */
  async updateExchangeRate(currency: string, rate: number, notes?: string): Promise<any> {
    const response = await apiClient.post('/api/currency/rates', {
      currency,
      rate,
      notes
    });
    return response.data;
  },

  /**
   * Récupère l'historique des taux (Admin)
   */
  async getRatesHistory(currency?: string, limit?: number): Promise<any> {
    const response = await apiClient.get('/api/currency/rates/history', {
      params: { currency, limit }
    });
    return response.data;
  },

  /**
   * Met à jour la marge sur le taux de change (Admin)
   */
  async updateExchangeMargin(margin: number): Promise<any> {
    const response = await apiClient.post('/api/currency/margin', { margin });
    return response.data;
  },

  /**
   * Récupère les paramètres de devise (Admin)
   */
  async getCurrencySettings(): Promise<any> {
    const response = await apiClient.get('/api/currency/settings');
    return response.data;
  }
};
