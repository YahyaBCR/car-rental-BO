/**
 * Authentication API Service
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../../types/auth.types';

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; user: User }>(
      API_ENDPOINTS.AUTH.PROFILE
    );
    return response.data.user;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    instant_booking?: boolean;
  }): Promise<User> {
    const response = await apiClient.put<{ success: boolean; message: string; user: User }>(
      API_ENDPOINTS.AUTH.PROFILE,
      data
    );
    return response.data.user;
  },

  /**
   * Change user password
   */
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put(
      '/api/auth/change-password',
      data
    );
  },

  /**
   * Forgot password - Send reset link
   */
  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const response = await apiClient.post<{ message: string; resetToken?: string }>(
      '/api/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/api/auth/reset-password',
      { token, newPassword }
    );
    return response.data;
  },

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(imageUrl: string): Promise<User> {
    const response = await apiClient.post<{ success: boolean; message: string; user: User }>(
      '/api/auth/upload-profile-picture',
      { imageUrl }
    );
    return response.data.user;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
