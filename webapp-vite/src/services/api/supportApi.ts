/**
 * Support API Service
 */

import apiClient from '../apiClient';

// ============================================
// Interfaces
// ============================================

export interface SupportCategory {
  value: string;
  label: string;
  icon: string;
}

export interface CreateTicketData {
  category: string;
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  bookingId?: string;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  reply_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  uploaded_by_first_name: string;
  uploaded_by_last_name: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assigned_to: string | null;
  booking_id: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  user_phone?: string;
  user_role?: string;
  user_joined_at?: string;
  assigned_first_name?: string;
  assigned_last_name?: string;
  assigned_email?: string;
  reply_count?: number;
  last_reply_at?: string;
  booking_start_date?: string;
  booking_end_date?: string;
  booking_status?: string;
  car_brand?: string;
  car_model?: string;
  replies?: TicketReply[];
  attachments?: TicketAttachment[];
}

export interface TicketsResponse {
  success: boolean;
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketDetailsResponse {
  success: boolean;
  ticket: Ticket;
}

export interface AdminStats {
  byStatus: Array<{ status: string; count: string }>;
  byCategory: Array<{ category: string; count: string }>;
  byPriority: Array<{ priority: string; count: string }>;
  avgResponseTimeHours: number;
  avgResolutionTimeHours: number;
}

export interface Admin {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  active_tickets: number;
}

// ============================================
// User API Functions
// ============================================

/**
 * Create a new support ticket
 */
export const createTicket = async (data: CreateTicketData): Promise<{ success: boolean; message: string; ticket: Ticket }> => {
  const response = await apiClient.post('/api/support/tickets', data);
  return response.data;
};

/**
 * Get user's tickets
 */
export const getUserTickets = async (
  page: number = 1,
  limit: number = 10,
  filters?: { status?: string; category?: string }
): Promise<TicketsResponse> => {
  const response = await apiClient.get('/api/support/tickets', {
    params: { page, limit, ...filters }
  });
  return response.data;
};

/**
 * Get ticket details
 */
export const getTicketDetails = async (ticketId: string): Promise<TicketDetailsResponse> => {
  const response = await apiClient.get(`/api/support/tickets/${ticketId}`);
  return response.data;
};

/**
 * Add reply to ticket
 */
export const addReply = async (
  ticketId: string,
  message: string,
  isInternalNote: boolean = false
): Promise<{ success: boolean; message: string; reply: TicketReply }> => {
  const response = await apiClient.post(`/api/support/tickets/${ticketId}/replies`, {
    message,
    isInternalNote
  });
  return response.data;
};

/**
 * Close a ticket
 */
export const closeTicket = async (ticketId: string): Promise<{ success: boolean; message: string; ticket: Ticket }> => {
  const response = await apiClient.post(`/api/support/tickets/${ticketId}/close`);
  return response.data;
};

/**
 * Get support categories
 */
export const getCategories = async (): Promise<{ success: boolean; categories: SupportCategory[] }> => {
  const response = await apiClient.get('/api/support/categories');
  return response.data;
};

// ============================================
// Admin API Functions
// ============================================

/**
 * Get all tickets (admin)
 */
export const getAllTickets = async (
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
  }
): Promise<TicketsResponse> => {
  const response = await apiClient.get('/api/support/admin/tickets', {
    params: { page, limit, ...filters }
  });
  return response.data;
};

/**
 * Update ticket status (admin)
 */
export const updateTicketStatus = async (
  ticketId: string,
  status: string
): Promise<{ success: boolean; message: string; ticket: Ticket }> => {
  const response = await apiClient.put(`/api/support/admin/tickets/${ticketId}/status`, { status });
  return response.data;
};

/**
 * Update ticket priority (admin)
 */
export const updateTicketPriority = async (
  ticketId: string,
  priority: string
): Promise<{ success: boolean; message: string; ticket: Ticket }> => {
  const response = await apiClient.put(`/api/support/admin/tickets/${ticketId}/priority`, { priority });
  return response.data;
};

/**
 * Assign ticket to admin (admin)
 */
export const assignTicket = async (
  ticketId: string,
  adminId: string | null
): Promise<{ success: boolean; message: string; ticket: Ticket }> => {
  const response = await apiClient.post(`/api/support/admin/tickets/${ticketId}/assign`, { adminId });
  return response.data;
};

/**
 * Get support statistics (admin)
 */
export const getStatistics = async (): Promise<{ success: boolean; statistics: AdminStats }> => {
  const response = await apiClient.get('/api/support/admin/statistics');
  return response.data;
};

/**
 * Get available admins (admin)
 */
export const getAvailableAdmins = async (): Promise<{ success: boolean; admins: Admin[] }> => {
  const response = await apiClient.get('/api/support/admin/admins');
  return response.data;
};

// ============================================
// Utility Functions
// ============================================

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    open: '#10B981',
    in_progress: '#3B82F6',
    waiting_user: '#F59E0B',
    resolved: '#8B5CF6',
    closed: '#6B7280'
  };
  return colors[status] || '#6B7280';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    urgent: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#84CC16'
  };
  return colors[priority] || '#EAB308';
};

/**
 * Get status label
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    waiting_user: 'En attente',
    resolved: 'Résolu',
    closed: 'Fermé'
  };
  return labels[status] || status;
};

/**
 * Get priority label
 */
export const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    urgent: 'Urgent',
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse'
  };
  return labels[priority] || priority;
};

export const supportApi = {
  createTicket,
  getUserTickets,
  getTicketDetails,
  addReply,
  closeTicket,
  getCategories,
  getAllTickets,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  getStatistics,
  getAvailableAdmins,
  getStatusColor,
  getPriorityColor,
  getStatusLabel,
  getPriorityLabel
};

export default supportApi;
