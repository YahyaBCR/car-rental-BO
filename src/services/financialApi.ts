import apiClient from './apiClient';

const financialApi = {
  getTransactions: async (params: any) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/admin/financial/transactions?${queryParams.toString()}`);
    return response.data;
  },

  getCommissions: async (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await apiClient.get(`/admin/financial/commissions?${queryParams.toString()}`);
    return response.data.data;
  },

  getPayouts: async (status?: string) => {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);

    const response = await apiClient.get(`/admin/financial/payouts?${queryParams.toString()}`);
    return response.data.data;
  },

  getFinancialReports: async (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await apiClient.get(`/admin/financial/reports?${queryParams.toString()}`);
    return response.data.data;
  },
};

export default financialApi;
