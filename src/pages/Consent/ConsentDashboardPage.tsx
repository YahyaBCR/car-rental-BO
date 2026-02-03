/**
 * ConsentDashboardPage - Back Office
 * KPIs, charts, segmentation for cookie consent monitoring
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaChartPie, FaDownload } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import type { ConsentStats } from '../../services/consentApi';
import consentApi from '../../services/consentApi';
import AdminLayout from '../../components/Layout/AdminLayout';
import ConsentNav from './ConsentNav';

const COLORS = ['#00A88B', '#2196F3', '#FF9800', '#E74C3C', '#9C27B0'];

const ConsentDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<ConsentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadStats();
  }, [actorFilter, countryFilter, startDate, endDate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await consentApi.getStats({
        actor_type: actorFilter || undefined,
        country: countryFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setStats(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      await consentApi.exportEventsCsv({
        actor_type: actorFilter || undefined,
        country: countryFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      toast.success('Export CSV t\u00e9l\u00e9charg\u00e9');
    } catch {
      toast.error('Erreur lors de l\'export CSV');
    }
  };

  const KpiCard: React.FC<{ title: string; value: number; suffix?: string; color: string }> = ({ title, value, suffix = '%', color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}{suffix}</p>
    </div>
  );

  // Process daily trend for line chart
  const trendData = stats?.dailyTrend ? (() => {
    const byDate: Record<string, any> = {};
    stats.dailyTrend.forEach(({ date, event_type, count }) => {
      const d = new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      if (!byDate[d]) byDate[d] = { date: d };
      byDate[d][event_type] = parseInt(count);
    });
    return Object.values(byDate);
  })() : [];

  const actorPieData = stats?.eventsByActor?.map((e, i) => ({
    name: e.actor_type,
    value: parseInt(e.count),
    fill: COLORS[i % COLORS.length],
  })) || [];

  if (loading && !stats) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><div className="text-gray-500">Chargement...</div></div></AdminLayout>;
  }

  return (
    <AdminLayout>
    <div className="p-6">
      <ConsentNav />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartPie className="text-2xl text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Consentement</h1>
        </div>
        <button onClick={handleExportCsv} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type d'acteur</label>
            <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Tous</option>
              <option value="owner">Owner</option>
              <option value="renter">Renter</option>
              <option value="anonymous">Anonymous</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Pays</label>
            <input type="text" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} placeholder="ex: MA, FR" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date d\u00e9but</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Date fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KpiCard title="Opt-in Analytics" value={stats.optInRates.analytics} color="#2196F3" />
            <KpiCard title="Opt-in Marketing" value={stats.optInRates.marketing} color="#FF9800" />
            <KpiCard title="Opt-in Fonctionnels" value={stats.optInRates.functional} color="#00A88B" />
            <KpiCard title="Total utilisateurs" value={stats.totalUsers} suffix="" color="#333" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Events by Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">\u00c9v\u00e9nements par type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.eventsByType.map(e => ({ ...e, count: parseInt(e.count) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="event_type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00A88B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Events by Actor Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition par acteur</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={actorPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {actorPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Tendance (30 derniers jours)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="given" name="Données" stroke="#00A88B" strokeWidth={2} />
                  <Line type="monotone" dataKey="updated" name="Mise à jour" stroke="#2196F3" strokeWidth={2} />
                  <Line type="monotone" dataKey="withdrawn" name="Retiré" stroke="#E74C3C" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Countries */}
          {stats.eventsByCountry.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Top pays</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.eventsByCountry.map(e => ({ ...e, count: parseInt(e.count) }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="country" width={60} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2196F3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
    </AdminLayout>
  );
};

export default ConsentDashboardPage;
