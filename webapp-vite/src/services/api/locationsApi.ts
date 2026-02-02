/**
 * Locations API Service - Handles both airports and cities
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../constants/apiConstants';

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  is_active: boolean;
}

export interface City {
  id: string;
  name: string;
  region: string;
  country: string;
  is_active: boolean;
}

export interface Location {
  id: string;
  type: 'airport' | 'city';
  name: string;
  code?: string; // For airports (IATA code)
  city?: string; // For airports
  region?: string; // For cities
  country: string;
  is_active: boolean;
}

export const locationsApi = {
  /**
   * Get all locations (airports + cities) with translations
   */
  async getAllLocations(lang: string = 'fr'): Promise<Location[]> {
    const response = await apiClient.get<{ success: boolean; data: Location[] }>(
      API_ENDPOINTS.LOCATIONS.ALL,
      { params: { lang } }
    );
    return response.data.data;
  },

  /**
   * Get airports only with translations
   */
  async getAirports(lang: string = 'fr'): Promise<Airport[]> {
    const response = await apiClient.get<{ success: boolean; data: Airport[] }>(
      API_ENDPOINTS.LOCATIONS.AIRPORTS,
      { params: { lang } }
    );
    return response.data.data;
  },

  /**
   * Get cities only with translations
   */
  async getCities(lang: string = 'fr'): Promise<City[]> {
    const response = await apiClient.get<{ success: boolean; data: City[] }>(
      API_ENDPOINTS.LOCATIONS.CITIES,
      { params: { lang } }
    );
    return response.data.data;
  },
};
