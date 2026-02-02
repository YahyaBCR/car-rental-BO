/**
 * Cars API Service
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import type { Car, SearchFilters, SearchResponse, CreateCarData } from '../../types/car.types';

export const carsApi = {
  /**
   * Search available cars
   */
  async searchCars(filters: SearchFilters): Promise<SearchResponse> {
    // Format dates to YYYY-MM-DD if they exist
    const formattedFilters = { ...filters };
    if (formattedFilters.startDate) {
      const startDate = new Date(formattedFilters.startDate);
      formattedFilters.startDate = startDate.toISOString().split('T')[0];
    }
    if (formattedFilters.endDate) {
      const endDate = new Date(formattedFilters.endDate);
      formattedFilters.endDate = endDate.toISOString().split('T')[0];
    }

    // If dates and location (airport or city) are not provided, use /all endpoint with filters
    const hasRequiredParams = !!(formattedFilters.startDate && formattedFilters.endDate && (formattedFilters.airportId || formattedFilters.cityId));

    const endpoint = hasRequiredParams
      ? API_ENDPOINTS.CARS.SEARCH
      : API_ENDPOINTS.CARS.ALL;

    console.log('🔍 Search params:', { hasRequiredParams, endpoint, filters: formattedFilters });

    const response = await apiClient.get<SearchResponse>(
      endpoint,
      { params: formattedFilters }
    );
    return response.data;
  },

  /**
   * Get all cars (no date filter)
   */
  async getAllCars(page: number = 1, limit: number = 20): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>(
      API_ENDPOINTS.CARS.ALL,
      {
        params: {
          page,
          limit,
          sortBy: 'price',
          sortOrder: 'asc',
        },
      }
    );
    return response.data;
  },

  /**
   * Get car details by ID
   */
  async getCarDetails(carId: string): Promise<Car> {
    const response = await apiClient.get<{ success: boolean; data?: Car; car?: Car }>(
      API_ENDPOINTS.CARS.DETAILS(carId)
    );
    // L'API peut renvoyer soit data.car soit data.data
    return response.data.car || response.data.data || response.data as any;
  },

  /**
   * Get owner's cars
   */
  async getOwnerCars(): Promise<Car[]> {
    const response = await apiClient.get<{ success: boolean; cars: Car[] }>(
      API_ENDPOINTS.CARS.OWNER_CARS
    );
    return response.data.cars;
  },

  /**
   * Create new car
   */
  async createCar(data: CreateCarData): Promise<Car> {
    const response = await apiClient.post<{ message: string; car: Car }>(
      API_ENDPOINTS.CARS.CREATE,
      data
    );
    return response.data.car;
  },

  /**
   * Update car
   */
  async updateCar(carId: string, data: Partial<CreateCarData>): Promise<Car> {
    const response = await apiClient.put<{ message: string; car: Car }>(
      API_ENDPOINTS.CARS.UPDATE(carId),
      data
    );
    return response.data.car;
  },

  /**
   * Delete car
   */
  async deleteCar(carId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CARS.DELETE(carId));
  },

  /**
   * Upload car image
   */
  async uploadCarImage(carId: string, imageFile: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post<{ success: boolean; message: string; imageUrl: string }>(
      `/api/cars/${carId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return { imageUrl: response.data.imageUrl };
  },

  /**
   * Delete car image
   */
  async deleteCarImage(carId: string, imageUrl: string): Promise<void> {
    await apiClient.delete(`/api/cars/${carId}/images`, {
      data: { imageUrl },
    });
  },
};
