/**
 * Logs Management Page - Admin Back-Office
 * Système complet de logs avec stats, filtres, export
 */

import React, { useState, useEffect } from 'react';
import {
  FaSearch, FaFilter, FaDownload, FaTrash, FaEye,
  FaInfoCircle, FaExclamationTriangle, FaExclamationCircle, FaSkullCrossbones
} from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import logsApi, {
  Log,
  LogFilters,
  getSeverityColor,
  getSeverityLabel,
  getActionLabel,
  getSeverityIcon
} from '../../services/logsApi';
import { FlitCarColors } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [severity, setSeverity] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');

  // Filter options
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableEntityTypes, setAvailableEntityTypes] = useState<string[]>([]);

  useEffect(() => {
    loadLogs();
    loadFilterOptions();
  }, [page, severity, action, entityType]);

  useEffect(() => {
    loadStats();
  }, [startDate, endDate]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const filters: LogFilters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (severity) filters.severity = severity;
      if (action) filters.action = action;
      if (entityType) filters.entityType = entityType;
      if (search) filters.search = search;

      const response = await logsApi.getLogs(page, 50, filters);
      setLogs(response.logs);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Erreur lors du chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await logsApi.getStatistics(startDate, endDate);
      setStats(response.statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [actionsRes, typesRes] = await Promise.all([
        logsApi.getUniqueActions(),
        logsApi.getUniqueEntityTypes()
      ]);
      setAvailableActions(actionsRes.actions);
      setAvailableEntityTypes(typesRes.entityTypes);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const handleExport = async () => {
    try {
      const filters: LogFilters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (severity) filters.severity = severity;
      if (action) filters.action = action;
      if (entityType) filters.entityType = entityType;
      if (search) filters.search = search;

      await logsApi.exportLogs(filters);
      toast.success('Export CSV réussi');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleCleanOldLogs = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer tous les logs de plus de 90 jours ?')) {
      return;
    }

    try {
      const response = await logsApi.cleanOldLogs(90);
      toast.success(response.message);
      loadLogs();
      loadStats();
    } catch (error: any) {
      console.error('Error cleaning logs:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getSeverityStats = (sev: string): number => {
    if (!stats?.bySeverity) return 0;
    const found = stats.bySeverity.find((s: any) => s.severity === sev);
    return found ? found.count : 0;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Logs Système</h1>
            <p className="text-textSecondary">Audit et traçabilité des actions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleCleanOldLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaTrash />
              <span>Nettoyer (&gt;90j)</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Total</p>
                  <p className="text-3xl font-bold text-textPrimary">{stats.total}</p>
                </div>
                <FaInfoCircle className="text-4xl opacity-20" style={{ color: FlitCarColors.primary }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Info</p>
                  <p className="text-3xl font-bold" style={{ color: getSeverityColor('info') }}>
                    {getSeverityStats('info')}
                  </p>
                </div>
                <FaInfoCircle className="text-4xl opacity-20" style={{ color: getSeverityColor('info') }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Warnings</p>
                  <p className="text-3xl font-bold" style={{ color: getSeverityColor('warning') }}>
                    {getSeverityStats('warning')}
                  </p>
                </div>
                <FaExclamationTriangle className="text-4xl opacity-20" style={{ color: getSeverityColor('warning') }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Erreurs</p>
                  <p className="text-3xl font-bold" style={{ color: getSeverityColor('error') }}>
                    {getSeverityStats('error')}
                  </p>
                </div>
                <FaExclamationCircle className="text-4xl opacity-20" style={{ color: getSeverityColor('error') }} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary mb-1">Critique</p>
                  <p className="text-3xl font-bold" style={{ color: getSeverityColor('critical') }}>
                    {getSeverityStats('critical')}
                  </p>
                </div>
                <FaSkullCrossbones className="text-4xl opacity-20" style={{ color: getSeverityColor('critical') }} />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-textSecondary" />
            <span className="font-semibold text-textPrimary">Filtres</span>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">Date début</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">Date fin</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">Sévérité</label>
                <select
                  value={severity}
                  onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Toutes</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Erreur</option>
                  <option value="critical">Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">Action</label>
                <select
                  value={action}
                  onChange={(e) => { setAction(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Toutes</option>
                  {availableActions.map(act => (
                    <option key={act} value={act}>{getActionLabel(act)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">Type d'entité</label>
                <select
                  value={entityType}
                  onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Tous</option>
                  {availableEntityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher dans la description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg text-white font-semibold hover:shadow-lg transition-shadow"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                Rechercher
              </button>
            </div>
          </form>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-textPrimary">
              Logs ({total})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: FlitCarColors.primary }}></div>
              <p className="mt-4 text-textSecondary">Chargement...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-textSecondary">Aucun log trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Date/Heure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Sévérité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textPrimary">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-textPrimary">
                            {log.user_email || log.admin_email || 'Système'}
                          </div>
                          {(log.user_role || log.admin_email) && (
                            <div className="text-xs text-textSecondary">
                              {log.user_role || 'admin'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-textPrimary">
                            {getActionLabel(log.action)}
                          </span>
                          <div className="text-xs text-textSecondary">{log.action}</div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-textPrimary line-clamp-2">{log.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: getSeverityColor(log.severity) }}
                          >
                            <span className="mr-1">{getSeverityIcon(log.severity)}</span>
                            {getSeverityLabel(log.severity)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-primary hover:text-primary-dark font-semibold flex items-center"
                            style={{ color: FlitCarColors.primary }}
                          >
                            <FaEye className="mr-1" />
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-textPrimary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-textSecondary">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-textPrimary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-textPrimary">Détails du log</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-textSecondary hover:text-textPrimary text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-textSecondary mb-1">ID</p>
                    <p className="text-textPrimary font-mono text-xs">{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-textSecondary mb-1">Date/Heure</p>
                    <p className="text-textPrimary">{formatDateTime(selectedLog.created_at)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-textSecondary mb-1">Utilisateur</p>
                  <p className="text-textPrimary">
                    {selectedLog.user_first_name || selectedLog.admin_first_name || 'Système'}{' '}
                    {selectedLog.user_last_name || selectedLog.admin_last_name || ''}
                  </p>
                  <p className="text-sm text-textSecondary">{selectedLog.user_email || selectedLog.admin_email || ''}</p>
                </div>

                <div>
                  <p className="text-sm text-textSecondary mb-1">Action</p>
                  <p className="text-textPrimary font-medium">{getActionLabel(selectedLog.action)}</p>
                  <p className="text-xs text-textSecondary font-mono">{selectedLog.action}</p>
                </div>

                <div>
                  <p className="text-sm text-textSecondary mb-1">Description</p>
                  <p className="text-textPrimary">{selectedLog.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-textSecondary mb-1">Sévérité</p>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: getSeverityColor(selectedLog.severity) }}
                    >
                      {getSeverityIcon(selectedLog.severity)} {getSeverityLabel(selectedLog.severity)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-textSecondary mb-1">IP Address</p>
                    <p className="text-textPrimary font-mono text-sm">{selectedLog.ip_address || 'N/A'}</p>
                  </div>
                </div>

                {selectedLog.entity_type && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-textSecondary mb-1">Type d'entité</p>
                      <p className="text-textPrimary">{selectedLog.entity_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-textSecondary mb-1">ID de l'entité</p>
                      <p className="text-textPrimary font-mono text-xs">{selectedLog.entity_id}</p>
                    </div>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <p className="text-sm text-textSecondary mb-2">Métadonnées</p>
                    <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.user_agent && (
                  <div>
                    <p className="text-sm text-textSecondary mb-1">User Agent</p>
                    <p className="text-xs text-textPrimary font-mono break-all">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default LogsPage;
