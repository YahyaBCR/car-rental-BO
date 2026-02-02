import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShield, FaClock, FaLock, FaPhone, FaEnvelope, FaComments, FaStar, FaDownload, FaChevronDown } from 'react-icons/fa6';
import { bookingsApi } from '../../services/api/bookingsApi';
import { messagingApi } from '../../services/api/messagingApi';
import { reviewsApi } from '../../services/api/reviewsApi';
import { invoicesApi } from '../../services/api/invoicesApi';
import type { Booking } from '../../types/booking.types';
import { FlitCarColors } from '../../constants/colors';
import { useAppSelector } from '../../hooks/useRedux';
import { toast } from 'react-toastify';
import { AddReviewModal } from '../../components/reviews/AddReviewModal';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { formatMAD } from '../../utils/currencyUtils';
import { RefundPolicyCard } from '../../components/RefundPolicyCard';
import { useTranslation } from 'react-i18next';

const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { formatPrice } = useCurrencyFormat();
  const { t, i18n } = useTranslation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryCode, setDeliveryCode] = useState<string>('');
  const [codeInput, setCodeInput] = useState<string>('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasInvoice, setHasInvoice] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Accordion states for mobile
  const [isCarInfoOpen, setIsCarInfoOpen] = useState(true);
  const [isBookingInfoOpen, setIsBookingInfoOpen] = useState(true);
  const [isClientInfoOpen, setIsClientInfoOpen] = useState(true);
  const [isOwnerInfoOpen, setIsOwnerInfoOpen] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(true);

  const isOwner = user?.role === 'owner';
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to format price based on user role
  // Owners always see MAD, clients see converted currency
  const displayPrice = (amount: number) => {
    return isOwner ? formatMAD(amount) : formatPrice(amount);
  };

  useEffect(() => {
    if (id) {
      loadBooking(id);
    }
  }, [id]);

  // SLA Timer Effect
  useEffect(() => {
    if (!booking) return;

    // Only show timer for pending_owner or waiting_payment statuses
    if (booking.status !== 'pending_owner' && booking.status !== 'waiting_payment') {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      let deadline: string | null = null;

      if (booking.status === 'pending_owner') {
        deadline = (booking as any).owner_response_deadline || (booking as any).ownerResponseDeadline;
      } else if (booking.status === 'waiting_payment') {
        deadline = (booking as any).payment_deadline || (booking as any).paymentDeadline;
      }

      if (!deadline) return null;

      const deadlineTime = new Date(deadline).getTime();
      const now = Date.now();
      const remaining = deadlineTime - now;

      return remaining > 0 ? remaining : 0;
    };

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      if (remaining !== null) {
        setTimeRemaining(remaining);

        if (remaining === 0) {
          toast.warning(t('bookings.details.deadlineExpired'));
          setTimeout(() => loadBooking(booking.id), 2000);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const loadBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const bookingData = await bookingsApi.getBookingDetails(bookingId);
      console.log('Booking details loaded:', bookingData);
      setBooking(bookingData);

      // Load delivery code for client if booking is confirmed or in_progress
      if (!isOwner && (bookingData.status === 'confirmed' || bookingData.status === 'in_progress')) {
        try {
          const codeData = await bookingsApi.getDeliveryCode(bookingId);
          setDeliveryCode(codeData.deliveryCode);
        } catch (error) {
          console.error('Error loading delivery code:', error);
        }
      }

      // Check if client can review (only for completed bookings)
      if (!isOwner && bookingData.status === 'completed') {
        try {
          const reviewData = await reviewsApi.canReview(bookingId);
          setCanReview(reviewData.canReview);
        } catch (error) {
          console.error('Error checking review eligibility:', error);
        }
      }

      // Check if invoice is available (for confirmed, in_progress, or completed bookings)
      if (bookingData.status === 'confirmed' || bookingData.status === 'in_progress' || bookingData.status === 'completed') {
        try {
          const invoiceData = await invoicesApi.getInvoiceDetails(bookingId);
          setHasInvoice(invoiceData.hasInvoice);
        } catch (error) {
          console.error('Error checking invoice availability:', error);
          setHasInvoice(false);
        }
      }
    } catch (error: any) {
      console.error('Error loading booking:', error);
      toast.error(error.response?.data?.message || t('bookings.details.loadError'));
      navigate(isOwner ? '/owner/bookings' : '/client/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!booking) return;

    try {
      await bookingsApi.acceptBooking(booking.id);
      toast.success(t('bookings.details.confirmSuccess'));
      loadBooking(booking.id);
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      toast.error(error.response?.data?.message || t('bookings.details.confirmError'));
    }
  };

  const handleReject = async () => {
    if (!booking) return;

    if (!window.confirm(t('bookings.details.rejectConfirm'))) {
      return;
    }

    try {
      await bookingsApi.rejectBooking(booking.id);
      toast.success(t('bookings.details.rejectSuccess'));
      loadBooking(booking.id);
    } catch (error: any) {
      console.error('Error rejecting booking:', error);
      toast.error(error.response?.data?.message || t('bookings.details.rejectError'));
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    if (!window.confirm(t('bookings.details.cancelConfirm'))) {
      return;
    }

    try {
      await bookingsApi.cancelBooking(booking.id);
      toast.success(t('bookings.details.cancelSuccess'));
      loadBooking(booking.id);
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || t('bookings.details.cancelError'));
    }
  };

  const handleValidateCode = async () => {
    if (!booking || !codeInput) return;

    if (codeInput.length !== 11 || !codeInput.match(/^[A-Z]{3}-\d{3}-[A-Z]{3}$/)) {
      toast.error(t('bookings.details.codeInvalidFormat'));
      return;
    }

    try {
      setValidatingCode(true);
      await bookingsApi.validateDeliveryCode(booking.id, codeInput);
      toast.success(t('bookings.details.codeValidated'));
      loadBooking(booking.id);
      setCodeInput('');
    } catch (error: any) {
      console.error('Error validating code:', error);
      toast.error(error.response?.data?.message || t('bookings.details.codeInvalid'));
    } finally {
      setValidatingCode(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking) return;

    try {
      setDownloadingInvoice(true);
      // Pass current language for invoice translation
      await invoicesApi.downloadInvoice(booking.id, i18n.language);
      toast.success(t('bookings.details.invoiceDownloaded'));
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      // Map backend error messages to translation keys
      const backendMessage = error.response?.data?.message;
      let errorMessage = t('bookings.details.invoiceError');
      if (backendMessage === 'Invoice not generated yet') {
        errorMessage = t('bookings.details.invoiceNotGenerated');
      }
      toast.error(errorMessage);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleOpenMessaging = async () => {
    if (!booking) return;

    try {
      // Create or get conversation
      const conversation = await messagingApi.getOrCreateConversation({ bookingId: booking.id });
      navigate(`/messaging/${conversation.id}`);
    } catch (error: any) {
      console.error('Error opening messaging:', error);
      toast.error(error.response?.data?.message || t('bookings.details.messagingError'));
    }
  };

  const handleReviewSuccess = () => {
    toast.success(t('bookings.details.reviewSuccess'));
    setCanReview(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_payment':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired_owner':
      case 'expired_payment':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending_owner': 'pendingOwner',
      'waiting_payment': 'waitingPayment',
      'confirmed': 'confirmedLabel',
      'in_progress': 'inProgress',
      'completed': 'completed',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'expired_owner': 'expiredValidation',
      'expired_payment': 'expiredPayment'
    };
    const mappedStatus = statusMap[status] || status;
    return t(`bookings.status.${mappedStatus}`);
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}min ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}min ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const car = booking.car;
  const depositAmount = Number(booking.depositAmount || booking.deposit_amount || car?.depositAmount || car?.deposit_amount || 0);
  const pricePerDay = Number(booking.pricePerDay || booking.price_per_day || car?.pricePerDay || car?.price_per_day || 0);
  const startDate = booking.startDate || booking.start_date || '';
  const endDate = booking.endDate || booking.end_date || '';
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = Number(booking.totalPrice || booking.total_price || 0);
  const onlinePaymentAmount = Number((booking as any).onlinePaymentAmount || (booking as any).online_payment_amount || 0);
  const ownerPaymentAmount = Number((booking as any).ownerPaymentAmount || (booking as any).owner_payment_amount || 0);
  const deliveryFee = Number(booking.deliveryFee || booking.delivery_fee || 0);
  const subtotal = pricePerDay * days;
  const pickupAirport = booking.pickup_airport;
  const pickupCity = booking.pickup_city;
  const dropoffCity = booking.dropoff_city;
  const client = booking.client;
  const clientFirstName = client?.firstName || client?.first_name || '';
  const clientLastName = client?.lastName || client?.last_name || '';

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <div className="container mx-auto px-3 py-4 lg:px-4 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 lg:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-textSecondary hover:text-primary mb-3 lg:mb-4 text-sm"
            >
              ← {t('common.back')}
            </button>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h1 className="text-xl lg:text-3xl font-black text-textPrimary mb-1 lg:mb-2">{t('bookings.details.title')}</h1>
                <p className="text-sm lg:text-base text-textSecondary">#{booking.id.slice(0, 8)}</p>
              </div>
              <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold self-start lg:self-auto ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
            </div>
          </div>

          {/* SLA Timer Banner */}
          {timeRemaining !== null && (booking.status === 'pending_owner' || booking.status === 'waiting_payment') && (
            <div className={`mb-4 lg:mb-6 rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-sm ${
              timeRemaining < 600000 ? 'bg-red-50 border-2 border-red-300' : 'bg-yellow-50 border-2 border-yellow-300'
            }`}>
              <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-3">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <FaClock className={`text-lg lg:text-2xl ${timeRemaining < 600000 ? 'text-red-600' : 'text-yellow-600'}`} />
                  <div>
                    <h3 className={`text-sm lg:text-lg font-bold ${timeRemaining < 600000 ? 'text-red-900' : 'text-yellow-900'}`}>
                      {booking.status === 'pending_owner'
                        ? (isOwner ? t('bookings.details.timer.timeRemaining') : t('bookings.details.timer.awaitingValidation'))
                        : t('bookings.details.timer.timeRemaining')}
                    </h3>
                    <p className={`text-xs lg:text-sm ${timeRemaining < 600000 ? 'text-red-700' : 'text-yellow-700'}`}>
                      {timeRemaining < 600000
                        ? t('bookings.details.timer.deadlineExpiring')
                        : booking.status === 'pending_owner'
                          ? isOwner
                            ? t('bookings.details.timer.acceptOrReject')
                            : t('bookings.details.timer.ownerWillRespond')
                          : t('bookings.details.timer.finalizePayment')}
                    </p>
                  </div>
                </div>
                <div className={`text-2xl lg:text-4xl font-black ${timeRemaining < 600000 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
            </div>
          )}

          {/* Car Information */}
          {car && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm mb-4 lg:mb-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsCarInfoOpen(!isCarInfoOpen)}
              >
                <h2 className="text-base lg:text-xl font-bold text-textPrimary">{t('bookings.details.vehicle')}</h2>
                {isMobile && (
                  <FaChevronDown
                    className={`text-gray-400 transition-transform ${isCarInfoOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {(isCarInfoOpen || !isMobile) && (
                <div className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-6 mt-3 lg:mt-4">
                {((car.images && car.images.length > 0) || (car.image_urls && car.image_urls.length > 0)) && (
                  <img
                    src={(car.images && car.images[0]) || (car.image_urls && car.image_urls[0]) || ''}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full lg:w-48 h-40 lg:h-32 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 w-full">
                  <h3 className="text-lg lg:text-2xl font-bold text-textPrimary mb-1 lg:mb-2">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-sm lg:text-base text-textSecondary mb-3 lg:mb-4">{car.year}</p>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    <div>
                      <p className="text-sm text-textSecondary">{t('bookings.details.transmission')}</p>
                      <p className="font-semibold capitalize">{car.transmission || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-textSecondary">{t('bookings.details.fuel')}</p>
                      <p className="font-semibold capitalize">{car.fuelType || car.fuel_type || 'N/A'}</p>
                    </div>
                    {car.seats && (
                      <div>
                        <p className="text-sm text-textSecondary">{t('bookings.details.seats')}</p>
                        <p className="font-semibold">{car.seats} {t('bookings.details.seats').toLowerCase()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-textSecondary">{t('bookings.details.location')}</p>
                      <p className="font-semibold">
                        {pickupAirport?.city || pickupAirport?.name || pickupCity?.name || car.location || car.airport?.city || car.airport?.name || t('bookings.details.notSpecified')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* Booking Information */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm mb-4 lg:mb-6">
            <div
              className="flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => isMobile && setIsBookingInfoOpen(!isBookingInfoOpen)}
            >
              <h2 className="text-base lg:text-xl font-bold text-textPrimary">{t('bookings.details.bookingInfo')}</h2>
              {isMobile && (
                <FaChevronDown
                  className={`text-gray-400 transition-transform ${isBookingInfoOpen ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            {(isBookingInfoOpen || !isMobile) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-3 lg:mt-4">
              <div>
                <p className="text-xs lg:text-sm text-textSecondary mb-1">{t('bookings.details.startDate')}</p>
                <p className="font-semibold text-sm lg:text-lg">
                  📅 {new Date(startDate).toLocaleDateString(
                    i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-textSecondary mb-1">{t('bookings.details.endDate')}</p>
                <p className="font-semibold text-sm lg:text-lg">
                  📅 {new Date(endDate).toLocaleDateString(
                    i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-textSecondary mb-1">{t('bookings.details.duration')}</p>
                <p className="font-semibold text-sm lg:text-lg">{days} {days > 1 ? t('common.day_plural') : t('common.day')}</p>
              </div>
              <div>
                <p className="text-xs lg:text-sm text-textSecondary mb-1">{t('bookings.details.pricePerDay')}</p>
                <p className="font-semibold text-sm lg:text-lg">{displayPrice(pricePerDay)}</p>
              </div>
              {(booking.pickupLocation || booking.pickup_airport || booking.pickup_city) && (
                <div>
                  <p className="text-sm text-textSecondary mb-1">{t('bookings.details.pickupLocation')}</p>
                  <p className="font-semibold">
                    📍 {booking.pickupLocation || booking.pickup_airport?.name || booking.pickup_city?.name || 'N/A'}
                    {booking.pickup_city?.region && ` (${booking.pickup_city.region})`}
                  </p>
                </div>
              )}
              {(booking.dropoffLocation || booking.dropoff_airport || booking.dropoff_city) && (
                <div>
                  <p className="text-sm text-textSecondary mb-1">{t('bookings.details.dropoffLocation')}</p>
                  <p className="font-semibold">
                    📍 {booking.dropoffLocation || booking.dropoff_airport?.name || booking.dropoff_city?.name || 'N/A'}
                    {booking.dropoff_city?.region && ` (${booking.dropoff_city.region})`}
                  </p>
                </div>
              )}
              {booking.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-textSecondary mb-1">{t('bookings.details.notes')}</p>
                  <p className="font-semibold">{booking.notes}</p>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Client Information (for owners) */}
          {isOwner && client && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm mb-4 lg:mb-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsClientInfoOpen(!isClientInfoOpen)}
              >
                <h2 className="text-base lg:text-xl font-bold text-textPrimary">{t('bookings.details.client')}</h2>
                {isMobile && (
                  <FaChevronDown
                    className={`text-gray-400 transition-transform ${isClientInfoOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {(isClientInfoOpen || !isMobile) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 lg:mt-4">
                <div>
                  <p className="text-sm text-textSecondary mb-1">{t('bookings.details.name')}</p>
                  <p className="font-semibold">
                    {clientFirstName} {clientLastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-textSecondary mb-1">{t('bookings.details.email')}</p>
                  <p className="font-semibold">{client.email}</p>
                </div>
                {client.phone && (
                  <div>
                    <p className="text-sm text-textSecondary mb-1">{t('bookings.details.phone')}</p>
                    <p className="font-semibold">{client.phone}</p>
                  </div>
                )}
              </div>
              )}
            </div>
          )}

          {/* Owner Information (for clients) - Locked until payment */}
          {!isOwner && booking.owner && (
            <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm mb-4 lg:mb-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsOwnerInfoOpen(!isOwnerInfoOpen)}
              >
                <h2 className="text-base lg:text-xl font-bold text-textPrimary">{t('bookings.details.owner')}</h2>
                {isMobile && (
                  <FaChevronDown
                    className={`text-gray-400 transition-transform ${isOwnerInfoOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>

              {(isOwnerInfoOpen || !isMobile) && (
                <>
                  {booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed' ? (
                // Show full owner info after payment
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-textSecondary mb-1">{t('bookings.details.name')}</p>
                    <p className="font-semibold">
                      {(booking.owner as any).first_name || (booking.owner as any).firstName} {(booking.owner as any).last_name || (booking.owner as any).lastName}
                    </p>
                  </div>
                  {(booking.owner as any).phone && (
                    <div>
                      <p className="text-sm text-textSecondary mb-1">{t('bookings.details.phone')}</p>
                      <p className="font-semibold flex items-center gap-2">
                        <FaPhone style={{ color: FlitCarColors.primary }} />
                        {(booking.owner as any).phone}
                      </p>
                    </div>
                  )}
                  {(booking.owner as any).email && (
                    <div>
                      <p className="text-sm text-textSecondary mb-1">{t('bookings.details.email')}</p>
                      <p className="font-semibold flex items-center gap-2">
                        <FaEnvelope style={{ color: FlitCarColors.primary }} />
                        {(booking.owner as any).email}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Show locked message before payment
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <FaLock className="text-amber-600 mt-1 flex-shrink-0 text-xl" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">
                        {t('bookings.details.contactLocked')}
                      </p>
                      <p className="text-xs text-amber-700">
                        {t('bookings.details.contactLockedDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
                </>
              )}
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm mb-4 lg:mb-6">
            <div
              className="flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => isMobile && setIsPricingOpen(!isPricingOpen)}
            >
              <h2 className="text-base lg:text-xl font-bold text-textPrimary">{t('bookings.details.priceSummary')}</h2>
              {isMobile && (
                <FaChevronDown
                  className={`text-gray-400 transition-transform ${isPricingOpen ? 'rotate-180' : ''}`}
                />
              )}
            </div>
            {(isPricingOpen || !isMobile) && (
              <div className="space-y-4 mt-3 lg:mt-4">
              {/* Subtotal: Price per day × days */}
              <div className="flex justify-between text-textSecondary">
                <span>{displayPrice(pricePerDay)} × {days} {days > 1 ? t('common.day_plural') : t('common.day')}</span>
                <span>{displayPrice(subtotal)}</span>
              </div>

              {/* Delivery Fee if exists */}
              {deliveryFee > 0 && (
                <div className="flex justify-between text-textSecondary">
                  <span>{t('booking.deliveryFee')} ({pickupAirport?.name || booking.pickup_city?.name || t('booking.pickupLocation')})</span>
                  <span>{displayPrice(deliveryFee)}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between font-bold text-xl text-textPrimary pt-3 border-t">
                <span>{t('bookings.details.rentalTotal')}</span>
                <span style={{ color: FlitCarColors.primary }}>{displayPrice(totalPrice)}</span>
              </div>

              {/* Payment breakdown - only show if amounts are available */}
              {onlinePaymentAmount > 0 && (
                <div className="mt-6 space-y-3">
                  {isOwner ? (
                    <>
                      {/* Owner view - highlight their revenue */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">💰</span>
                            <span className="font-bold text-blue-900">{t('bookings.details.ownerRevenue')}</span>
                          </div>
                          <span className="text-2xl font-black text-blue-700">
                            {formatMAD(ownerPaymentAmount)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          {t('bookings.details.ownerRevenueDesc')}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🏢</span>
                            <span className="font-semibold text-gray-700">{t('bookings.details.flitcarCommission')}</span>
                          </div>
                          <span className="text-lg font-bold text-gray-600">
                            {formatMAD(totalPrice - ownerPaymentAmount)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'in_progress'
                            ? t('bookings.details.commissionWithheld')
                            : t('bookings.details.commissionWillBeWithheld')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Client view - highlight total paid online */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-green-900">{t('bookings.details.totalPrice')}</span>
                          </div>
                          <span className="text-2xl font-black text-green-700">
                            {formatPrice(totalPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-green-700">
                          {booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'in_progress'
                            ? t('bookings.details.paidViaFlitcar')
                            : t('bookings.details.toPayViaFlitcar')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Deposit info */}
              {depositAmount > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mt-3 border border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <FaShield className="text-yellow-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-yellow-900">{t('bookings.details.depositRefundable')}</p>
                        <span className="text-sm font-bold text-yellow-700">
                          {displayPrice(depositAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        {t('bookings.details.depositInfo')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Refund Policy */}
          {!isOwner && (booking.status === 'pending_owner' || booking.status === 'waiting_payment' || booking.status === 'confirmed') && (
            <RefundPolicyCard />
          )}

          {/* Delivery Code Section */}
          {deliveryCode && !isOwner && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm mb-4 lg:mb-6 border-2 border-blue-200">
              <h2 className="text-base lg:text-xl font-bold text-textPrimary mb-2 lg:mb-4">🔑 {t('bookings.details.deliveryCode')}</h2>
              <p className="text-xs lg:text-sm text-textSecondary mb-3 lg:mb-4">
                {t('bookings.details.deliveryCodeDesc')}
              </p>
              <div className="bg-white rounded-lg p-4 lg:p-6 text-center">
                <p className="text-3xl lg:text-5xl font-black text-primary tracking-wider mb-2" style={{ fontFamily: 'monospace' }}>
                  {deliveryCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(deliveryCode);
                    toast.success(t('bookings.details.codeCopied'));
                  }}
                  className="text-xs lg:text-sm text-primary hover:underline mt-2"
                >
                  📋 {t('bookings.details.copyCode')}
                </button>
              </div>
            </div>
          )}

          {/* Delivery Code Validation (Owner) */}
          {isOwner && booking.status === 'confirmed' && (() => {
            const bookingStartDate = new Date(startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            bookingStartDate.setHours(0, 0, 0, 0);
            const canValidate = bookingStartDate <= today;

            return (
              <div className={`bg-gradient-to-br rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm mb-4 lg:mb-6 border-2 ${
                canValidate
                  ? 'from-green-50 to-emerald-50 border-green-200'
                  : 'from-gray-50 to-gray-100 border-gray-300'
              }`}>
                <h2 className="text-base lg:text-xl font-bold text-textPrimary mb-3 lg:mb-4">
                  {canValidate ? `✓ ${t('bookings.details.validateDelivery')}` : `🔒 ${t('bookings.details.deliveryValidation')}`}
                </h2>

                {!canValidate ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 lg:p-4 rounded">
                    <p className="text-xs lg:text-sm font-semibold text-yellow-800 mb-1">
                      ⏰ {t('bookings.details.deliveryNotAvailable')}
                    </p>
                    <p className="text-xs lg:text-sm text-yellow-700">
                      {t('bookings.details.deliveryAvailableFrom')}{' '}
                      <span className="font-bold">{bookingStartDate.toLocaleDateString(
                        i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US'
                      )}</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs lg:text-sm text-textSecondary mb-3 lg:mb-4">
                      {t('bookings.details.deliveryCodePrompt')}
                    </p>
                    <div className="flex gap-2 lg:gap-3">
                      <input
                        type="text"
                        placeholder={t('bookings.details.codePlaceholder')}
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                        maxLength={11}
                        className="flex-1 px-3 lg:px-4 py-2 lg:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-base lg:text-xl font-bold tracking-wider"
                        style={{ fontFamily: 'monospace' }}
                      />
                      <button
                        onClick={handleValidateCode}
                        disabled={validatingCode || !codeInput}
                        className="px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: FlitCarColors.success }}
                      >
                        {validatingCode ? t('bookings.details.validating') : t('bookings.details.validate')}
                      </button>
                    </div>
                    <p className="text-xs text-textSecondary mt-2">
                      {t('bookings.details.codeFormat')}
                    </p>
                  </>
                )}
              </div>
            );
          })()}

          {/* Actions - Desktop Only */}
          <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-textPrimary mb-4">{t('bookings.details.actions')}</h2>
            <div className="flex flex-wrap gap-3">
              {/* Owner Actions */}
              {isOwner && booking.status === 'pending_owner' && (
                <>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: FlitCarColors.success }}
                  >
                    ✓ {t('bookings.details.acceptBooking')}
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: FlitCarColors.error }}
                  >
                    ✕ {t('bookings.details.reject')}
                  </button>
                </>
              )}

              {/* Client Actions */}
              {!isOwner && booking.status === 'waiting_payment' && (
                <button
                  onClick={() => navigate(`/payment/${booking.id}`)}
                  className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: FlitCarColors.success }}
                >
                  💳 {t('bookings.details.proceedToPayment')}
                </button>
              )}

              {!isOwner && (booking.status === 'pending_owner' || booking.status === 'waiting_payment') && (
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: FlitCarColors.error }}
                >
                  {t('bookings.cancelBooking')}
                </button>
              )}

              {/* Messaging Button - Available for confirmed/in_progress/completed bookings */}
              {(booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed') && (
                <button
                  onClick={handleOpenMessaging}
                  className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  <FaComments />
                  {t('bookings.details.messaging')}
                </button>
              )}

              {/* Review Button - Available for completed bookings if can review */}
              {!isOwner && booking.status === 'completed' && canReview && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: FlitCarColors.warning }}
                >
                  <FaStar />
                  {t('bookings.details.leaveReview')}
                </button>
              )}

              {/* Invoice Download Button - Available for confirmed, in_progress, and completed bookings */}
              {hasInvoice && (booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed') && (
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#059669' }}
                >
                  <FaDownload />
                  {downloadingInvoice ? t('bookings.details.downloading') : isOwner ? t('bookings.details.downloadStatement') : t('bookings.details.downloadInvoice')}
                </button>
              )}

              {(booking.status === 'cancelled' || booking.status === 'rejected' ||
                booking.status === 'expired_owner' || booking.status === 'expired_payment') && (
                <div className="w-full text-center text-textSecondary">
                  {t('bookings.details.noActionsAvailable')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sticky Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="px-4 py-3">
          <div className="flex gap-2">
            {/* Owner Actions */}
            {isOwner && booking.status === 'pending_owner' && (
              <>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ backgroundColor: FlitCarColors.success }}
                >
                  ✓ {t('bookings.details.accept')}
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ backgroundColor: FlitCarColors.error }}
                >
                  ✕ {t('bookings.details.reject')}
                </button>
              </>
            )}

            {/* Client Actions */}
            {!isOwner && booking.status === 'waiting_payment' && (
              <button
                onClick={() => navigate(`/payment/${booking.id}`)}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ backgroundColor: FlitCarColors.success }}
              >
                💳 {t('bookings.details.payNow')}
              </button>
            )}

            {!isOwner && (booking.status === 'pending_owner' || booking.status === 'waiting_payment') && (
              <button
                onClick={handleCancel}
                className={`${booking.status === 'waiting_payment' ? 'w-auto px-6' : 'flex-1'} py-3 rounded-xl font-bold text-white text-sm`}
                style={{ backgroundColor: FlitCarColors.error }}
              >
                {t('common.cancel')}
              </button>
            )}

            {/* Messaging Button */}
            {(booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed') && (
              <button
                onClick={handleOpenMessaging}
                className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                <FaComments />
                {t('bookings.details.message')}
              </button>
            )}

            {/* Review Button */}
            {!isOwner && booking.status === 'completed' && canReview && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: FlitCarColors.warning }}
              >
                <FaStar />
                {t('bookings.details.review')}
              </button>
            )}

            {/* Invoice Download Button */}
            {hasInvoice && (booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed') && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#059669' }}
              >
                <FaDownload />
                {downloadingInvoice ? '...' : t('bookings.details.invoice')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {car && (
        <AddReviewModal
          bookingId={booking.id}
          carBrand={car.brand}
          carModel={car.model}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default BookingDetailsPage;
