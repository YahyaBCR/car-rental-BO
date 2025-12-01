import apiClient from './apiClient';

export interface BookingsListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

const bookingsApi = {
  getBookings: async (params: BookingsListParams) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiClient.get(`/admin/bookings?${queryParams.toString()}`);
    return response.data;
  },

  getBookingDetails: async (bookingId: string) => {
    const response = await apiClient.get(`/admin/bookings/${bookingId}`);
    return response.data.data;
  },

  getBookingsStats: async () => {
    const response = await apiClient.get('/admin/bookings/stats');
    return response.data.data;
  },

  getBookingsCalendar: async () => {
    const response = await apiClient.get('/admin/bookings/calendar');
    return response.data.data;
  },
};

export default bookingsApi;
