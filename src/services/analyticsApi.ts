import apiClient from './apiClient';

export interface AnalyticsParams {
  period?: string; // '7', '30', '90', etc.
  sortBy?: string;
  limit?: number;
}

const analyticsApi = {
  getOverview: async (params?: AnalyticsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);

    const response = await apiClient.get(`/admin/analytics/overview?${queryParams.toString()}`);
    return response.data.data;
  },

  getRevenueTimeline: async (params?: AnalyticsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);

    const response = await apiClient.get(`/admin/analytics/revenue-timeline?${queryParams.toString()}`);
    return response.data.data;
  },

  getBookingsByStatus: async () => {
    const response = await apiClient.get('/admin/analytics/bookings-by-status');
    return response.data.data;
  },

  getTopCars: async (params?: AnalyticsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const response = await apiClient.get(`/admin/analytics/top-cars?${queryParams.toString()}`);
    return response.data.data;
  },

  getPerformanceByCity: async () => {
    const response = await apiClient.get('/admin/analytics/performance-by-city');
    return response.data.data;
  },

  getUserGrowth: async (params?: AnalyticsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);

    const response = await apiClient.get(`/admin/analytics/user-growth?${queryParams.toString()}`);
    return response.data.data;
  },

  getInsights: async () => {
    const response = await apiClient.get('/admin/analytics/insights');
    return response.data.data;
  },
};

export default analyticsApi;
