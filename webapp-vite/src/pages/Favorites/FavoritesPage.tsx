/**
 * Favorites Page
 * Display user's favorite cars
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHeart } from 'react-icons/fa6';
import { favoritesApi, type Favorite } from '../../services/api/favoritesApi';
import { FlitCarColors } from '../../constants/colors';
import CarCard from '../../components/search/CarCard';
import { toast } from 'react-toastify';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesApi.getUserFavorites();
      setFavorites(data);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      toast.error(error.response?.data?.message || t('favorites.loadFavoritesError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-spin" style={{ color: FlitCarColors.primary }}>⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-textPrimary mb-2 flex items-center gap-3">
            <FaHeart className="text-red-500" />
            {t('favorites.title')}
          </h1>
          <p className="text-textSecondary">
            {favorites.length > 0
              ? t('favorites.count', { count: favorites.length })
              : t('favorites.noFavorites')}
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <CarCard
                key={favorite.id}
                car={{
                  id: favorite.id,
                  brand: favorite.brand,
                  model: favorite.model,
                  year: favorite.year,
                  price_per_day: favorite.price_per_day,
                  transmission: favorite.transmission,
                  fuel_type: favorite.fuel_type,
                  seats: favorite.seats,
                  location: favorite.location,
                  image_urls: favorite.image_urls,
                  rating: favorite.rating,
                  pricePerDay: favorite.price_per_day,
                  fuelType: favorite.fuel_type,
                  images: favorite.image_urls,
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 text-center">
            <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-textPrimary mb-2">
              {t('favorites.noFavoritesTitle')}
            </h3>
            <p className="text-textSecondary mb-6">
              {t('favorites.noFavoritesDescription')}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-md"
              style={{
                background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primary}DD)`,
              }}
            >
              {t('nav.search')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
