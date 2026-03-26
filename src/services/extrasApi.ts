import apiClient from './apiClient';

export interface BookingExtra {
  id: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  description_fr: string;
  description_en: string;
  description_ar: string;
  icon: string;
  category: string;
  price_mad: number;
  pricing_type: 'per_day' | 'fixed';
  max_quantity: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ExtraFormData = Omit<BookingExtra, 'id' | 'created_at' | 'updated_at'>;

const extrasApi = {
  getAll: async (): Promise<BookingExtra[]> => {
    const res = await apiClient.get('/admin/extras');
    return res.data.extras;
  },

  create: async (data: Partial<ExtraFormData>): Promise<BookingExtra> => {
    const res = await apiClient.post('/admin/extras', data);
    return res.data.extra;
  },

  update: async (id: string, data: Partial<ExtraFormData>): Promise<BookingExtra> => {
    const res = await apiClient.put(`/admin/extras/${id}`, data);
    return res.data.extra;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/extras/${id}`);
  },
};

export default extrasApi;
