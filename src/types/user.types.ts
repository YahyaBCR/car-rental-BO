import { UserRole } from './common.types';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  avatar_url?: string;
}

export interface UserWithStats extends User {
  total_bookings?: number;
  total_spent?: number;
  total_earned?: number;
  total_cars?: number;
  activity_count?: number;
}

export interface UserFilters {
  role?: UserRole | '';
  status?: 'active' | 'inactive' | '';
  search?: string;
}
