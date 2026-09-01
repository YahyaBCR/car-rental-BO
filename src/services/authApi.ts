import axios from 'axios';
import { API_URL } from '../config/env';

const authApi = {
  /**
   * Get current user profile
   */
  async getProfile() {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    instant_booking?: boolean;
  }) {
    const token = localStorage.getItem('admin_token');
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default authApi;
