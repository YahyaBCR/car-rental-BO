/**
 * Favorites API Service
 */

import { apiClient } from '../apiClient';

export interface Favorite {
  favorite_id: string;
  favorited_at: string;
  id: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  transmission: string;
  fuel_type: string;
  seats: number;
  location: string;
  image_urls: string[];
  rating?: number;
  available: boolean;
}

export const favoritesApi = {
  /**
   * Get all favorites for current user
   */
  async getUserFavorites(): Promise<Favorite[]> {
    const response = await apiClient.get<{ success: boolean; favorites: Favorite[] }>(
      '/api/favorites'
    );
    return response.data.favorites;
  },

  /**
   * Check if a car is favorited
   */
  async isFavorited(carId: string): Promise<boolean> {
    const response = await apiClient.get<{ success: boolean; isFavorited: boolean }>(
      `/api/favorites/check/${carId}`
    );
    return response.data.isFavorited;
  },

  /**
   * Add car to favorites
   */
  async addFavorite(carId: string): Promise<void> {
    await apiClient.post('/api/favorites', { carId });
  },

  /**
   * Remove car from favorites
   */
  async removeFavorite(carId: string): Promise<void> {
    await apiClient.delete(`/api/favorites/${carId}`);
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(carId: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean; isFavorited: boolean }>(
      '/api/favorites/toggle',
      { carId }
    );
    return response.data.isFavorited;
  },
};
