import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaClock } from 'react-icons/fa6';
import { AiOutlineClockCircle, AiOutlineCheckCircle, AiOutlineClose, AiOutlineCalendar, AiOutlineLoading3Quarters, AiOutlineCheck } from 'react-icons/ai';
import { bookingsApi } from '../../services/api/bookingsApi';
import type { Booking } from '../../types/booking.types';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';
import { formatMAD } from '../../utils/currencyUtils';

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

const OwnerBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending_owner' | 'waiting_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getOwnerBookings();
      console.log('Owner bookings:', data);
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    const confirmMessage =
      status === 'confirmed'
        ? 'Êtes-vous sûr de vouloir confirmer cette réservation?'
        : 'Êtes-vous sûr de vouloir refuser cette réservation?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      if (status === 'confirmed') {
        await bookingsApi.acceptBooking(bookingId);
      } else {
        await bookingsApi.rejectBooking(bookingId);
      }
      toast.success(
        status === 'confirmed' ? 'Réservation confirmée' : 'Réservation refusée'
      );
      loadBookings();
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return '#F59E0B'; // Orange - En attente validation
      case 'waiting_payment':
        return '#F59E0B'; // Orange - En attente paiement
      case 'confirmed':
        return FlitCarColors.success; // Vert - Payée
      case 'in_progress':
        return '#6366F1'; // Indigo - Location active
      case 'completed':
        return FlitCarColors.primary; // Bleu - Terminée
      case 'rejected':
      case 'cancelled':
        return FlitCarColors.error; // Rouge
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
        return <AiOutlineClockCircle />;
      case 'waiting_payment':
        return <AiOutlineClockCircle />;
      case 'confirmed':
        return <AiOutlineCheckCircle />;
      case 'in_progress':
        return <FaCar />;
      case 'completed':
        return <AiOutlineCheck />;
      case 'rejected':
      case 'cancelled':
        return <AiOutlineClose />;
      case 'expired_owner':
      case 'expired_payment':
        return <AiOutlineClose />;
      default:
        return <AiOutlineClockCircle />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return 'En attente de validation';
      case 'waiting_payment':
        return 'En attente de paiement';
      case 'confirmed':
        return 'Payée - À livrer';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'rejected':
        return 'Refusée';
      case 'cancelled':
        return 'Annulée';
      case 'expired_owner':
        return 'Expirée (validation)';
      case 'expired_payment':
        return 'Expirée (paiement)';
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin text-6xl mx-auto mb-4" style={{ color: FlitCarColors.primary }} />
          <p className="text-textSecondary">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-textPrimary mb-2">Réservations</h1>
          <p className="text-textSecondary">Gérez les réservations de vos voitures</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Total</p>
                <p className="text-3xl font-black text-textPrimary">{bookings.length}</p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: `${FlitCarColors.primary}20` }}>
                <AiOutlineCalendar style={{ color: FlitCarColors.primary }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">À valider</p>
                <p className="text-3xl font-black" style={{ color: '#F59E0B' }}>
                  {bookings.filter((b) => b.status === 'pending_owner').length}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: '#F59E0B20' }}>
                <AiOutlineClockCircle style={{ color: '#F59E0B' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">En cours</p>
                <p className="text-3xl font-black" style={{ color: '#6366F1' }}>
                  {bookings.filter((b) => b.status === 'in_progress').length}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: '#6366F120' }}>
                <FaCar style={{ color: '#6366F1' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-textSecondary mb-1">Revenus nets (après commission)</p>
                <p className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                  {bookings
                    .filter((b) => b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'completed')
                    .reduce((sum, b) => sum + (Number((b as any).ownerPaymentAmount || (b as any).owner_payment_amount || 0)), 0).toLocaleString('fr-FR')}{' '}
                  DH
                </p>
                <p className="text-xs text-textSecondary mt-1">
                  À recevoir des clients lors des récupérations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'all' ? { backgroundColor: FlitCarColors.primary } : {}}
          >
            Toutes ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending_owner')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'pending_owner'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'pending_owner' ? { backgroundColor: '#F59E0B' } : {}}
          >
            À valider ({bookings.filter((b) => b.status === 'pending_owner').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'confirmed'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'confirmed' ? { backgroundColor: FlitCarColors.success } : {}}
          >
            À livrer ({bookings.filter((b) => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'in_progress'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'in_progress' ? { backgroundColor: '#6366F1' } : {}}
          >
            En cours ({bookings.filter((b) => b.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              filter === 'completed'
                ? 'text-white'
                : 'bg-white text-textPrimary border border-gray-300 hover:border-gray-400'
            }`}
            style={filter === 'completed' ? { backgroundColor: FlitCarColors.primary } : {}}
          >
            Terminées ({bookings.filter((b) => b.status === 'completed').length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <AiOutlineCalendar className="text-6xl text-textSecondary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-textPrimary mb-2">Aucune réservation</h3>
            <p className="text-textSecondary">
              {filter === 'all'
                ? 'Vous n\'avez pas encore de réservation'
                : `Aucune réservation ${getStatusLabel(filter).toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Booking Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Car Image */}
                    <div className="flex-shrink-0">
                      {booking.car && ((booking.car.images && booking.car.images.length > 0) || (booking.car.image_urls && booking.car.image_urls.length > 0)) ? (
                        <img
                          src={(booking.car.images && booking.car.images[0]) || (booking.car.image_urls && booking.car.image_urls[0]) || ''}
                          alt={`${booking.car.brand} ${booking.car.model}`}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FaCar className="text-3xl text-textSecondary" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      {/* Car */}
                      <h3 className="text-xl font-bold text-textPrimary mb-2">
                        {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Voiture'}
                      </h3>

                      {/* Client */}
                      <div className="flex items-center space-x-2 text-textSecondary mb-3">
                        <FaUser className="text-primary" />
                        <span className="text-sm">
                          {booking.client
                            ? `${booking.client.firstName || booking.client.first_name || ''} ${booking.client.lastName || booking.client.last_name || ''}`
                            : 'Client'}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center space-x-2 text-textSecondary mb-3">
                        <AiOutlineCalendar className="text-primary" />
                        <span className="text-sm">
                          {new Date(booking.startDate || booking.start_date || '').toLocaleDateString('fr-FR')}
                          {' - '}
                          {new Date(booking.endDate || booking.end_date || '').toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-3">
                        <span
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold text-white"
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
                  <div className="flex flex-col items-end space-y-4 flex-shrink-0">
                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm text-textSecondary mb-1">Votre revenu</p>
                      <p className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                        {formatMAD(Number((booking as any).ownerPaymentAmount || (booking as any).owner_payment_amount || 0))}
                      </p>
                      <p className="text-xs text-textSecondary mt-1">
                        Total: {formatMAD(Number(booking.totalPrice || booking.total_price || 0))}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {booking.status === 'pending_owner' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: FlitCarColors.success }}
                          >
                            <AiOutlineCheck />
                            <span>Accepter</span>
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: FlitCarColors.error }}
                          >
                            <AiOutlineClose />
                            <span>Refuser</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/owner/bookings/${booking.id}`)}
                        className="px-4 py-2 bg-gray-100 text-textPrimary rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerBookingsPage;
