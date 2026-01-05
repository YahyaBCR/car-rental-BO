import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authApi = {
  /**
   * Get current user profile
   */
  async getProfile() {
    const token = localStorage.getItem('admin_token');
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
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
    const response = await axios.put(`${API_URL}/api/auth/profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default authApi;
