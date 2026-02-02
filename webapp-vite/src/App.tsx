/**
 * Main App Component - FlitCar Web
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { store } from './store/store';
import { ROUTES } from './constants/routes';
import { loadExchangeRates } from './store/slices/currencySlice';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import SearchPage from './pages/Search/SearchPage';
import CarDetailsPage from './pages/CarDetails/CarDetailsPage';
import BookingPage from './pages/Booking/BookingPage';
import BookingsPage from './pages/ClientDashboard/BookingsPage';
import BookingDetailsPage from './pages/BookingDetails/BookingDetailsPage';
import PaymentPage from './pages/Payment/PaymentPage';
import PaymentHistoryPage from './pages/Payment/PaymentHistoryPage';
import MyCarsPage from './pages/OwnerDashboard/MyCarsPage';
import CarFormPage from './pages/OwnerDashboard/CarFormPage';
import OwnerDashboardPage from './pages/OwnerDashboard/OwnerDashboardPage';
import OwnerBookingsPage from './pages/OwnerDashboard/OwnerBookingsPage';
import OwnerSettingsPage from './pages/OwnerDashboard/SettingsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import FavoritesPage from './pages/Favorites/FavoritesPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import MessagingPage from './pages/MessagingPage';
import ChatWindow from './pages/ChatWindow';
import ClientInvoiceHistoryPage from './pages/ClientDashboard/InvoiceHistoryPage';
import OwnerInvoiceHistoryPage from './pages/OwnerDashboard/InvoiceHistoryPage';
import AdminInvoicesManagementPage from './pages/Admin/InvoicesManagementPage';
import AdminSupportManagementPage from './pages/Admin/SupportManagementPage';
import TicketsListPage from './pages/Support/TicketsListPage';
import CreateTicketPage from './pages/Support/CreateTicketPage';
import TicketDetailsPage from './pages/Support/TicketDetailsPage';
import CGU from './pages/CGU';
import Privacy from './pages/Privacy';
import About from './pages/About';
import SettingsPage from './pages/Settings/SettingsPage';

// Components
import SupportChatWidget from './components/Support/SupportChatWidget';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Component to load currency rates
const CurrencyLoader: React.FC = () => {
  useEffect(() => {
    console.log('🚀 CurrencyLoader: Component mounted, dispatching loadExchangeRates...');
    console.log('📊 Current Redux state:', store.getState().currency);

    store.dispatch(loadExchangeRates()).then((result: any) => {
      console.log('✅ CurrencyLoader: loadExchangeRates completed', result);
      console.log('📊 Updated Redux state:', store.getState().currency);
    });

    // Refresh rates every 30 minutes
    const interval = setInterval(() => {
      console.log('🔄 CurrencyLoader: Refreshing rates (30min interval)');
      store.dispatch(loadExchangeRates());
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <CurrencyLoader />
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path={ROUTES.REGISTER} element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path={ROUTES.SEARCH} element={<SearchPage />} />
            <Route path="/cars/:id" element={<CarDetailsPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path={ROUTES.CGU} element={<CGU />} />
            <Route path={ROUTES.PRIVACY} element={<Privacy />} />
            <Route path={ROUTES.ABOUT} element={<About />} />

            {/* Client Routes - Protected */}
            <Route path="/client/home" element={<ProtectedRoute requiredRole="client"><Home /></ProtectedRoute>} />
            <Route path={ROUTES.CLIENT_BOOKINGS} element={<ProtectedRoute requiredRole="client"><BookingsPage /></ProtectedRoute>} />
            <Route path="/client/bookings/:id" element={<ProtectedRoute requiredRole="client"><BookingDetailsPage /></ProtectedRoute>} />
            <Route path="/payment/:id" element={<ProtectedRoute requiredRole="client"><PaymentPage /></ProtectedRoute>} />
            <Route path="/client/payments" element={<ProtectedRoute requiredRole="client"><PaymentHistoryPage /></ProtectedRoute>} />
            <Route path="/client/invoices" element={<ProtectedRoute requiredRole="client"><ClientInvoiceHistoryPage /></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* Messaging Routes - Protected (both client and owner) */}
            <Route path="/messaging" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
            <Route path="/messaging/:conversationId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />

            {/* Support Routes - Protected (both client and owner) */}
            <Route path="/support/tickets" element={<ProtectedRoute><TicketsListPage /></ProtectedRoute>} />
            <Route path="/support/tickets/new" element={<ProtectedRoute><CreateTicketPage /></ProtectedRoute>} />
            <Route path="/support/tickets/:ticketId" element={<ProtectedRoute><TicketDetailsPage /></ProtectedRoute>} />

            {/* Owner Routes - Protected */}
            <Route path={ROUTES.OWNER_DASHBOARD} element={<ProtectedRoute requiredRole="owner"><OwnerDashboardPage /></ProtectedRoute>} />
            <Route path={ROUTES.OWNER_CARS} element={<ProtectedRoute requiredRole="owner"><MyCarsPage /></ProtectedRoute>} />
            <Route path="/owner/cars/add" element={<ProtectedRoute requiredRole="owner"><CarFormPage /></ProtectedRoute>} />
            <Route path="/owner/cars/edit/:id" element={<ProtectedRoute requiredRole="owner"><CarFormPage /></ProtectedRoute>} />
            <Route path={ROUTES.OWNER_BOOKINGS} element={<ProtectedRoute requiredRole="owner"><OwnerBookingsPage /></ProtectedRoute>} />
            <Route path="/owner/bookings/:id" element={<ProtectedRoute requiredRole="owner"><BookingDetailsPage /></ProtectedRoute>} />
            <Route path="/owner/invoices" element={<ProtectedRoute requiredRole="owner"><OwnerInvoiceHistoryPage /></ProtectedRoute>} />
            <Route path={ROUTES.OWNER_SETTINGS} element={<ProtectedRoute requiredRole="owner"><OwnerSettingsPage /></ProtectedRoute>} />

            {/* Admin Routes - Protected */}
            <Route path="/admin/invoices" element={<ProtectedRoute requiredRole="admin"><AdminInvoicesManagementPage /></ProtectedRoute>} />
            <Route path="/admin/support" element={<ProtectedRoute requiredRole="admin"><AdminSupportManagementPage /></ProtectedRoute>} />
            <Route path="/admin/support/tickets/:ticketId" element={<ProtectedRoute requiredRole="admin"><TicketDetailsPage /></ProtectedRoute>} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
          </Layout>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

          {/* Support Chat Widget - Conditional */}
          <ConditionalSupportWidget />
      </Router>
    </Provider>
  );
};

// Wrapper component to conditionally show SupportChatWidget
const ConditionalSupportWidget: React.FC = () => {
  const location = useLocation();
  const isMobile = window.innerWidth < 1024;

  // On mobile: only show on home page
  // On desktop: show everywhere
  if (isMobile) {
    const isHomePage = location.pathname === '/' || location.pathname === '/client/home';
    if (!isHomePage) {
      return null;
    }
  }

  return <SupportChatWidget />;
};

export default App;
