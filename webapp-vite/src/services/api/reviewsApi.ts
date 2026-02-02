/**
 * Reviews API Service
 */

import { apiClient } from '../apiClient';
import type {
  Review,
  CreateReviewData,
  UpdateReviewData,
  ReviewsResponse,
  CanReviewResponse,
} from '../../types/review.types';

export const reviewsApi = {
  /**
   * Create a new review
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    const response = await apiClient.post<{ success: boolean; review: Review }>(
      '/api/reviews',
      data
    );
    return response.data.review;
  },

  /**
   * Get reviews for a car
   */
  async getCarReviews(carId: string, page: number = 1, limit: number = 10): Promise<ReviewsResponse> {
    const response = await apiClient.get<ReviewsResponse>(
      `/api/reviews/car/${carId}`,
      { params: { page, limit } }
    );
    return response.data;
  },

  /**
   * Get client's reviews
   */
  async getMyReviews(): Promise<Review[]> {
    const response = await apiClient.get<{ success: boolean; reviews: Review[] }>(
      '/api/reviews/my-reviews'
    );
    return response.data.reviews;
  },

  /**
   * Update a review
   */
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
    const response = await apiClient.put<{ success: boolean; review: Review }>(
      `/api/reviews/${reviewId}`,
      data
    );
    return response.data.review;
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    await apiClient.delete(`/api/reviews/${reviewId}`);
  },

  /**
   * Check if client can review a booking
   */
  async canReview(bookingId: string): Promise<CanReviewResponse> {
    const response = await apiClient.get<CanReviewResponse>(
      `/api/reviews/can-review/${bookingId}`
    );
    return response.data;
  },
};
