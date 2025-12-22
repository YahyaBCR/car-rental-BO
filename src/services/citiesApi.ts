import apiClient from './apiClient';

export interface City {
  id: string;
  name: string;
  region: string;
  country: string;
  postal_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owners_count?: number;
}

export interface CreateCityData {
  name: string;
  region: string;
  country: string;
  postalCode?: string;
  isActive?: boolean;
}

export interface UpdateCityData {
  name?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  isActive?: boolean;
}

export interface GetCitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface GetCitiesResponse {
  success: boolean;
  data: City[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CityStats {
  total: number;
  active: number;
  inactive: number;
}

const citiesApi = {
  /**
   * Get all cities with pagination
   */
  getCities: async (params: GetCitiesParams = {}): Promise<GetCitiesResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/admin/cities?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get city details by ID
   */
  getCityById: async (cityId: string): Promise<{ success: boolean; data: City }> => {
    const response = await apiClient.get(`/admin/cities/${cityId}`);
    return response.data;
  },

  /**
   * Create a new city
   */
  createCity: async (data: CreateCityData): Promise<{ success: boolean; data: City; message: string }> => {
    const response = await apiClient.post('/admin/cities', data);
    return response.data;
  },

  /**
   * Update an existing city
   */
  updateCity: async (cityId: string, data: UpdateCityData): Promise<{ success: boolean; data: City; message: string }> => {
    const response = await apiClient.put(`/admin/cities/${cityId}`, data);
    return response.data;
  },

  /**
   * Delete a city
   */
  deleteCity: async (cityId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/admin/cities/${cityId}`);
    return response.data;
  },

  /**
   * Get cities statistics
   */
  getCitiesStats: async (): Promise<{ success: boolean; data: CityStats }> => {
    const response = await apiClient.get('/admin/cities/stats');
    return response.data;
  },

  /**
   * Get owner's city configurations
   */
  getOwnerCities: async (ownerId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/cities/owner/${ownerId}`);
    return response.data;
  },

  /**
   * Set or update owner's city configuration
   */
  setOwnerCity: async (ownerId: string, cityId: string, deliveryFee: number, isAvailable: boolean = true): Promise<any> => {
    const response = await apiClient.post(
      `/admin/cities/owner/${ownerId}`,
      { cityId, deliveryFee, isAvailable }
    );
    return response.data;
  },

  /**
   * Remove owner's city configuration
   */
  removeOwnerCity: async (ownerId: string, cityId: string): Promise<any> => {
    const response = await apiClient.delete(`/admin/cities/owner/${ownerId}/${cityId}`);
    return response.data;
  },
};

export default citiesApi;
