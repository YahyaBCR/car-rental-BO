/**
 * Review Types
 */

export interface Review {
  id: string;
  booking_id: string;
  car_id: string;
  client_id: string;
  owner_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  // Relations
  first_name?: string;
  last_name?: string;
  start_date?: string;
  end_date?: string;
  brand?: string;
  model?: string;
  year?: number;
}

export interface CreateReviewData {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating: number;
  comment?: string;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    average: number;
    total: number;
  };
}

export interface CanReviewResponse {
  success: boolean;
  canReview: boolean;
  reason?: string;
}
