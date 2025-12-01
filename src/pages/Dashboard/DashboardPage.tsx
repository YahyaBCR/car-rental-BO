import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCar, FaCalendarCheck, FaDollarSign } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import dashboardApi, { type DashboardStats, type RecentActivity, type TopCar } from '../../services/dashboardApi';
import { FlitCarColors, BOOKING_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topCars, setTopCars] = useState<TopCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData, topCarsData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentActivity(10),
        dashboardApi.getTopCars(5),
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
      setTopCars(topCarsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="text-textSecondary">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Tableau de bord</h1>
          <p className="text-textSecondary mt-1">Vue d'ensemble de votre plateforme FlitCar</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Card */}
          <Link to="/users" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Utilisateurs</p>
                <p className="text-3xl font-bold text-textPrimary">{stats?.users.total || 0}</p>
                <p className="text-xs text-textSecondary mt-2">
                  {stats?.users.clients || 0} clients · {stats?.users.owners || 0} propriétaires
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: FlitCarColors.primary + '20' }}>
                <FaUsers className="text-2xl" style={{ color: FlitCarColors.primary }} />
              </div>
            </div>
          </Link>

          {/* Cars Card */}
          <Link to="/cars" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Voitures</p>
                <p className="text-3xl font-bold text-textPrimary">{stats?.cars.total || 0}</p>
                <p className="text-xs text-textSecondary mt-2">
                  {stats?.cars.available || 0} disponibles
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: FlitCarColors.secondary + '20' }}>
                <FaCar className="text-2xl" style={{ color: FlitCarColors.secondary }} />
              </div>
            </div>
          </Link>

          {/* Bookings Card */}
          <Link to="/bookings" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Réservations</p>
                <p className="text-3xl font-bold text-textPrimary">{stats?.bookings.total || 0}</p>
                <p className="text-xs text-textSecondary mt-2">
                  {stats?.bookings.confirmed || 0} confirmées
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: FlitCarColors.accent + '20' }}>
                <FaCalendarCheck className="text-2xl" style={{ color: FlitCarColors.accent }} />
              </div>
            </div>
          </Link>

          {/* Revenue Card */}
          <Link to="/financial" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Revenus totaux</p>
                <p className="text-3xl font-bold text-textPrimary">{formatCurrency(stats?.financial.totalRevenue || 0)}</p>
                <p className="text-xs text-textSecondary mt-2">
                  Commission: {formatCurrency(stats?.financial.totalCommission || 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: FlitCarColors.success + '20' }}>
                <FaDollarSign className="text-2xl" style={{ color: FlitCarColors.success }} />
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">Activité récente</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-textSecondary text-center py-8">Aucune activité récente</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: FlitCarColors.primary }}>
                      {activity.car_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-textPrimary truncate">{activity.car_name}</p>
                      <p className="text-xs text-textSecondary">{activity.user_name}</p>
                      <p className="text-xs text-textSecondary mt-1">
                        {formatRelativeTime(activity.created_at)} · {formatCurrency(activity.total_price)}
                      </p>
                    </div>
                    <span className="badge badge-info text-xs">{BOOKING_STATUS_LABELS[activity.status]}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Cars */}
          <div className="card">
            <h3 className="text-lg font-semibold text-textPrimary mb-4">Top 5 Voitures</h3>
            <div className="space-y-3">
              {topCars.length === 0 ? (
                <p className="text-textSecondary text-center py-8">Aucune donnée disponible</p>
              ) : (
                topCars.map((car, index) => (
                  <div key={car.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: FlitCarColors.primary }}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-textPrimary truncate">{car.carName}</p>
                      <p className="text-xs text-textSecondary">{car.ownerName} · {car.plateNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-textPrimary">{formatCurrency(car.totalRevenue)}</p>
                      <p className="text-xs text-textSecondary">{car.totalBookings} locations</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
