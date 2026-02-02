/**
 * Application Routes
 */

export const ROUTES = {
  // Public Routes
  HOME: '/',
  SEARCH: '/search',
  CAR_DETAILS: (id: string) => `/cars/${id}`,
  CGU: '/cgu',
  PRIVACY: '/privacy',
  ABOUT: '/about',

  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',

  // Client Routes
  PROFILE: '/profile',
  BOOKING: '/booking',
  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_BOOKINGS: '/client/bookings',
  CLIENT_BOOKING_DETAILS: (id: string) => `/client/bookings/${id}`,

  // Owner Routes
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_CARS: '/owner/cars',
  OWNER_ADD_CAR: '/owner/cars/add',
  OWNER_EDIT_CAR: (id: string) => `/owner/cars/edit/${id}`,
  OWNER_BOOKINGS: '/owner/bookings',
  OWNER_BOOKING_DETAILS: (id: string) => `/owner/bookings/${id}`,
  OWNER_STATS: '/owner/stats',
  OWNER_SETTINGS: '/owner/settings',
} as const;
