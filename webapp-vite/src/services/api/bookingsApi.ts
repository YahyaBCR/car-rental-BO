/**
 * Bookings API Service
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import type {
  Booking,
  CreateBookingData,
  BookingResponse,
  BookingListResponse,
  UpdateBookingStatusData,
} from '../../types/booking.types';
import type { Airport } from '../../types/car.types';

export const bookingsApi = {
  /**
   * Create new booking
   */
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await apiClient.post<BookingResponse>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      data
    );
    return response.data.booking!;
  },

  /**
   * Get client bookings
   */
  async getClientBookings(): Promise<Booking[]> {
    const response = await apiClient.get<BookingListResponse>(
      `${API_ENDPOINTS.BOOKINGS.CLIENT}?role=client`
    );
    return response.data.bookings;
  },

  /**
   * Get owner bookings
   */
  async getOwnerBookings(): Promise<Booking[]> {
    const response = await apiClient.get<BookingListResponse>(
      `${API_ENDPOINTS.BOOKINGS.OWNER}?role=owner`
    );
    return response.data.bookings;
  },

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string): Promise<Booking> {
    const response = await apiClient.get<{ success: boolean; booking: Booking }>(
      API_ENDPOINTS.BOOKINGS.DETAILS(bookingId)
    );
    return response.data.booking;
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    data: UpdateBookingStatusData
  ): Promise<Booking> {
    const response = await apiClient.patch<{ success: boolean; booking: Booking }>(
      API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(bookingId),
      data
    );
    return response.data.booking;
  },

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const response = await apiClient.patch<{ message: string; booking: Booking }>(
      API_ENDPOINTS.BOOKINGS.CANCEL(bookingId),
      { reason }
    );
    return response.data.booking;
  },

  /**
   * Accept booking (owner)
   */
  async acceptBooking(bookingId: string): Promise<Booking> {
    const response = await apiClient.put<{ message: string; booking: Booking }>(
      API_ENDPOINTS.BOOKINGS.ACCEPT(bookingId),
      {}  // Empty body required for backend to set req.body.status
    );
    return response.data.booking;
  },

  /**
   * Reject booking (owner)
   */
  async rejectBooking(bookingId: string, reason?: string): Promise<Booking> {
    const response = await apiClient.put<{ message: string; booking: Booking }>(
      API_ENDPOINTS.BOOKINGS.REJECT(bookingId),
      { reason }
    );
    return response.data.booking;
  },

  /**
   * Get airports list
   */
  async getAirports(): Promise<Airport[]> {
    const response = await apiClient.get<{ airports: Airport[] }>(
      API_ENDPOINTS.BOOKINGS.AIRPORTS
    );
    return response.data.airports;
  },

  /**
   * Get delivery code for booking (client)
   */
  async getDeliveryCode(bookingId: string): Promise<{ deliveryCode: string }> {
    const response = await apiClient.get<{ success: boolean; deliveryCode: string }>(
      API_ENDPOINTS.BOOKINGS.DELIVERY_CODE(bookingId)
    );
    return { deliveryCode: response.data.deliveryCode };
  },

  /**
   * Validate delivery code (owner)
   */
  async validateDeliveryCode(bookingId: string, code: string): Promise<Booking> {
    const response = await apiClient.post<{ success: boolean; booking: Booking; message: string }>(
      API_ENDPOINTS.BOOKINGS.VALIDATE_DELIVERY_CODE(bookingId),
      { code }
    );
    return response.data.booking;
  },

  /**
   * Get booked dates for a car (public)
   */
  async getCarBookedDates(carId: string): Promise<{ startDate: string; endDate: string }[]> {
    const response = await apiClient.get<{ bookedDates: { startDate: string; endDate: string }[] }>(
      `/api/bookings/cars/${carId}/booked-dates`
    );
    return response.data.bookedDates;
  },
};
