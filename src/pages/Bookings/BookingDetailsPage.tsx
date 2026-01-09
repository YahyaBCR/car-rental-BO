import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCar, FaUser, FaCalendar, FaMapMarkerAlt, FaMoneyBillWave, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import bookingsApi from '../../services/bookingsApi';
import { FlitCarColors, BOOKING_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { differenceInDays } from 'date-fns';

interface BookingDetailsType {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  created_at: string;
  updated_at: string;
  brand: string;
  model: string;
  year: number;
  plate_number: string;
  price_per_day: number;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  client_phone: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
  pickup_airport_name?: string;
  pickup_airport_code?: string;
  dropoff_airport_name?: string;
  dropoff_airport_code?: string;
  pickup_airport_fee?: number;
  dropoff_airport_fee?: number;
  car_id: string;
  client_id: string;
}

const BookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetailsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getBookingDetails(bookingId!);
      setBooking(data);
    } catch (error) {
      console.error('Error loading booking details:', error);
      toast.error('Erreur lors du chargement des détails de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const colorMap: Record<string, string> = {
      confirmed: 'badge-success',
      pending_owner: 'badge-warning',
      pending_payment: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-error',
      rejected: 'badge-error',
      in_progress: 'badge-info',
    };
    return `badge ${colorMap[status] || 'badge-gray'}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="text-textSecondary">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-textSecondary">Réservation non trouvée</p>
        </div>
      </AdminLayout>
    );
  }

  const rentalDays = differenceInDays(new Date(booking.end_date), new Date(booking.start_date));

  // Utiliser la commission depuis la base de données (déjà calculée)
  const commission = booking.commission_amount || 0;
  const ownerPayout = booking.owner_payment_amount || (booking.total_price - commission);
  const commissionRate = booking.commission_rate || 0;
  const commissionPercentage = (commissionRate * 100).toFixed(1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="btn-secondary flex items-center gap-2"
          >
            <FaArrowLeft /> Retour
          </button>
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">
              Réservation #{booking.id.slice(0, 8)}
            </h1>
            <p className="text-textSecondary mt-1">Détails de la réservation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Summary */}
            <div className="card">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-textPrimary mb-2">
                      {booking.brand} {booking.model} ({booking.year})
                    </h2>
                    <p className="text-textSecondary">{booking.plate_number}</p>
                  </div>
                  <span className={getStatusBadgeClass(booking.status)}>
                    {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-textSecondary">Prix par jour</span>
                    <span className="font-semibold text-textPrimary">{formatCurrency(booking.price_per_day)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-textSecondary">Nombre de jours</span>
                    <span className="font-semibold text-textPrimary">{rentalDays} jours</span>
                  </div>
                  {booking.pickup_airport_fee && booking.pickup_airport_fee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-textSecondary">Frais aéroport prise en charge</span>
                      <span className="font-semibold text-textPrimary">{formatCurrency(booking.pickup_airport_fee)}</span>
                    </div>
                  )}
                  {booking.dropoff_airport_fee && booking.dropoff_airport_fee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-textSecondary">Frais aéroport retour</span>
                      <span className="font-semibold text-textPrimary">{formatCurrency(booking.dropoff_airport_fee)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-textPrimary">Prix total</span>
                      <span className="text-2xl font-bold" style={{ color: FlitCarColors.primary }}>
                        {formatCurrency(booking.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Period & Locations */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-textPrimary">Période et lieux</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                      <FaCalendar className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-textSecondary">Date de début</p>
                      <p className="text-sm font-medium text-textPrimary">{formatDate(booking.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
                      <FaCalendar className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-textSecondary">Date de fin</p>
                      <p className="text-sm font-medium text-textPrimary">{formatDate(booking.end_date)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                      <FaMapMarkerAlt className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-textSecondary">Lieu de prise en charge</p>
                      {booking.pickup_airport_name ? (
                        <>
                          <p className="text-sm font-medium text-textPrimary">
                            {booking.pickup_airport_name}
                          </p>
                          <p className="text-xs text-textSecondary mt-1">
                            Code: {booking.pickup_airport_code}
                          </p>
                        </>
                      ) : booking.pickup_city_name ? (
                        <p className="text-sm font-medium text-textPrimary">
                          {booking.pickup_city_name}
                          {booking.pickup_city_region && ` (${booking.pickup_city_region})`}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Non spécifié</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
                      <FaMapMarkerAlt className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-textSecondary">Lieu de retour</p>
                      {booking.dropoff_airport_name ? (
                        <>
                          <p className="text-sm font-medium text-textPrimary">
                            {booking.dropoff_airport_name}
                          </p>
                          <p className="text-xs text-textSecondary mt-1">
                            Code: {booking.dropoff_airport_code}
                          </p>
                        </>
                      ) : booking.dropoff_city_name ? (
                        <p className="text-sm font-medium text-textPrimary">
                          {booking.dropoff_city_name}
                          {booking.dropoff_city_region && ` (${booking.dropoff_city_region})`}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Non spécifié</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FaMoneyBillWave className="text-xl" style={{ color: FlitCarColors.primary }} />
                  <h3 className="text-lg font-bold text-textPrimary">Détails financiers</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-textSecondary mb-1">Prix total</p>
                    <p className="text-xl font-bold text-textPrimary">{formatCurrency(booking.total_price)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-textSecondary mb-1">Commission ({commissionPercentage}%)</p>
                    <p className="text-xl font-bold" style={{ color: FlitCarColors.success }}>{formatCurrency(commission)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-textSecondary mb-1">Paiement propriétaire</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(ownerPayout)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FaInfoCircle className="text-xl" style={{ color: FlitCarColors.primary }} />
                  <h3 className="text-lg font-bold text-textPrimary">Informations</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-textSecondary" />
                  <div>
                    <p className="text-xs text-textSecondary">Créée le</p>
                    <p className="text-sm font-medium text-textPrimary">{formatDate(booking.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-textSecondary" />
                  <div>
                    <p className="text-xs text-textSecondary">Dernière mise à jour</p>
                    <p className="text-sm font-medium text-textPrimary">{formatDate(booking.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Client & Owner Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Info */}
            <div className="card sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-textPrimary">Client</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: FlitCarColors.primary }}
                  >
                    {booking.client_first_name.charAt(0)}{booking.client_last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-textPrimary">
                      {booking.client_first_name} {booking.client_last_name}
                    </p>
                    <span className="badge badge-info text-xs">Client</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-textSecondary">Email</p>
                    <p className="text-sm text-textPrimary break-all">{booking.client_email}</p>
                  </div>
                  {booking.client_phone && (
                    <div>
                      <p className="text-xs text-textSecondary">Téléphone</p>
                      <p className="text-sm text-textPrimary">{booking.client_phone}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/users/${booking.client_id}`)}
                  className="btn-primary w-full mt-4"
                >
                  Voir le profil
                </button>
              </div>
            </div>

            {/* Owner Info */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-textPrimary">Propriétaire</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: FlitCarColors.secondary }}
                  >
                    {booking.owner_first_name.charAt(0)}{booking.owner_last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-textPrimary">
                      {booking.owner_first_name} {booking.owner_last_name}
                    </p>
                    <span className="badge badge-success text-xs">Propriétaire</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-textSecondary">Email</p>
                    <p className="text-sm text-textPrimary break-all">{booking.owner_email}</p>
                  </div>
                  {booking.owner_phone && (
                    <div>
                      <p className="text-xs text-textSecondary">Téléphone</p>
                      <p className="text-sm text-textPrimary">{booking.owner_phone}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/cars/${booking.car_id}`)}
                  className="btn-secondary w-full mt-4"
                >
                  Voir la voiture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BookingDetailsPage;
