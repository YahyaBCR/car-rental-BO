import React from 'react';
import { FaStar, FaLock } from 'react-icons/fa6';
import type { Car } from '../../types/car.types';
import { FlitCarColors } from '../../constants/colors';
import { useTranslation } from 'react-i18next';

interface OwnerInfoProps {
  car: Car;
  hasAccess?: boolean;
}

const OwnerInfo: React.FC<OwnerInfoProps> = ({ car, hasAccess = false }) => {
  const { t } = useTranslation();

  const owner = {
    name: car.owner?.name || t('carDetails.ownerFlitCar'),
    avatar: car.owner?.avatar || '',
    rating: car.owner?.rating || 4.8,
    totalBookings: car.owner?.totalBookings || 50,
    joinedDate: car.owner?.joinedDate || '2023',
  };

  const displayName = hasAccess ? owner.name : owner.name.split(' ')[0] + ' ***';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-xl sm:text-2xl font-bold text-textPrimary mb-4">{t('carDetails.ownerInfo.title')}</h2>

      {/* Container principal */}
      <div className="space-y-4">
        {/* Ligne 1: Avatar + Infos */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {owner.avatar ? (
            <img
              src={owner.avatar}
              alt={displayName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              {owner.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Nom + Stats */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-textPrimary truncate">{displayName}</h3>
            <div className="flex items-center gap-2 text-sm text-textSecondary mt-1">
              <FaStar className="text-yellow-400 flex-shrink-0" />
              <span className="font-semibold">{owner.rating.toFixed(1)}</span>
              <span>•</span>
              <span className="truncate">{owner.totalBookings} {t('carDetails.ownerInfo.rentals')}</span>
            </div>
          </div>
        </div>

        {/* Badge FlitCar */}
        <div className="bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-sm">
          <span>{t('carDetails.ownerFlitCar')}</span>
          <span className="mx-2">•</span>
          <span className="font-semibold" style={{ color: FlitCarColors.primary }}>
            {t('carDetails.bookingOptions.instantBooking')}
          </span>
        </div>

        {/* Zone de contact */}
        {hasAccess ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="w-full py-3 px-4 border-2 rounded-lg font-semibold transition-colors hover:bg-gray-50 text-center"
              style={{ borderColor: FlitCarColors.primary, color: FlitCarColors.primary }}
            >
              {t('carDetails.ownerInfo.contact')}
            </button>
            <button className="w-full py-3 px-4 bg-gray-100 text-textPrimary rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center">
              {t('carDetails.ownerInfo.viewProfile')}
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <FaLock className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {t('carDetails.ownerInfo.contactLocked')}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {t('carDetails.ownerInfo.contactLockedDesc')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info supplémentaire */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-textSecondary">
            <span className="font-semibold text-textPrimary">{t('carDetails.ownerInfo.aboutOwner')}:</span>{' '}
            {t('carDetails.ownerInfo.aboutOwnerText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerInfo;
