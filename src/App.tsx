import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import './styles/globals.css';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UsersListPage from './pages/Users/UsersListPage';
import UserDetailsPage from './pages/Users/UserDetailsPage';
import AddOwnerPage from './pages/Users/AddOwnerPage';
import OwnerAirportsPage from './pages/Users/OwnerAirportsPage';
import CarsListPage from './pages/Cars/CarsListPage';
import CarDetailsPage from './pages/Cars/CarDetailsPage';
import BookingsListPage from './pages/Bookings/BookingsListPage';
import BookingDetailsPage from './pages/Bookings/BookingDetailsPage';
import FinancialPage from './pages/Financial/FinancialPage';
import AirportsPage from './pages/Airports/AirportsPage';
import ReviewsPage from './pages/Reviews/ReviewsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import SupportPage from './pages/Support/SupportPage';
import LogsPage from './pages/Logs/LogsPage';
import AdminUsersPage from './pages/AdminManagement/AdminUsersPage';
import AdminFormPage from './pages/AdminManagement/AdminFormPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('admin_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersListPage /></ProtectedRoute>} />
          <Route path="/users/add-owner" element={<ProtectedRoute><AddOwnerPage /></ProtectedRoute>} />
          <Route path="/users/:userId/airports" element={<ProtectedRoute><OwnerAirportsPage /></ProtectedRoute>} />
          <Route path="/users/:userId" element={<ProtectedRoute><UserDetailsPage /></ProtectedRoute>} />
          <Route path="/cars" element={<ProtectedRoute><CarsListPage /></ProtectedRoute>} />
          <Route path="/cars/:carId" element={<ProtectedRoute><CarDetailsPage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingsListPage /></ProtectedRoute>} />
          <Route path="/bookings/:bookingId" element={<ProtectedRoute><BookingDetailsPage /></ProtectedRoute>} />
          <Route path="/financial" element={<ProtectedRoute><FinancialPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route path="/messaging" element={<ProtectedRoute><PlaceholderPage title="Messagerie" description="Supervision des conversations" /></ProtectedRoute>} />
          <Route path="/airports" element={<ProtectedRoute><AirportsPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin-management" element={<ProtectedRoute><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin-management/add" element={<ProtectedRoute><AdminFormPage /></ProtectedRoute>} />
          <Route path="/admin-management/edit/:id" element={<ProtectedRoute><AdminFormPage /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
