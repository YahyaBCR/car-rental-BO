/**
 * Car Card Component - Grid View
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaCar, FaUser } from 'react-icons/fa6';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import type { Car } from '../../types/car.types';
import { ROUTES } from '../../constants/routes';
import { FlitCarColors } from '../../constants/colors';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { favoritesApi } from '../../services/api/favoritesApi';
import { useAppSelector } from '../../hooks/useRedux';
import { toast } from 'react-toastify';

interface CarCardProps {
  car: Car;
  searchParams?: {
    startDate?: string;
    endDate?: string;
    airportId?: string;
  };
}

const CarCard: React.FC<CarCardProps> = ({ car, searchParams }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatPrice, currency, rates } = useCurrencyFormat();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  console.log('🚗 CarCard: Component re-rendered for car', car.id, '| currency:', currency, '| rates:', rates);

  // Calculate total price if dates are available
  const pricePerDay = car.pricePerDay || car.price_per_day || 0;
  let days = 0;
  let totalPrice = 0;

  if (searchParams?.startDate && searchParams?.endDate) {
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    totalPrice = pricePerDay * days;
  }

  // Load favorite status on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadFavoriteStatus();
    }
  }, [car.id, isAuthenticated]);

  const loadFavoriteStatus = async () => {
    try {
      const favorited = await favoritesApi.isFavorited(car.id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
  };

  const handleClick = () => {
    navigate(ROUTES.CAR_DETAILS(car.id), {
      state: { searchParams }
    });
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!isAuthenticated) {
      toast.info(t('favorites.loginRequired'));
      navigate('/login');
      return;
    }

    try {
      setLoadingFavorite(true);
      const newStatus = await favoritesApi.toggleFavorite(car.id);
      setIsFavorited(newStatus);
      toast.success(newStatus ? t('favorites.addedToFavorites') : t('favorites.removedFromFavorites'));
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error(error.response?.data?.message || t('favorites.loadFavoritesError'));
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {((car.images && car.images.length > 0) || (car.image_urls && car.image_urls.length > 0)) ? (
          <img
            src={(car.images && car.images[0]) || (car.image_urls && car.image_urls[0]) || ''}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FaCar className="text-6xl" />
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={loadingFavorite}
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all disabled:opacity-50 z-10"
          title={isFavorited ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
        >
          {isFavorited ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FaRegHeart className="text-gray-600 text-lg" />
          )}
        </button>

        {/* Rating Badge */}
        {car.rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-sm font-bold">{car.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-textPrimary mb-1 group-hover:text-primary transition-colors">
          {car.brand} {car.model}
        </h3>
        <p className="text-sm text-textSecondary mb-4">{car.year}</p>

        {/* Specs */}
        <div className="flex items-center justify-between text-sm text-textSecondary mb-4">
          <div className="flex items-center space-x-1">
            <FaCar />
            <span className="capitalize">{car.transmission || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="capitalize">{car.fuelType || car.fuel_type || 'N/A'}</span>
          </div>
          {car.seats && (
            <div className="flex items-center space-x-1">
              <FaUser />
              <span>{car.seats}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex-1">
            {days > 0 ? (
              <>
                <p className="text-xs text-textSecondary">{t('common.totalPrice')} ({days} {t('common.day', { count: days })})</p>
                <p className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                  {formatPrice(totalPrice)}
                </p>
                <p className="text-xs text-textSecondary mt-1">
                  {formatPrice(pricePerDay)} / {t('common.day')}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-textSecondary">{t('common.from')}</p>
                <p className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                  {formatPrice(pricePerDay)}
                </p>
                <p className="text-xs text-textSecondary">/{t('common.day')}</p>
              </>
            )}
          </div>
          <button
            className="px-6 py-2 rounded-xl font-semibold text-white transition-all hover:shadow-md flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primary}DD)`,
            }}
          >
            {t('common.view')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
