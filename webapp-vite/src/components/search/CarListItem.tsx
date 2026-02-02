/**
 * Car List Item Component - List View
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaCar, FaUser, FaShield, FaPalette } from 'react-icons/fa6';
import { MdLocalOffer } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import type { Car } from '../../types/car.types';
import { ROUTES } from '../../constants/routes';
import { FlitCarColors } from '../../constants/colors';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';

interface CarListItemProps {
  car: Car;
  searchParams?: {
    startDate?: string;
    endDate?: string;
    airportId?: string;
  };
}

const CarListItem: React.FC<CarListItemProps> = ({ car, searchParams }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyFormat();

  // Calculate rental duration and total price if search dates are provided
  const calculateRentalDetails = () => {
    if (searchParams?.startDate && searchParams?.endDate) {
      const start = new Date(searchParams.startDate);
      const end = new Date(searchParams.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const pricePerDay = car.pricePerDay || car.price_per_day || 0;
      const totalPrice = pricePerDay * days;
      return { days, totalPrice };
    }
    return null;
  };

  const rentalDetails = calculateRentalDetails();

  const handleClick = () => {
    navigate(ROUTES.CAR_DETAILS(car.id), {
      state: { searchParams }
    });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative md:w-80 h-56 flex-shrink-0 overflow-hidden bg-gray-100">
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

          {/* Rating Badge */}
          {car.rating && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center space-x-1">
              <FaStar className="text-yellow-400" />
              <span className="font-bold">{car.rating.toFixed(1)}</span>
              {(car.reviewCount || car.review_count) && (
                <span className="text-xs text-textSecondary">({car.reviewCount || car.review_count})</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-textPrimary mb-1 group-hover:text-primary transition-colors">
                {car.brand} {car.model}
              </h3>
              <p className="text-textSecondary text-sm">{car.year}</p>
            </div>
            <div className="text-right">
              {rentalDetails ? (
                <>
                  <p className="text-sm text-textSecondary mb-1">{t('common.totalPrice')} ({rentalDetails.days} {t('common.day', { count: rentalDetails.days })})</p>
                  <p className="text-3xl font-black" style={{ color: FlitCarColors.primary }}>
                    {formatPrice(rentalDetails.totalPrice)}
                  </p>
                  <p className="text-xs text-textSecondary mt-1">
                    {formatPrice(car.pricePerDay || car.price_per_day || 0)}/{t('common.day')}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-textSecondary mb-1">{t('common.from')}</p>
                  <p className="text-3xl font-black" style={{ color: FlitCarColors.primary }}>
                    {formatPrice(car.pricePerDay || car.price_per_day || 0)}
                  </p>
                  <p className="text-sm text-textSecondary">/{t('common.day')}</p>
                </>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center space-x-2 text-textSecondary">
              <FaCar className="text-primary" />
              <span className="capitalize">{car.transmission || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2 text-textSecondary">
              <MdLocalOffer className="text-primary" />
              <span className="capitalize">{car.fuelType || car.fuel_type || 'N/A'}</span>
            </div>
            {car.seats && (
              <div className="flex items-center space-x-2 text-textSecondary">
                <FaUser className="text-primary" />
                <span>{car.seats} {t('carCard.seats')}</span>
              </div>
            )}
          </div>

          {/* Vehicle Details - Color and Type */}
          <div className="flex flex-wrap gap-4 mb-4">
            {car.color && (
              <div className="flex items-center space-x-2 text-textSecondary">
                <FaPalette className="text-primary" />
                <span className="capitalize">{car.color}</span>
              </div>
            )}
            {car.type && (
              <div className="flex items-center space-x-2 text-textSecondary">
                <FaCar className="text-primary" />
                <span className="capitalize">{car.type}</span>
              </div>
            )}
          </div>

          {/* Owner Information */}
          {car.owner && (
            <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                {car.owner.rating && (
                  <>
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold text-textPrimary">{car.owner.rating.toFixed(1)}</span>
                  </>
                )}
              </div>
              {car.owner.totalBookings !== undefined && (
                <div className="flex items-center space-x-2 text-textSecondary">
                  <FaShield className="text-primary" />
                  <span>{car.owner.totalBookings} {t('carDetails.ownerInfo.rentals')}</span>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {car.description && (
            <p className="text-textSecondary text-sm mb-4 line-clamp-2">{car.description}</p>
          )}

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {car.features.slice(0, 5).map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-xs text-textSecondary"
                >
                  {feature}
                </span>
              ))}
              {car.features.length > 5 && (
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-textSecondary">
                  +{car.features.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primary}DD)`,
              }}
            >
              {t('carCard.viewDetails')}
            </button>
            <button className="px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-primary hover:text-primary transition-colors">
              {t('carDetails.ownerInfo.contact')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarListItem;
