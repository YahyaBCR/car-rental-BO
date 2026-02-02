/**
 * Currency Slice - Redux State Management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Currency, ExchangeRates } from '../../types/currency.types';
import { currencyApi } from '../../services/api/currencyApi';
import { detectCurrency, saveCurrencyPreference } from '../../utils/currencyUtils';

interface CurrencyState {
  current: Currency;
  rates: ExchangeRates | null;
  isLoading: boolean;
  error: string | null;
  version: number; // Force re-render
}

// Load exchange rates from backend
export const loadExchangeRates = createAsyncThunk(
  'currency/loadRates',
  async () => {
    try {
      console.log('🌐 Fetching exchange rates from API...');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const apiPromise = currencyApi.getCurrentRates();
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;

      console.log('📥 API response received:', response);
      return response.rates;
    } catch (error: any) {
      console.error('❌ Failed to load exchange rates:', error.message || error);
      // Return default rates on error
      console.log('🔄 Using default fallback rates');
      return { USD: 10.6, EUR: 10.89 };
    }
  }
);

const initialState: CurrencyState = {
  current: detectCurrency(),
  rates: null,
  isLoading: true,
  error: null,
  version: 0,
};

console.log('🔧 CurrencySlice: initialState created with currency:', initialState.current);

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<Currency>) => {
      console.log('🔄 Redux setCurrency: changing from', state.current, 'to', action.payload);
      state.current = action.payload;
      state.version += 1; // Increment version to force re-render
      saveCurrencyPreference(action.payload);
      console.log('✅ Redux setCurrency: state updated, new value:', state.current, '| version:', state.version);
    },
    setRates: (state, action: PayloadAction<ExchangeRates>) => {
      console.log('💱 Redux setRates: updating rates to', action.payload);
      state.rates = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadExchangeRates.pending, (state) => {
        console.log('⏳ Redux loadExchangeRates: pending...');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadExchangeRates.fulfilled, (state, action) => {
        console.log('✅ Redux loadExchangeRates: fulfilled with rates', action.payload);
        state.isLoading = false;
        state.rates = action.payload;
      })
      .addCase(loadExchangeRates.rejected, (state, action) => {
        console.log('❌ Redux loadExchangeRates: rejected', action.error.message);
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load rates';
        // Set default rates on error
        state.rates = { USD: 10.6, EUR: 10.89 };
        console.log('💱 Redux loadExchangeRates: using default rates', state.rates);
      });
  },
});

export const { setCurrency, setRates } = currencySlice.actions;
export default currencySlice.reducer;
