/**
 * Booking Types
 */

import type { Car } from './car.types';
import type { User } from './auth.types';

export type BookingStatus =
  | 'pending_owner'      // En attente de validation du propriétaire (3h max)
  | 'waiting_payment'    // En attente de paiement (owner a accepté, 1h max)
  | 'confirmed'          // Payée, en attente de livraison
  | 'in_progress'        // Location en cours (véhicule livré avec code)
  | 'completed'          // Terminée (véhicule retourné)
  | 'rejected'           // Refusée par le propriétaire
  | 'expired_owner'      // Deadline propriétaire expirée (3h dépassées)
  | 'expired_payment'    // Deadline paiement expirée (1h dépassée)
  | 'cancelled';         // Annulée par le client

export interface Booking {
  id: string;
  carId?: string;
  car_id?: string;
  clientId?: string;
  client_id?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  status: BookingStatus;
  totalPrice?: number;
  total_price?: string;
  deliveryFee?: number;
  delivery_fee?: string;
  depositAmount?: number;
  deposit_amount?: string;
  deliveryCode?: string;
  delivery_code?: string;
  returnCode?: string;
  return_code?: string;
  pickupLocation?: string;
  pickup_airport_id?: string;
  pickup_airport?: {
    code: string;
    name: string;
    city: string;
  };
  pickup_city_id?: string;
  pickup_city?: {
    name: string;
    region: string;
  };
  returnLocation?: string;
  dropoffLocation?: string;
  dropoff_airport_id?: string;
  dropoff_airport?: {
    code: string;
    name: string;
    city: string;
  };
  dropoff_city_id?: string;
  dropoff_city?: {
    name: string;
    region: string;
  };
  notes?: string;
  car?: Car;
  client?: User;
  owner?: User;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  confirmedAt?: string;
  confirmed_at?: string;
  pricePerDay?: number;
  price_per_day?: string;
}

export interface CreateBookingData {
  carId: string;
  startDate: string;
  endDate: string;
  pickupAirportId?: string;
  dropoffAirportId?: string;
  pickupCityId?: string;
  dropoffCityId?: string;
  clientPhone: string;
  clientAge: number;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  booking?: Booking;
}

export interface BookingListResponse {
  success: boolean;
  bookings: Booking[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
    limit: number;
  };
}

export interface UpdateBookingStatusData {
  status: BookingStatus;
  reason?: string;
}
