import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaClock } from 'react-icons/fa6';
import { bookingsApi } from '../../services/api/bookingsApi';
import type { Booking } from '../../types/booking.types';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { useTranslation } from 'react-i18next';

// Timer Component for individual bookings
const BookingTimer: React.FC<{ booking: Booking }> = ({ booking }) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (booking.status !== 'pending_owner' && booking.status !== 'waiting_payment') {
      return;
    }

    const calculateTimeRemaining = () => {
      let deadline: string | null = null;

      if (booking.status === 'pending_owner') {
        deadline = (booking as any).owner_response_deadline || (booking as any).ownerResponseDeadline;
      } else if (booking.status === 'waiting_payment') {
        deadline = (booking as any).payment_deadline || (booking as any).paymentDeadline;
      }

      if (!deadline) return null;

      const deadlineTime = new Date(deadline).getTime();
      const now = Date.now();
      const remaining = deadlineTime - now;

      return remaining > 0 ? remaining : 0;
    };

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  if (timeRemaining === null) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isUrgent = timeRemaining < 600000; // Less than 10 minutes

  return (
    <div className={`flex items-center space-x-2 text-sm font-semibold ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
      <FaClock />
      <span>{minutes}min {seconds}s</span>
    </div>
  );
};

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyFormat();
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending_owner' | 'waiting_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getClientBookings();
      console.log('Bookings:', data);
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error(t('bookings.loadBookingsError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm(t('bookings.confirmCancel'))) {
      return;
    }

    try {
      await bookingsApi.cancelBooking(bookingId);
      toast.success(t('bookings.cancelSuccess'));
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(t('bookings.cancelError'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return '#F59E0B'; // Orange - En attente validation owner
      case 'waiting_payment':
        return '#F59E0B'; // Orange - En attente paiement
      case 'confirmed':
        return FlitCarColors.success; // Vert - Payée, prête
      case 'in_progress':
        return '#6366F1'; // Indigo - Location active
      case 'completed':
        return FlitCarColors.primary; // Bleu - Terminée
      case 'rejected':
      case 'cancelled':
        return FlitCarColors.error; // Rouge - Refusée/Annulée
      case 'expired_owner':
      case 'expired_payment':
        return '#6B7280'; // Gris - Expirée
      default:
        return FlitCarColors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return <span>⏱️</span>;
      case 'waiting_payment':
        return <span>💳</span>;
      case 'confirmed':
        return <span>✓</span>;
      case 'in_progress':
        return <span>🚗</span>;
      case 'completed':
        return <span>✓</span>;
      case 'rejected':
      case 'cancelled':
        return <span>✕</span>;
      case 'expired_owner':
      case 'expired_payment':
        return <span>⌛</span>;
      default:
        return <span>⏱️</span>;
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending_owner': 'pendingOwner',
      'waiting_payment': 'waitingPayment',
      'confirmed': 'confirmed',
      'in_progress': 'inProgress',
      'completed': 'completed',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'expired_owner': 'expiredOwner',
      'expired_payment': 'expiredPayment'
    };

    const mappedStatus = statusMap[status] || status;
    return t(`bookings.status.${mappedStatus}`);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      <div className="container mx-auto px-3 lg:px-4 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-4 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
            <div>
              <h1 className="text-xl lg:text-3xl font-black text-textPrimary mb-1 lg:mb-2">{t('bookings.title')}</h1>
              <p className="text-xs lg:text-base text-textSecondary">{t('bookings.subtitle')}</p>
            </div>
            <button
              onClick={() => navigate('/client/payments')}
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              💳 {t('bookings.paymentHistory')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 lg:mb-6 flex flex-wrap gap-2 lg:gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 lg:px-6 py-2 rounded-lg text-xs lg:text-base font-semibold transition-all ${
              filter === 'all'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'all' ? { backgroundColor: FlitCarColors.primary } : {}}
          >
            {t('bookings.filters.all')} ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending_owner')}
            className={`px-3 lg:px-6 py-2 rounded-lg text-xs lg:text-base font-semibold transition-all ${
              filter === 'pending_owner'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'pending_owner' ? { backgroundColor: FlitCarColors.secondary } : {}}
          >
            {t('bookings.filters.pending')} ({bookings.filter((b) => b.status === 'pending_owner').length})
          </button>
          <button
            onClick={() => setFilter('waiting_payment')}
            className={`px-3 lg:px-6 py-2 rounded-lg text-xs lg:text-base font-semibold transition-all ${
              filter === 'waiting_payment'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'waiting_payment' ? { backgroundColor: '#F59E0B' } : {}}
          >
            {t('bookings.filters.toPay')} ({bookings.filter((b) => b.status === 'waiting_payment').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-3 lg:px-6 py-2 rounded-lg text-xs lg:text-base font-semibold transition-all ${
              filter === 'confirmed'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'confirmed' ? { backgroundColor: FlitCarColors.success } : {}}
          >
            {t('bookings.filters.confirmed')} ({bookings.filter((b) => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 lg:px-6 py-2 rounded-lg text-xs lg:text-base font-semibold transition-all ${
              filter === 'cancelled'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'cancelled' ? { backgroundColor: FlitCarColors.error } : {}}
          >
            {t('bookings.filters.cancelled')} ({bookings.filter((b) => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center shadow-sm">
            <FaCar className="text-4xl lg:text-6xl text-textSecondary mx-auto mb-3 lg:mb-4 opacity-50" />
            <h3 className="text-lg lg:text-xl font-bold text-textPrimary mb-2">{t('bookings.noBookings')}</h3>
            <p className="text-sm lg:text-base text-textSecondary mb-4 lg:mb-6">
              {filter === 'all'
                ? t('bookings.noBookingsDescription')
                : t('bookings.noBookingsFilter')}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-bold text-white"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              {t('bookings.searchCar')}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 lg:space-y-4">
              {paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg lg:rounded-2xl p-3 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6">
                  {/* Left: Car Info */}
                  <div className="flex items-start space-x-2 lg:space-x-4 flex-1">
                    {/* Car Image */}
                    <div className="flex-shrink-0">
                      {booking.car && ((booking.car.images && booking.car.images.length > 0) || (booking.car.image_urls && booking.car.image_urls.length > 0)) ? (
                        <img
                          src={(booking.car.images && booking.car.images[0]) || (booking.car.image_urls && booking.car.image_urls[0]) || ''}
                          alt={`${booking.car.brand} ${booking.car.model}`}
                          className="w-16 lg:w-24 h-16 lg:h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 lg:w-24 h-16 lg:h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FaCar className="text-xl lg:text-3xl text-textSecondary" />
                        </div>
                      )}
                    </div>

                    {/* Car Details */}
                    <div className="flex-1">
                      <h3 className="text-sm lg:text-xl font-bold text-textPrimary mb-1 lg:mb-2">
                        {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Voiture'}
                      </h3>

                      {/* Dates */}
                      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-1 lg:gap-4 mb-1 lg:mb-3">
                        <div className="flex items-center space-x-2 text-textSecondary">
                          <span className="text-primary">📅</span>
                          <span className="text-xs lg:text-sm">
                            {new Date(booking.startDate || booking.start_date || '').toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                            {' - '}
                            {new Date(booking.endDate || booking.end_date || '').toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                          </span>
                        </div>
                        {booking.car?.location && (
                          <div className="flex items-center space-x-2 text-textSecondary">
                            <span className="text-primary">📍</span>
                            <span className="text-xs lg:text-sm">{booking.car.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <span
                          className="inline-flex items-center space-x-1 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold text-white"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {getStatusIcon(booking.status)}
                          <span>{getStatusLabel(booking.status)}</span>
                        </span>
                        <BookingTimer booking={booking} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Price and Actions */}
                  <div className="flex flex-col items-end space-y-3 lg:space-y-4 flex-shrink-0">
                    {/* Price - Hidden on mobile */}
                    <div className="hidden lg:block text-right">
                      <p className="text-sm text-textSecondary mb-1">Prix total</p>
                      <p className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                        {formatPrice(Number(booking.totalPrice || booking.total_price || 0))}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/client/bookings/${booking.id}`)}
                        className="px-3 lg:px-4 py-2 bg-gray-100 text-textPrimary rounded-lg text-xs lg:text-base font-semibold hover:bg-gray-200 transition-colors"
                      >
                        {t('bookings.viewDetails')}
                      </button>
                      {booking.status === 'waiting_payment' && (
                        <button
                          onClick={() => navigate(`/payment/${booking.id}`)}
                          className="px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-base font-semibold text-white hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: FlitCarColors.success }}
                        >
                          💳 {t('bookings.pay')}
                        </button>
                      )}
                      {(booking.status === 'pending_owner' || booking.status === 'waiting_payment') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-base font-semibold text-white hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: FlitCarColors.error }}
                        >
                          {t('bookings.cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 lg:mt-8 flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold bg-white border border-gray-300 text-textPrimary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← {t('bookings.pagination.previous')}
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1 lg:gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg text-sm lg:text-base font-semibold transition-all ${
                      currentPage === page
                        ? 'text-white'
                        : 'bg-white border border-gray-300 text-textPrimary hover:bg-gray-50'
                    }`}
                    style={currentPage === page ? { backgroundColor: FlitCarColors.primary } : {}}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base font-semibold bg-white border border-gray-300 text-textPrimary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('bookings.pagination.next')} →
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
