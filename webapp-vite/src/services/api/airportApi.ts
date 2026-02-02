/**
 * Airport Fees API Service
 */

import { apiClient } from '../apiClient';

export interface AirportFee {
  id: string;
  car_id: string;
  airport_id: string;
  delivery_fee: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Airport details (joined from airports table)
  code?: string;
  name?: string;
  city?: string;
  country?: string;
}

export interface SetAirportFeeData {
  airportId: string;
  deliveryFee: number;
  isAvailable?: boolean;
}

export interface CarBookingSettings {
  depositAmount?: number;
  minRentalDays?: number;
  isBookable?: boolean;
}

export interface LocationFee {
  location_id: string;
  delivery_fee: number;
  is_available: boolean;
  type: 'airport' | 'city';
  // Airport-specific fields
  code?: string;
  name?: string;
  city?: string;
  country?: string;
  // City-specific fields
  region?: string;
}

export const airportApi = {
  /**
   * Get car's location fees (both airports and cities) with translations
   */
  async getCarLocationFees(carId: string, lang: string = 'fr'): Promise<LocationFee[]> {
    const response = await apiClient.get<{ success: boolean; locations: LocationFee[] }>(
      `/api/cars/${carId}/location-fees`,
      { params: { lang } }
    );
    return response.data.locations;
  },

  /**
   * Get car's airport fees with translations
   */
  async getCarAirportFees(carId: string, lang: string = 'fr'): Promise<AirportFee[]> {
    const response = await apiClient.get<{ airportFees: AirportFee[] }>(
      `/api/cars/${carId}/airport-fees`,
      { params: { lang } }
    );
    return response.data.airportFees;
  },

  /**
   * Add or update airport fee for a car
   */
  async setCarAirportFee(carId: string, data: SetAirportFeeData): Promise<AirportFee> {
    const response = await apiClient.post<{ message: string; airportFee: AirportFee }>(
      `/api/cars/${carId}/airport-fees`,
      data
    );
    return response.data.airportFee;
  },

  /**
   * Remove airport fee from a car
   */
  async removeCarAirportFee(carId: string, airportId: string): Promise<void> {
    await apiClient.delete(`/api/cars/${carId}/airport-fees/${airportId}`);
  },

  /**
   * Update car booking settings (deposit, min days, bookable)
   */
  async updateCarBookingSettings(carId: string, settings: CarBookingSettings): Promise<any> {
    const response = await apiClient.patch<{ message: string; car: any }>(
      `/api/cars/${carId}/booking-settings`,
      settings
    );
    return response.data.car;
  },
};
