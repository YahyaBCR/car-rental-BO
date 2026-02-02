/**
 * Features API Service
 */

import { apiClient } from '../apiClient';

export interface Feature {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  description: string;
  isPremium: boolean;
  sortOrder: number;
}

export interface FeatureCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

/**
 * Get all available features
 */
export const getAllFeatures = async (lang: string = 'fr'): Promise<Feature[]> => {
  const response = await apiClient.get<Feature[]>('/api/features', {
    params: { lang }
  });
  return response.data;
};

/**
 * Get all feature categories
 */
export const getCategories = async (): Promise<FeatureCategory[]> => {
  const response = await apiClient.get<FeatureCategory[]>('/api/features/categories');
  return response.data;
};

/**
 * Get features for a specific car
 */
export const getCarFeatures = async (carId: string, lang: string = 'fr'): Promise<Feature[]> => {
  const response = await apiClient.get<Feature[]>(`/api/cars/${carId}/features`, {
    params: { lang }
  });
  return response.data;
};

/**
 * Update features for a specific car
 */
export const updateCarFeatures = async (carId: string, featureIds: string[]): Promise<void> => {
  await apiClient.put(`/api/features/cars/${carId}/features`, { featureIds });
};

export const featuresApi = {
  getAllFeatures,
  getCategories,
  getCarFeatures,
  updateCarFeatures,
};
