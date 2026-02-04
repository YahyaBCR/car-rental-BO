/**
 * Consent API Service - Back Office
 * Handles all admin consent management API calls
 */

import apiClient from './apiClient';

export interface ConsentConfig {
  id: string;
  analytics_enabled: boolean;
  marketing_enabled: boolean;
  functional_enabled: boolean;
  analytics_provider: string;
  marketing_provider: string;
  analytics_settings_json: Record<string, any>;
  marketing_settings_json: Record<string, any>;
  ttl_functional: number;
  ttl_analytics: number;
  ttl_marketing: number;
  banner_texts: Record<string, any>;
  cookie_policy_version: string;
  privacy_policy_version: string;
  version: number;
  is_active: boolean;
  created_by: string | null;
  created_by_email?: string;
  created_at: string;
}

export interface ConsentStats {
  totalEvents: number;
  optInRates: {
    analytics: number;
    marketing: number;
    functional: number;
  };
  totalUsers: number;
  eventsByType: Array<{ event_type: string; count: string }>;
  eventsByActor: Array<{ actor_type: string; count: string }>;
  eventsByCountry: Array<{ country: string; count: string }>;
  dailyTrend: Array<{ date: string; event_type: string; count: string }>;
}

export interface ConsentEvent {
  id: string;
  created_at: string;
  actor_type: string;
  event_type: string;
  categories: { functional: boolean; analytics: boolean; marketing: boolean };
  locale: string;
  country: string;
  device_type: string;
  policy_version: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state: any;
  after_state: any;
  created_at: string;
}

export interface PaginatedResponse<T> {
  pagination: { page: number; limit: number; total: number; totalPages: number };
  [key: string]: any;
}

const consentApi = {
  // Config endpoints
  getConfigs: async (page = 1, limit = 20) => {
    const response = await apiClient.get(`/admin/consent/configs?page=${page}&limit=${limit}`);
    return response.data;
  },

  getActiveConfig: async (): Promise<ConsentConfig> => {
    const response = await apiClient.get('/admin/consent/configs/active');
    return response.data;
  },

  createConfig: async (config: Partial<ConsentConfig>): Promise<ConsentConfig> => {
    const response = await apiClient.post('/admin/consent/configs', config);
    return response.data;
  },

  // Stats endpoint
  getStats: async (filters?: {
    actor_type?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ConsentStats> => {
    const params = new URLSearchParams();
    if (filters?.actor_type) params.set('actor_type', filters.actor_type);
    if (filters?.country) params.set('country', filters.country);
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);
    const response = await apiClient.get(`/admin/consent/stats?${params.toString()}`);
    return response.data;
  },

  // Events endpoints
  getEvents: async (filters?: {
    actor_type?: string;
    event_type?: string;
    country?: string;
    locale?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.actor_type) params.set('actor_type', filters.actor_type);
    if (filters?.event_type) params.set('event_type', filters.event_type);
    if (filters?.country) params.set('country', filters.country);
    if (filters?.locale) params.set('locale', filters.locale);
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);
    params.set('page', String(filters?.page || 1));
    params.set('limit', String(filters?.limit || 50));
    const response = await apiClient.get(`/admin/consent/events?${params.toString()}`);
    return response.data;
  },

  exportEventsCsv: async (filters?: {
    actor_type?: string;
    event_type?: string;
    country?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const params = new URLSearchParams({ format: 'csv' });
    if (filters?.actor_type) params.set('actor_type', filters.actor_type);
    if (filters?.event_type) params.set('event_type', filters.event_type);
    if (filters?.country) params.set('country', filters.country);
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);
    const response = await apiClient.get(`/admin/consent/events?${params.toString()}`, {
      responseType: 'blob',
    });
    // Download file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'consent_events.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Audit endpoints
  getAuditLogs: async (filters?: {
    admin_id?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.admin_id) params.set('admin_id', filters.admin_id);
    if (filters?.entity_type) params.set('entity_type', filters.entity_type);
    if (filters?.start_date) params.set('start_date', filters.start_date);
    if (filters?.end_date) params.set('end_date', filters.end_date);
    params.set('page', String(filters?.page || 1));
    params.set('limit', String(filters?.limit || 20));
    const response = await apiClient.get(`/admin/consent/audit?${params.toString()}`);
    return response.data;
  },
};

export default consentApi;
