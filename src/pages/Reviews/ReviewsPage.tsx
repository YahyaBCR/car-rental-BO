import React, { useState, useEffect } from 'react';
import { FaSearch, FaStar, FaTrash, FaCar, FaUser } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import reviewsApi from '../../services/reviewsApi';
import { FlitCarColors } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  brand: string;
  model: string;
  year: number;
  plate_number: string;
  owner_first_name: string;
  owner_last_name: string;
  start_date: string;
  end_date: string;
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [page, ratingFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsApi.getReviews({
        page,
        limit: 20,
        search,
        rating: ratingFilter ? parseInt(ratingFilter) : undefined,
      });

      setReviews(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await reviewsApi.getReviewsStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadReviews();
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cet avis de ${review.client_first_name} ${review.client_last_name} ?`)) {
      return;
    }

    try {
      await reviewsApi.deleteReview(review.id);
      toast.success('Avis supprimé avec succès');
      loadReviews();
      loadStats();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
            size={16}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Avis clients</h1>
          <p className="text-textSecondary mt-1">Modérer et gérer les avis des clients</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Total des avis</p>
                  <p className="text-3xl font-bold text-textPrimary mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${FlitCarColors.primary}20` }}>
                  <FaStar className="text-2xl" style={{ color: FlitCarColors.primary }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Note moyenne</p>
                  <p className="text-3xl font-bold text-textPrimary mt-1">{stats.averageRating.toFixed(1)}</p>
                </div>
                <div className="flex items-center">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Cette semaine</p>
                  <p className="text-3xl font-bold text-textPrimary mt-1">{stats.recent7Days}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                  <FaStar className="text-2xl text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div>
                <p className="text-sm text-textSecondary mb-2">Distribution</p>
                <div className="space-y-1">
                  {stats.ratingDistribution.map((item: any) => (
                    <div key={item.rating} className="flex items-center gap-2 text-xs">
                      <span className="w-12">{item.rating} ⭐</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${(item.count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-textSecondary">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par voiture, client, commentaire..."
                  className="input pl-10 w-full"
                />
              </div>
            </form>

            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="input md:w-48"
            >
              <option value="">Toutes les notes</option>
              <option value="5">5 étoiles</option>
              <option value="4">4 étoiles</option>
              <option value="3">3 étoiles</option>
              <option value="2">2 étoiles</option>
              <option value="1">1 étoile</option>
            </select>

            <button
              onClick={() => {
                setSearch('');
                setRatingFilter('');
                setPage(1);
              }}
              className="btn-secondary"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
              <p className="text-textSecondary">Chargement...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="card text-center py-12">
              <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-textSecondary">Aucun avis trouvé</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="card hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {/* Rating */}
                      <div className="flex items-center gap-3 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-sm text-textSecondary">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-textPrimary mb-4">{review.comment}</p>

                      {/* Client & Car Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: FlitCarColors.primary }}
                          >
                            {review.client_first_name.charAt(0)}{review.client_last_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-textPrimary">
                              {review.client_first_name} {review.client_last_name}
                            </p>
                            <p className="text-xs text-textSecondary">{review.client_email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: FlitCarColors.secondary }}
                          >
                            <FaCar />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-textPrimary">
                              {review.brand} {review.model}
                            </p>
                            <p className="text-xs text-textSecondary">
                              {review.year} • {review.plate_number}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Booking Period */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-textSecondary">
                        <span>Période de location:</span>
                        <span className="font-medium">
                          {formatDate(review.start_date)} - {formatDate(review.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(review)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer l'avis"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="card">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-textSecondary">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewsPage;
