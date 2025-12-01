export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export type UserRole = 'client' | 'owner' | 'admin';

export type BookingStatus =
  | 'pending_owner'
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type CarStatus = 'available' | 'unavailable' | 'maintenance';
