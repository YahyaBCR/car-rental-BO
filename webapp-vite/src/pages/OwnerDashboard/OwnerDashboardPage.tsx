import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar, FaComments } from 'react-icons/fa6';
import { FaCog } from 'react-icons/fa';
import { carsApi } from '../../services/api/carsApi';
import { bookingsApi } from '../../services/api/bookingsApi';
import { messagingApi } from '../../services/api/messagingApi';
import type { Booking } from '../../types/booking.types';
import type { Conversation } from '../../types/messaging.types';
import { FlitCarColors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { formatMAD } from '../../utils/currencyUtils';

const OwnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    unreadMessages: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load cars
      const cars = await carsApi.getOwnerCars();

      // Load bookings
      const bookings = await bookingsApi.getOwnerBookings();

      // Load conversations
      let conversations: Conversation[] = [];
      let unreadCount = 0;
      try {
        conversations = await messagingApi.getConversations();
        const unreadData = await messagingApi.getUnreadCount();
        unreadCount = unreadData;
        setRecentConversations(conversations.slice(0, 3));
      } catch (err) {
        console.error('Error loading conversations:', err);
      }

      // Calculate stats
      const pendingCount = bookings.filter(b => b.status === 'pending_owner').length;
      const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
      const revenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + Number(b.totalPrice || b.total_price || 0), 0);

      setStats({
        totalCars: cars.length,
        totalBookings: bookings.length,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        totalRevenue: revenue,
        unreadMessages: unreadCount,
      });

      // Get recent bookings (last 5)
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_payment':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired_owner':
      case 'expired_payment':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return 'En attente';
      case 'waiting_payment':
        return 'En attente de paiement';
      case 'confirmed':
        return 'Confirmée';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'rejected':
        return 'Refusée';
      case 'cancelled':
        return 'Annulée';
      case 'expired_owner':
        return 'Expirée';
      case 'expired_payment':
        return 'Paiement expiré';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-textPrimary mb-2">Tableau de bord</h1>
              <p className="text-textSecondary">Bienvenue sur votre espace propriétaire</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.OWNER_SETTINGS)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border-2 shadow-sm hover:shadow-md transition-all"
              style={{
                borderColor: FlitCarColors.primary,
                color: FlitCarColors.primary
              }}
            >
              <FaCog className="text-xl" />
              <span className="font-bold text-base">Paramètres</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Cars */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-textSecondary mb-1">Mes voitures</p>
                <p className="text-3xl font-black text-textPrimary">{stats.totalCars}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: FlitCarColors.primary + '20' }}>
                <FaCar className="text-2xl" style={{ color: FlitCarColors.primary }} />
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.OWNER_CARS)}
              className="text-sm font-semibold"
              style={{ color: FlitCarColors.primary }}
            >
              Voir mes voitures →
            </button>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-textSecondary mb-1">Réservations</p>
                <p className="text-3xl font-black text-textPrimary">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.OWNER_BOOKINGS)}
              className="text-sm font-semibold"
              style={{ color: FlitCarColors.primary }}
            >
              Voir les réservations →
            </button>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-textSecondary mb-1">En attente</p>
                <p className="text-3xl font-black text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
            <p className="text-sm text-textSecondary">À confirmer</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-textSecondary mb-1">Revenus</p>
                <p className="text-3xl font-black" style={{ color: FlitCarColors.success }}>
                  {formatMAD(stats.totalRevenue, { decimals: 0 })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <p className="text-sm text-textSecondary">Total confirmé</p>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-textSecondary mb-1">Messages</p>
                <p className="text-3xl font-black text-textPrimary">{stats.unreadMessages}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: FlitCarColors.primary + '20' }}>
                <FaComments className="text-2xl" style={{ color: FlitCarColors.primary }} />
              </div>
            </div>
            <button
              onClick={() => navigate('/messaging')}
              className="text-sm font-semibold"
              style={{ color: FlitCarColors.primary }}
            >
              Voir messages →
            </button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-textPrimary">Réservations récentes</h2>
            <button
              onClick={() => navigate(ROUTES.OWNER_BOOKINGS)}
              className="text-sm font-semibold"
              style={{ color: FlitCarColors.primary }}
            >
              Voir tout →
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-textSecondary">Aucune réservation pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(ROUTES.OWNER_BOOKING_DETAILS(booking.id))}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-textPrimary mb-1">
                      {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Voiture'}
                    </h3>
                    <p className="text-sm text-textSecondary">
                      {new Date(booking.startDate || booking.start_date || '').toLocaleDateString('fr-FR')} - {new Date(booking.endDate || booking.end_date || '').toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-textPrimary">{formatMAD(Number(booking.totalPrice || booking.total_price || 0))}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
              <FaComments style={{ color: FlitCarColors.primary }} />
              Conversations récentes
            </h2>
            <button
              onClick={() => navigate('/messaging')}
              className="text-sm font-semibold"
              style={{ color: FlitCarColors.primary }}
            >
              Voir tout →
            </button>
          </div>

          {recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <FaComments size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-textSecondary">Aucune conversation pour le moment</p>
              <p className="text-xs text-textSecondary mt-1">Les conversations apparaîtront après confirmation des réservations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/messaging/${conversation.id}`)}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                  >
                    {conversation.client_first_name?.charAt(0)}{conversation.client_last_name?.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-textPrimary truncate">
                      {conversation.client_first_name} {conversation.client_last_name}
                    </h3>
                    <p className="text-sm text-textSecondary truncate">
                      {conversation.brand} {conversation.model}
                    </p>
                    {conversation.last_message && (
                      <p className="text-xs text-textSecondary mt-1 truncate">
                        {conversation.last_message}
                      </p>
                    )}
                  </div>

                  {/* Unread Badge */}
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: FlitCarColors.primary }}
                    >
                      {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <button
            onClick={() => navigate(ROUTES.OWNER_ADD_CAR)}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: FlitCarColors.primary + '20' }}>
              <span className="text-2xl">+</span>
            </div>
            <h3 className="text-lg font-bold text-textPrimary mb-2">Ajouter une voiture</h3>
            <p className="text-sm text-textSecondary">Publiez une nouvelle voiture</p>
          </button>

          <button
            onClick={() => navigate(ROUTES.OWNER_BOOKINGS)}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-100 mb-4 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-lg font-bold text-textPrimary mb-2">Gérer les réservations</h3>
            <p className="text-sm text-textSecondary">Confirmez ou refusez les demandes</p>
          </button>

          <button
            onClick={() => navigate(ROUTES.OWNER_CARS)}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 mb-4 flex items-center justify-center">
              <FaCar className="text-xl text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-textPrimary mb-2">Ma flotte</h3>
            <p className="text-sm text-textSecondary">Voir et modifier mes voitures</p>
          </button>

          <button
            onClick={() => navigate('/messaging')}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left relative"
          >
            <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: FlitCarColors.primary + '20' }}>
              <FaComments className="text-xl" style={{ color: FlitCarColors.primary }} />
            </div>
            {stats.unreadMessages > 0 && (
              <div
                className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: FlitCarColors.error }}
              >
                {stats.unreadMessages > 9 ? '9+' : stats.unreadMessages}
              </div>
            )}
            <h3 className="text-lg font-bold text-textPrimary mb-2">Messagerie</h3>
            <p className="text-sm text-textSecondary">
              {stats.unreadMessages > 0 ? `${stats.unreadMessages} message${stats.unreadMessages > 1 ? 's' : ''} non lu${stats.unreadMessages > 1 ? 's' : ''}` : 'Aucun nouveau message'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
