import apiClient from './apiClient';

export interface DashboardStats {
  users: {
    total: number;
    clients: number;
    owners: number;
    recent30Days: number;
  };
  cars: {
    total: number;
    available: number;
    unavailable: number;
    recent30Days: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    inProgress: number;
    completed: number;
    recent30Days: number;
  };
  financial: {
    totalRevenue: number;
    totalCommission: number;
    commissionRate: number;
  };
}

export interface RevenueChartData {
  date: string;
  bookingsCount: number;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  status: string;
  total_price: number;
  created_at: string;
  car_name: string;
  user_name: string;
}

export interface TopCar {
  id: string;
  carName: string;
  plateNumber: string;
  totalBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  ownerName: string;
}

const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data.data;
  },

  getRevenueChart: async (period: number = 30): Promise<RevenueChartData[]> => {
    const response = await apiClient.get(`/admin/dashboard/revenue-chart?period=${period}`);
    return response.data.data;
  },

  getRecentActivity: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get(`/admin/dashboard/recent-activity?limit=${limit}`);
    return response.data.data;
  },

  getTopCars: async (limit: number = 10): Promise<TopCar[]> => {
    const response = await apiClient.get(`/admin/dashboard/top-cars?limit=${limit}`);
    return response.data.data;
  },
};

export default dashboardApi;
