import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track refresh state to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors with refresh token support
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - attempt refresh before redirecting
    if (error.response?.status === 401 && !originalRequest._retry) {
      const storedRefreshToken = localStorage.getItem('admin_refreshToken');

      if (!storedRefreshToken) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          originalRequest._retry = true;
          return apiClient(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Use a standalone axios call to avoid interceptor loops
        const baseUrl = API_BASE.replace(/\/api$/, '');
        const response = await axios.post(`${baseUrl}/api/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('admin_token', newToken);
        localStorage.setItem('admin_refreshToken', newRefreshToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refreshToken');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      toast.error('Accès refusé. Permissions insuffisantes.');
    }

    // Handle 500 - Server error
    if (error.response?.status === 500) {
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
