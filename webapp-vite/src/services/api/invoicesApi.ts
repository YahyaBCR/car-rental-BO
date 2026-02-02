/**
 * Invoices API Service
 */

import apiClient from '../apiClient';

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceUrl: string;
  generatedAt: string;
  totalPrice: number;
  hasInvoice: boolean;
}

export interface UserInvoice {
  booking_id: string;
  invoice_number: string;
  invoice_generated_at: string;
  total_price: number;
  owner_payment_amount?: number;
  start_date: string;
  end_date: string;
  car_brand: string;
  car_model: string;
  client_first_name?: string;
  client_last_name?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  payment_currency?: string;
}

export interface UserInvoicesResponse {
  invoices: UserInvoice[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminInvoice {
  booking_id: string;
  invoice_number: string;
  invoice_generated_at: string;
  total_price: number;
  booking_status: string;
  start_date: string;
  end_date: string;
  car_brand: string;
  car_model: string;
  client_first_name: string;
  client_last_name: string;
  client_email: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  payment_currency?: string;
}

export interface AdminInvoicesResponse {
  invoices: AdminInvoice[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get invoice details for a booking
 */
export const getInvoiceDetails = async (bookingId: string): Promise<InvoiceDetails> => {
  const response = await apiClient.get(`/api/bookings/${bookingId}/invoice/details`);
  return response.data;
};

/**
 * Download invoice PDF for a booking
 * @param bookingId - The booking ID
 * @param language - Optional language code (fr, en, ar) for the invoice
 */
export const downloadInvoice = async (bookingId: string, language?: string): Promise<void> => {
  const params = language ? { lang: language } : {};
  const response = await apiClient.get(`/api/bookings/${bookingId}/invoice`, {
    responseType: 'blob',
    params
  });

  // Create blob link to download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers['content-disposition'];
  let fileName = 'facture.pdf';

  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = fileNameMatch[1].replace(/['"]/g, '');
    }
  }

  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Get user invoice history (client or owner)
 */
export const getUserInvoices = async (page: number = 1, limit: number = 10): Promise<UserInvoicesResponse> => {
  const response = await apiClient.get(`/api/invoices/my-invoices`, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * List all invoices (admin only)
 */
export const listAllInvoices = async (page: number = 1, limit: number = 20, search: string = ''): Promise<AdminInvoicesResponse> => {
  const response = await apiClient.get(`/api/admin/invoices`, {
    params: { page, limit, search }
  });
  return response.data;
};

/**
 * Regenerate invoice (admin only)
 */
export const regenerateInvoice = async (bookingId: string, isOwner: boolean = false): Promise<{ message: string; invoice: InvoiceDetails }> => {
  const response = await apiClient.post(`/api/admin/bookings/${bookingId}/invoice/regenerate`, {
    isOwner
  });
  return response.data;
};

/**
 * Generate invoice manually (admin only)
 */
export const generateInvoiceManually = async (bookingId: string, isOwner: boolean = false): Promise<{ message: string; invoice: InvoiceDetails }> => {
  const response = await apiClient.post(`/api/admin/bookings/${bookingId}/invoice`, {
    isOwner
  });
  return response.data;
};

export const invoicesApi = {
  getInvoiceDetails,
  downloadInvoice,
  getUserInvoices,
  listAllInvoices,
  regenerateInvoice,
  generateInvoiceManually
};

export default invoicesApi;
