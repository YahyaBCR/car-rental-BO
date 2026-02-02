/**
 * AddReviewModal Component
 * Modal form for submitting a review for a completed booking
 */

import React, { useState } from 'react';
import { FaStar, FaRegStar, FaXmark } from 'react-icons/fa6';
import { reviewsApi } from '../../services/api/reviewsApi';
import type { CreateReviewData } from '../../types/review.types';

interface AddReviewModalProps {
  bookingId: string;
  carBrand: string;
  carModel: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  bookingId,
  carBrand,
  carModel,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewData: CreateReviewData = {
        bookingId,
        rating,
        comment: comment.trim() || undefined
      };

      await reviewsApi.createReview(reviewData);

      // Reset form
      setRating(0);
      setComment('');

      // Notify parent
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating review:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setComment('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-textPrimary">
              Laisser un avis
            </h3>
            <p className="text-sm text-textSecondary mt-1">
              {carBrand} {carModel}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FaXmark size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-textPrimary mb-3">
              Note <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                  disabled={submitting}
                >
                  {star <= (hoverRating || rating) ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-textSecondary mt-2">
                {rating === 1 && 'Très insatisfait'}
                {rating === 2 && 'Insatisfait'}
                {rating === 3 && 'Acceptable'}
                {rating === 4 && 'Satisfait'}
                {rating === 5 && 'Très satisfait'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-textPrimary mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec cette voiture..."
              rows={5}
              maxLength={1000}
              disabled={submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-textSecondary mt-1 text-right">
              {comment.length}/1000 caractères
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-textPrimary font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi...' : 'Publier l\'avis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
