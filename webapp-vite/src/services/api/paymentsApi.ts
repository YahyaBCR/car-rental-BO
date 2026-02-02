/**
 * Payments API Service
 */

import { apiClient } from '../apiClient';

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentMethod: 'card' | 'bank_transfer';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  transferReference?: string;
  currency?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  booking?: any;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  payment?: Payment;
  transactionId?: string;
}

export const paymentsApi = {
  /**
   * Process payment for a booking
   */
  async processPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>(
      '/api/payments/process',
      paymentData
    );
    return response.data;
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const response = await apiClient.get<{ success: boolean; payments: Payment[] }>(
      '/api/payments/history'
    );
    return response.data.payments || [];
  },

  /**
   * Get payment details
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<{ success: boolean; payment: Payment }>(
      `/api/payments/${paymentId}`
    );
    return response.data.payment;
  },
};
