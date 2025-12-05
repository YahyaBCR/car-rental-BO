import React, { useState, useEffect } from 'react';
import { FaChartLine, FaMoneyBillWave, FaShoppingCart, FaUsers, FaCar, FaCalendar } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AdminLayout from '../../components/Layout/AdminLayout';
import analyticsApi from '../../services/analyticsApi';
import { FlitCarColors } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [revenueTimeline, setRevenueTimeline] = useState<any[]>([]);
  const [bookingsByStatus, setBookingsByStatus] = useState<any[]>([]);
  const [topCars, setTopCars] = useState<any[]>([]);
  const [performanceByCity, setPerformanceByCity] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [
        overviewData,
        revenueData,
        statusData,
        carsData,
        cityData,
        growthData,
        insightsData,
      ] = await Promise.all([
        analyticsApi.getOverview({ period }),
        analyticsApi.getRevenueTimeline({ period }),
        analyticsApi.getBookingsByStatus(),
        analyticsApi.getTopCars({ limit: 5, sortBy: 'bookings' }),
        analyticsApi.getPerformanceByCity(),
        analyticsApi.getUserGrowth({ period: '90' }),
        analyticsApi.getInsights(),
      ]);

      setOverview(overviewData);
      setRevenueTimeline(revenueData);
      setBookingsByStatus(statusData);
      setTopCars(carsData);
      setPerformanceByCity(cityData);
      setUserGrowth(growthData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    confirmed: '#10B981',
    pending_owner: '#F59E0B',
    pending_payment: '#F59E0B',
    completed: '#3B82F6',
    cancelled: '#EF4444',
    rejected: '#EF4444',
    in_progress: '#8B5CF6',
  };

  const STATUS_LABELS: Record<string, string> = {
    confirmed: 'Confirmées',
    pending_owner: 'En attente propriétaire',
    pending_payment: 'En attente paiement',
    completed: 'Terminées',
    cancelled: 'Annulées',
    rejected: 'Refusées',
    in_progress: 'En cours',
  };

  const getInsightStyle = (level: string) => {
    const styles: Record<string, string> = {
      danger: 'bg-red-50 border-red-200 text-red-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    return styles[level] || styles.info;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="text-textSecondary">Chargement des analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Period Filter */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">Analytics</h1>
            <p className="text-textSecondary mt-1">Statistiques et analyses détaillées</p>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-48"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">1 an</option>
          </select>
        </div>

        {/* Insights / Alerts */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getInsightStyle(insight.level)} flex items-start gap-3`}
              >
                <span className="text-2xl">{insight.icon}</span>
                <p className="text-sm font-medium">{insight.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Revenue Card */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Revenus</p>
                  <p className="text-3xl font-bold text-textPrimary mt-1">
                    {formatCurrency(overview.revenue.total)}
                  </p>
                  <p className={`text-sm mt-2 ${parseFloat(overview.revenue.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(overview.revenue.change) >= 0 ? '+' : ''}{overview.revenue.change}% vs période précédente
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${FlitCarColors.primary}20` }}>
                  <FaMoneyBillWave className="text-2xl" style={{ color: FlitCarColors.primary }} />
                </div>
              </div>
            </div>

            {/* Bookings Card */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Réservations</p>
                  <p className="text-3xl font-bold text-textPrimary mt-1">{overview.bookings.total}</p>
                  <p className={`text-sm mt-2 ${parseFloat(overview.bookings.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(overview.bookings.change) >= 0 ? '+' : ''}{overview.bookings.change}% vs période précédente
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                  <FaShoppingCart className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Utilisateurs Actifs</p>
                  <p className="text-3xl font-bold text-textPrimary mt-1">
                    {overview.users.activeClients + overview.users.activeOwners}
                  </p>
                  <p className="text-sm mt-2 text-textSecondary">
                    {overview.users.newUsers} nouveaux
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
                  <FaUsers className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>

            {/* Occupation Card */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-textPrimary mt-1">{overview.occupation.rate}%</p>
                  <p className="text-sm mt-2 text-textSecondary">
                    {overview.occupation.rentedCars}/{overview.occupation.totalCars} voitures
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                  <FaCar className="text-2xl text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Timeline Chart */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
              <FaChartLine style={{ color: FlitCarColors.primary }} />
              Évolution des Revenus
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(date) => formatDate(date)}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke={FlitCarColors.primary} name="Revenus totaux" strokeWidth={2} />
                <Line type="monotone" dataKey="commission" stroke="#10B981" name="Commission FlitCar" strokeWidth={2} />
                <Line type="monotone" dataKey="ownerPayout" stroke={FlitCarColors.secondary} name="Paiement propriétaires" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings by Status - Pie Chart */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-textPrimary">Répartition par Statut</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, count }) => `${STATUS_LABELS[status] || status}: ${count}`}
                  >
                    {bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#888'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [value, STATUS_LABELS[name] || name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance by City - Bar Chart */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-textPrimary">Top Villes</h2>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceByCity.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill={FlitCarColors.primary} name="Revenus" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Growth - Area Chart */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-textPrimary">Croissance Utilisateurs (90 jours)</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                />
                <YAxis />
                <Tooltip labelFormatter={(date) => formatDate(date)} />
                <Legend />
                <Area type="monotone" dataKey="cumulativeClients" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Clients" />
                <Area type="monotone" dataKey="cumulativeOwners" stackId="1" stroke="#10B981" fill="#10B981" name="Propriétaires" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cars Table */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-textPrimary">Top 5 Voitures</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Voiture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Propriétaire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Réservations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Revenu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topCars.map((car, index) => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: FlitCarColors.primary }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-textPrimary">{car.brand} {car.model}</p>
                          <p className="text-xs text-textSecondary">{car.year} • {car.plateNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-textSecondary">{car.ownerName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-textPrimary">{car.bookingCount}</td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: FlitCarColors.primary }}>
                      {formatCurrency(car.totalRevenue)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">{car.avgRating}</span>
                        <span className="text-xs text-textSecondary">({car.reviewCount})</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
