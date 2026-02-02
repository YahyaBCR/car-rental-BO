/**
 * API Client Configuration
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_CONFIG } from '../constants/apiConstants';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const requestUrl = config.url || '';
        const method = config.method?.toUpperCase();

        // Routes publiques qui ne nécessitent pas de token
        const publicRoutes = [
          '/api/cars/search',
          '/api/cars/all',
          '/api/airports',
          '/api/features',
          '/api/reviews/car/' // GET car reviews is public
        ];

        // Routes publiques avec pattern spécifique (uniquement pour GET)
        const publicRoutePatterns = [
          /^\/api\/cars\/[a-f0-9-]+$/i, // /api/cars/:id (UUID) - GET only
          /^\/api\/cars\/[a-f0-9-]+\/airport-fees$/i, // /api/cars/:id/airport-fees - GET only
          /^\/api\/cars\/[a-f0-9-]+\/location-fees$/i, // /api/cars/:id/location-fees - GET only
          /^\/api\/cars\/[a-f0-9-]+\/booked-dates$/i, // /api/cars/:id/booked-dates - GET only
        ];

        // Ne pas envoyer le token pour les routes publiques GET uniquement
        const isPublicRoute = publicRoutes.some(route => requestUrl.includes(route)) ||
                             (method === 'GET' && publicRoutePatterns.some(pattern => pattern.test(requestUrl)));

        if (!isPublicRoute) {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle blocked account (403 with isBlocked flag)
        if (error.response?.status === 403 && error.response?.data?.isBlocked) {
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Store blocked reason for display on login page
          const reason = error.response.data.reason || 'Votre compte a été bloqué';
          localStorage.setItem('blocked_reason', reason);

          // Redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        if (error.response?.status === 401) {
          const requestUrl = error.config?.url || '';
          const method = error.config?.method?.toUpperCase();

          // Routes publiques qui ne nécessitent pas de redirection
          const publicRoutes = [
            '/api/cars/search',
            '/api/cars/all',
            '/api/airports',
            '/api/features',
            '/api/reviews/car/'
          ];

          // Routes publiques avec pattern spécifique (uniquement pour GET)
          const publicRoutePatterns = [
            /^\/api\/cars\/[a-f0-9-]+$/i,
            /^\/api\/cars\/[a-f0-9-]+\/airport-fees$/i,
            /^\/api\/cars\/[a-f0-9-]+\/location-fees$/i,
            /^\/api\/cars\/[a-f0-9-]+\/booked-dates$/i,
          ];

          // Ne rediriger vers login que si ce n'est pas une route publique GET
          const isPublicRoute = publicRoutes.some(route => requestUrl.includes(route)) ||
                               (method === 'GET' && publicRoutePatterns.some(pattern => pattern.test(requestUrl)));

          if (!isPublicRoute) {
            // Token expired or invalid - only redirect for protected routes
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
