/**
 * Payment Types
 */

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: 'card' | 'cash' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
  booking?: any;
}

export interface PaymentData {
  bookingId: string;
  amount: number;
  paymentMethod: 'card' | 'cash' | 'wallet';
  cardDetails?: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  payment?: Payment;
  transactionId?: string;
}
