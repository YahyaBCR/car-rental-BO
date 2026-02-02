/**
 * ReviewsList Component
 * Displays reviews for a car with pagination and statistics
 */

import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { reviewsApi } from '../../services/api/reviewsApi';
import type { Review, ReviewsResponse } from '../../types/review.types';

interface ReviewsListProps {
  carId: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ carId }) => {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    loadReviews();
  }, [carId, currentPage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewsApi.getCarReviews(carId, currentPage, reviewsPerPage);
      setReviewsData(data);
    } catch (err: any) {
      console.error('Error loading reviews:', err);
      setError('Impossible de charger les avis');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-300" />
        )
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (reviewsData?.pagination && currentPage < reviewsData.pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-textPrimary mb-4">Avis clients</h3>
        <p className="text-textSecondary text-center py-8">
          Aucun avis pour le moment. Soyez le premier à laisser un avis!
        </p>
      </div>
    );
  }

  const { reviews, pagination, stats } = reviewsData;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-xl font-semibold text-textPrimary mb-4">Avis clients</h3>

      {/* Statistics */}
      {stats && (
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-textPrimary">
              {stats.average.toFixed(1)}
            </span>
            <div className="flex gap-1">
              {renderStars(Math.round(stats.average))}
            </div>
          </div>
          <span className="text-textSecondary">
            ({stats.total} avis)
          </span>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review: Review) => (
          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-textPrimary">
                  {review.first_name} {review.last_name}
                </p>
                <p className="text-sm text-textSecondary">
                  {formatDate(review.created_at)}
                </p>
              </div>
              <div className="flex gap-1">
                {renderStars(review.rating)}
              </div>
            </div>

            {review.comment && (
              <p className="text-textSecondary mt-2 leading-relaxed">
                {review.comment}
              </p>
            )}

            {review.start_date && review.end_date && (
              <p className="text-xs text-textSecondary mt-2">
                Location du {formatDate(review.start_date)} au {formatDate(review.end_date)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-textPrimary bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft />
            Précédent
          </button>

          <span className="text-sm text-textSecondary">
            Page {currentPage} sur {pagination.totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === pagination.totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-textPrimary bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};
