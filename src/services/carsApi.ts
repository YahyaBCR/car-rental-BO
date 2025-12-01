import apiClient from './apiClient';
import { PaginationResponse } from '../types/common.types';

export interface CarsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

const carsApi = {
  getCars: async (params: CarsListParams) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/admin/cars?${queryParams.toString()}`);
    return response.data;
  },

  getCarDetails: async (carId: string) => {
    const response = await apiClient.get(`/admin/cars/${carId}`);
    return response.data.data;
  },

  getCarsStats: async () => {
    const response = await apiClient.get('/admin/cars/stats');
    return response.data.data;
  },
};

export default carsApi;
