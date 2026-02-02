/**
 * Main Layout Component
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isBookingPage = location.pathname.includes('/booking/');
  const isPaymentPage = location.pathname.includes('/payment/');
  const isBookingDetailsPage = location.pathname.includes('/client/bookings/') || location.pathname.includes('/owner/bookings/');
  const isBookingsListPage = location.pathname === '/client/bookings' || location.pathname === '/owner/bookings';
  const isPaymentHistoryPage = location.pathname === '/client/payments';
  const isCarDetailsPage = location.pathname.includes('/cars/');

  // Hide footer on mobile booking wizard, payment page, booking details, bookings list, payment history, and car details
  const showFooter = !(isMobile && (isBookingPage || isPaymentPage || isBookingDetailsPage || isBookingsListPage || isPaymentHistoryPage || isCarDetailsPage));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
