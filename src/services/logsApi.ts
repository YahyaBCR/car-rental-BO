/**
 * Logs API Service - Admin Back-Office
 */

import apiClient from './apiClient';

// ============================================
// Interfaces
// ============================================

export interface Log {
  id: string;
  user_id: string | null;
  admin_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  metadata: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_role?: string;
  admin_email?: string;
  admin_first_name?: string;
  admin_last_name?: string;
}

export interface LogsResponse {
  success: boolean;
  logs: Log[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LogDetailsResponse {
  success: boolean;
  log: Log;
}

export interface Statistics {
  total: number;
  bySeverity: Array<{ severity: string; count: number }>;
  byAction: Array<{ action: string; count: number }>;
  byEntityType: Array<{ entityType: string; count: number }>;
  failedLogins24h: number;
  timeline: Array<{ date: string; count: number }>;
}

export interface LogFilters {
  startDate?: string;
  endDate?: string;
  action?: string;
  severity?: string;
  entityType?: string;
  userId?: string;
  adminId?: string;
  search?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Get all logs with filters
 */
export const getLogs = async (
  page: number = 1,
  limit: number = 50,
  filters?: LogFilters
): Promise<LogsResponse> => {
  const response = await apiClient.get('/logs', {
    params: { page, limit, ...filters }
  });
  return response.data;
};

/**
 * Get log by ID
 */
export const getLogById = async (logId: string): Promise<LogDetailsResponse> => {
  const response = await apiClient.get(`/logs/${logId}`);
  return response.data;
};

/**
 * Get statistics
 */
export const getStatistics = async (
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; statistics: Statistics }> => {
  const response = await apiClient.get('/logs/statistics', {
    params: { startDate, endDate }
  });
  return response.data;
};

/**
 * Get unique actions
 */
export const getUniqueActions = async (): Promise<{ success: boolean; actions: string[] }> => {
  const response = await apiClient.get('/logs/actions');
  return response.data;
};

/**
 * Get unique entity types
 */
export const getUniqueEntityTypes = async (): Promise<{ success: boolean; entityTypes: string[] }> => {
  const response = await apiClient.get('/logs/entity-types');
  return response.data;
};

/**
 * Export logs to CSV
 */
export const exportLogs = async (filters?: LogFilters): Promise<void> => {
  const response = await apiClient.get('/logs/export', {
    params: filters,
    responseType: 'blob'
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Clean old logs
 */
export const cleanOldLogs = async (daysToKeep: number = 90): Promise<{ success: boolean; message: string; deletedCount: number }> => {
  const response = await apiClient.post('/logs/clean', { daysToKeep });
  return response.data;
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get severity color
 */
export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    info: '#3B82F6',
    warning: '#F59E0B',
    error: '#EF4444',
    critical: '#7F1D1D'
  };
  return colors[severity] || '#6B7280';
};

/**
 * Get severity label
 */
export const getSeverityLabel = (severity: string): string => {
  const labels: Record<string, string> = {
    info: 'Info',
    warning: 'Attention',
    error: 'Erreur',
    critical: 'Critique'
  };
  return labels[severity] || severity;
};

/**
 * Get severity icon
 */
export const getSeverityIcon = (severity: string): string => {
  const icons: Record<string, string> = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    critical: '🚨'
  };
  return icons[severity] || '📋';
};

/**
 * Get action category from action string
 */
export const getActionCategory = (action: string): string => {
  const parts = action.split('.');
  return parts[0] || 'unknown';
};

/**
 * Get action label
 */
export const getActionLabel = (action: string): string => {
  // Convert action like "auth.login.success" to "Connexion réussie"
  const actionMap: Record<string, string> = {
    'auth.login.success': 'Connexion réussie',
    'auth.login.failed': 'Tentative de connexion échouée',
    'auth.logout': 'Déconnexion',
    'auth.password.reset': 'Réinitialisation mot de passe',
    'user.create': 'Création utilisateur',
    'user.update': 'Modification utilisateur',
    'user.delete': 'Suppression utilisateur',
    'user.block': 'Blocage utilisateur',
    'user.unblock': 'Déblocage utilisateur',
    'booking.create': 'Création réservation',
    'booking.update': 'Modification réservation',
    'booking.cancel': 'Annulation réservation',
    'booking.accept': 'Acceptation réservation',
    'booking.reject': 'Rejet réservation',
    'payment.success': 'Paiement réussi',
    'payment.failed': 'Paiement échoué',
    'payment.refund': 'Remboursement',
    'car.create': 'Ajout véhicule',
    'car.update': 'Modification véhicule',
    'car.delete': 'Suppression véhicule',
    'admin.settings.update': 'Modification paramètres',
    'system.logs.initialized': 'Initialisation logs'
  };

  return actionMap[action] || action;
};

export const logsApi = {
  getLogs,
  getLogById,
  getStatistics,
  getUniqueActions,
  getUniqueEntityTypes,
  exportLogs,
  cleanOldLogs
};

export default logsApi;
