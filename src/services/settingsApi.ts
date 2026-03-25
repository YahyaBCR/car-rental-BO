import apiClient from './apiClient';

// Types
export interface SystemSetting {
  id: number;
  category: string;
  key: string;
  value: any;
  value_type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  updated_at: string;
}

export interface GroupedSettings {
  [category: string]: SystemSetting[];
}

export interface BulkUpdateSetting {
  category: string;
  key: string;
  value: any;
}

const settingsApi = {
  // Get all settings grouped by category
  getAllSettings: async (): Promise<GroupedSettings> => {
    const response = await apiClient.get('/admin/settings');
    return response.data.data;
  },

  // Get settings by category
  getSettingsByCategory: async (category: string): Promise<SystemSetting[]> => {
    const response = await apiClient.get(`/admin/settings/${category}`);
    return response.data.data;
  },

  // Get specific setting
  getSetting: async (category: string, key: string): Promise<SystemSetting> => {
    const response = await apiClient.get(`/admin/settings/${category}/${key}`);
    return response.data.data;
  },

  // Update specific setting
  updateSetting: async (category: string, key: string, value: any): Promise<SystemSetting> => {
    const response = await apiClient.put(`/admin/settings/${category}/${key}`, { value });
    return response.data.data;
  },

  // Bulk update multiple settings
  bulkUpdateSettings: async (settings: BulkUpdateSetting[]): Promise<SystemSetting[]> => {
    const response = await apiClient.put('/admin/settings/bulk', { settings });
    return response.data.data;
  },

  // Reset category to defaults
  resetCategory: async (category: string) => {
    const response = await apiClient.post(`/admin/settings/reset/${category}`);
    return response.data;
  },

  // Legacy commission API (kept for backwards compatibility)
  getCommissionConfig: async () => {
    const response = await apiClient.get('/admin/commission');
    return response.data;
  },

  updateCommissionConfig: async (rate: number) => {
    const response = await apiClient.put('/admin/commission', { rate });
    return response.data;
  },

  calculateCommissionPreview: async (amount: number) => {
    const response = await apiClient.post('/admin/commission/calculate', { amount });
    return response.data;
  },
};

export default settingsApi;
