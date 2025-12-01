import apiClient from './apiClient';

export interface AirportsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface Airport {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pickup_count?: number;
  dropoff_count?: number;
  cars_count?: number;
}

export interface CreateAirportData {
  name: string;
  code: string;
  city: string;
  country: string;
  isActive?: boolean;
}

export interface UpdateAirportData {
  name?: string;
  code?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
}

const airportsApi = {
  getAirports: async (params: AirportsListParams) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/admin/airports?${queryParams.toString()}`);
    return response.data;
  },

  getAirportDetails: async (airportId: string) => {
    const response = await apiClient.get(`/admin/airports/${airportId}`);
    return response.data.data;
  },

  createAirport: async (data: CreateAirportData) => {
    const response = await apiClient.post('/admin/airports', data);
    return response.data;
  },

  updateAirport: async (airportId: string, data: UpdateAirportData) => {
    const response = await apiClient.put(`/admin/airports/${airportId}`, data);
    return response.data;
  },

  deleteAirport: async (airportId: string) => {
    const response = await apiClient.delete(`/admin/airports/${airportId}`);
    return response.data;
  },

  getAirportsStats: async () => {
    const response = await apiClient.get('/admin/airports/stats');
    return response.data.data;
  },
};

export default airportsApi;
