import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('admin_user') || 'null'),
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;

      localStorage.setItem('admin_token', action.payload.token);
      localStorage.setItem('admin_user', JSON.stringify(action.payload.user));
      if (action.payload.refreshToken) {
        localStorage.setItem('admin_refreshToken', action.payload.refreshToken);
      }
    },
    loginFailure: (state) => {
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;

      // Revoke refresh token server-side (best-effort)
      const refreshToken = localStorage.getItem('admin_refreshToken');
      if (refreshToken) {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');
        fetch(`${baseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }

      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refreshToken');
      localStorage.removeItem('admin_user');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
