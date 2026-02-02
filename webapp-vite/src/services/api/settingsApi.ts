import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiConstants';

const API_URL = `${API_BASE_URL}/api`;

export interface PublicSettings {
  payment?: {
    payment_methods?: {
      card?: boolean;
      paypal?: boolean;
      transfer?: boolean;
      cash?: boolean;
    };
    payment_deadline_hours?: number;
    refund_policy?: {
      more_than_7_days?: number;
      '3_to_7_days'?: number;
      less_than_3_days?: number;
    };
    deposit_min?: number;
    deposit_max?: number;
  };
  booking?: {
    min_advance_hours?: number;
    min_duration_days?: number;
    max_duration_days?: number;
    owner_response_hours?: number;
    auto_confirm_enabled?: boolean;
    min_driver_age?: number;
    age_by_category?: {
      economique?: number;
      standard?: number;
      premium?: number;
      luxe?: number;
    };
  };
  verification?: {
    identity_required?: boolean;
    license_required?: boolean;
    min_owner_score?: number;
  };
  marketing?: {
    new_user_promo_code?: string;
    new_user_promo_amount?: number;
    loyalty_threshold?: number;
    loyalty_discount_percent?: number;
  };
  system?: {
    default_language?: string;
    global_alert_message?: string;
    global_alert_type?: string;
  };
}

export const settingsApi = {
  // Get all public settings
  getPublicSettings: async (): Promise<PublicSettings> => {
    const response = await axios.get(`${API_URL}/settings/public`);
    return response.data.data;
  },

  // Get payment settings only
  getPaymentSettings: async () => {
    const response = await axios.get(`${API_URL}/settings/public/payment`);
    return response.data.data;
  },

  // Get booking settings only
  getBookingSettings: async () => {
    const response = await axios.get(`${API_URL}/settings/public/booking`);
    return response.data.data;
  },
};
