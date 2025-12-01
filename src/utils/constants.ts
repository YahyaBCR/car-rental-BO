export const FlitCarColors = {
  primary: '#FF6B35',
  primaryDark: '#E85A2A',
  secondary: '#004E89',
  accent: '#F77F00',
  success: '#06D6A0',
  warning: '#FFD60A',
  error: '#EF476F',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#2D3748',
  textSecondary: '#718096',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending_owner: 'En attente propriétaire',
  waiting_payment: 'En attente paiement',
  confirmed: 'Confirmée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  rejected: 'Rejetée',
  expired_owner: 'Délai propriétaire expiré',
  expired_payment: 'Délai paiement expiré',
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending_owner: 'warning',
  waiting_payment: 'warning',
  confirmed: 'success',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error',
  rejected: 'error',
  expired_owner: 'gray',
  expired_payment: 'gray',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  owner: 'Propriétaire',
  admin: 'Administrateur',
};

export const PAGINATION_DEFAULT = {
  page: 1,
  limit: 20,
};
