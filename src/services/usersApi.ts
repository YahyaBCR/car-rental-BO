import apiClient from './apiClient';
import { User } from '../types/user.types';
import { PaginationResponse } from '../types/common.types';

export interface UsersListParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  pagination: PaginationResponse;
}

export interface CreateOwnerData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  ice: string;
  rc: string;
  company_address: string;
  company_city: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  ice?: string;
  rc?: string;
  company_address?: string;
  company_city?: string;
  country?: string;
}

const usersApi = {
  getUsers: async (params: UsersListParams): Promise<UsersListResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    if (params.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  },

  getUserDetails: async (userId: string) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  getUsersStats: async () => {
    const response = await apiClient.get('/admin/users/stats');
    return response.data.data;
  },

  createOwner: async (data: CreateOwnerData) => {
    const response = await apiClient.post('/admin/users/owners', data);
    return response.data;
  },

  blockOwner: async (userId: string, reason: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/block`, { reason });
    return response.data;
  },

  unblockOwner: async (userId: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  updateUser: async (userId: string, data: UpdateUserData) => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },
};

export default usersApi;
