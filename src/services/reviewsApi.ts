import apiClient from './apiClient';

export interface ReviewsListParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
}

const reviewsApi = {
  getReviews: async (params: ReviewsListParams) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.rating) queryParams.append('rating', params.rating.toString());

    const response = await apiClient.get(`/admin/reviews?${queryParams.toString()}`);
    return response.data;
  },

  getReviewDetails: async (reviewId: string) => {
    const response = await apiClient.get(`/admin/reviews/${reviewId}`);
    return response.data.data;
  },

  deleteReview: async (reviewId: string) => {
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  },

  getReviewsStats: async () => {
    const response = await apiClient.get('/admin/reviews/stats');
    return response.data.data;
  },
};

export default reviewsApi;
