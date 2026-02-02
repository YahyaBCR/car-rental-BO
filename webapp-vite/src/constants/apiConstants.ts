/**
 * API Configuration Constants
 */

// Base URL - Use environment variable in production, fallback to localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
    LOGOUT: '/api/auth/logout',
  },

  // Cars
  CARS: {
    SEARCH: '/api/cars/search-available',
    ALL: '/api/cars/all',
    OWNER_CARS: '/api/cars/owner/my-cars',
    DETAILS: (id: string) => `/api/cars/${id}`,
    CREATE: '/api/cars',
    UPDATE: (id: string) => `/api/cars/${id}`,
    DELETE: (id: string) => `/api/cars/${id}`,
    AIRPORT_FEES: (id: string) => `/api/cars/${id}/airport-fees`,
  },

  // Bookings
  BOOKINGS: {
    CREATE: '/api/bookings',
    CLIENT: '/api/bookings',
    OWNER: '/api/bookings',
    DETAILS: (id: string) => `/api/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/api/bookings/${id}/status`,
    CANCEL: (id: string) => `/api/bookings/${id}/cancel`,
    ACCEPT: (id: string) => `/api/bookings/${id}/accept`,
    REJECT: (id: string) => `/api/bookings/${id}/reject`,
    AIRPORTS: '/api/bookings/airports',
    DELIVERY_CODE: (id: string) => `/api/bookings/${id}/delivery-code`,
    VALIDATE_DELIVERY_CODE: (id: string) => `/api/bookings/${id}/validate-delivery-code`,
  },

  // Locations (Airports & Cities)
  LOCATIONS: {
    ALL: '/api/locations/all',
    AIRPORTS: '/api/locations/airports',
    CITIES: '/api/locations/cities',
  },

  // Payments
  PAYMENTS: {
    PROCESS: '/api/payments/process',
    HISTORY: '/api/payments/history',
  },
} as const;

// Request Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
} as const;

// Image Upload
export const IMAGE_UPLOAD = {
  IMGBB_API_KEY: 'b7955243b3a176d16f44333c03391271',
  IMGBB_UPLOAD_URL: 'https://api.imgbb.com/1/upload',
} as const;
