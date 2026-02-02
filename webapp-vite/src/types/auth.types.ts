/**
 * Authentication Types
 */

export interface User {
  id: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email: string;
  phone?: string;
  country?: string; // Code pays (ISO 3166-1 alpha-2)
  role: 'client' | 'owner' | 'admin';
  profilePicture?: string;
  profile_picture?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string; // Code pays de résidence
  password: string;
  confirmPassword: string;
  role: 'client' | 'owner';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
