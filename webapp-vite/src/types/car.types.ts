/**
 * Car Types
 */

export interface CarOwner {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  totalCars?: number;
  totalBookings?: number;
  joinedDate?: string;
}

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country?: string;
  deliveryFee?: number;
  is_active?: boolean;
}

export interface CarPricing {
  basePrice: number;
  deliveryFee: number;
  totalPrice: number;
  depositAmount: number;
  days: number;
  pricePerDay: number;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  type?: string;
  fuelType?: string;
  fuel_type?: string;
  transmission?: string;
  seats?: number;
  pricePerDay?: number;
  price_per_day?: number;
  plateNumber?: string;
  plate_number?: string;
  location?: string;
  description?: string;
  images?: string[];
  image_urls?: string[];
  features?: string[];
  rating?: number;
  reviewCount?: number;
  review_count?: number;
  owner?: CarOwner;
  airport?: Airport;
  pricing?: CarPricing;
  availability?: {
    startDate?: string;
    start_date?: string;
    endDate?: string;
    end_date?: string;
    isAvailable?: boolean;
    is_available?: boolean;
    checkedAt?: string;
    checked_at?: string;
    days?: number;
  };
  depositAmount?: number;
  deposit_amount?: number;
  minRentalDays?: number;
  min_rental_days?: number;
  isBookable?: boolean;
  is_bookable?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface SearchFilters {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  airportId?: string;
  cityId?: string;
  type?: string;
  transmission?: string;
  fuelType?: string;
  minSeats?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'year';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  cars: Car[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCars: number;
    limit: number;
  };
}

export interface CreateCarData {
  brand: string;
  model: string;
  year: number;
  color: string;  // Required by backend
  plateNumber: string;
  pricePerDay: number;
  description?: string;
  type?: string;  // Vehicle type (berline, suv, etc.)
  fuelType?: string;
  transmission?: string;
  seats?: number;
  isAvailable?: boolean;  // Car availability status
  imageUrls?: string[];  // Optional array of image URLs
  airportFees?: Record<string, number>;  // Optional { airportId: deliveryFee }
}
