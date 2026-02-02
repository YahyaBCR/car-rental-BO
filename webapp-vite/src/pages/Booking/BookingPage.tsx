import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaShield } from 'react-icons/fa6';
import { FaChevronDown } from 'react-icons/fa6';
import Datepicker from 'react-tailwindcss-datepicker';
import type { Car } from '../../types/car.types';
import { bookingsApi } from '../../services/api/bookingsApi';
import { airportApi, type AirportFee, type LocationFee } from '../../services/api/airportApi';
import { FlitCarColors } from '../../constants/colors';
import { useAppSelector } from '../../hooks/useRedux';
import { toast } from 'react-toastify';
import PhoneInput from '../../components/common/PhoneInput';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { useUnavailableDates } from '../../hooks/useUnavailableDates';
import { RefundPolicyCard } from '../../components/RefundPolicyCard';
import MobileBookingWizard from './MobileBookingWizard';
import ManualValidationModal from '../../components/booking/ManualValidationModal';
import { useTranslation } from 'react-i18next';

interface LocationState {
  car: Car;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  airportId?: string;
  cityId?: string;
  deliveryFee?: number;
  days: number;
  totalPrice: number; // Sous-total sans deliveryFee
}

const BookingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const { user } = useAppSelector((state) => state.auth);
  const { formatPrice } = useCurrencyFormat();

  const state = location.state as LocationState;
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [notes, setNotes] = useState('');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [clientAge, setClientAge] = useState<number>(25);
  const [locationFees, setLocationFees] = useState<LocationFee[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<{ id: string; type: 'airport' | 'city'; code?: string; name: string; displayName: string; deliveryFee: number } | null>(null);
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState<{ id: string; type: 'airport' | 'city'; code?: string; name: string; displayName: string; deliveryFee: number } | null>(null);
  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState(false);
  const [isDropoffDropdownOpen, setIsDropoffDropdownOpen] = useState(false);
  // const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(parseFloat(String(state?.deliveryFee || 0)));
  const [isEditingBookingDetails, setIsEditingBookingDetails] = useState(false);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [disabledDates, setDisabledDates] = useState<any>([]);
  const [dateValue, setDateValue] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: state?.startDate || null,
    endDate: state?.endDate || null
  });
  const [showManualValidationModal, setShowManualValidationModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  // Booking details from state
  const [car] = useState<Car>(state?.car);
  const [startDate, setStartDate] = useState(state?.startDate);
  const [endDate, setEndDate] = useState(state?.endDate);
  const [days, setDays] = useState(parseInt(String(state?.days || 0)));
  const [baseTotalPrice, setBaseTotalPrice] = useState(parseFloat(String(state?.totalPrice || 0)));

  const [acceptTerms, setAcceptTerms] = useState(false);

  // CAHIER DES CHARGES: Hook pour récupérer les dates indisponibles
  const { unavailablePeriods, isDateUnavailable, hasOverlap } = useUnavailableDates(car?.id);

  useEffect(() => {
    console.log('📦 BookingPage: Received state from navigation:', state);
    if (!state || !state.car) {
      navigate('/search');
    } else {
      // Recalculer le prix au chargement pour s'assurer qu'il est correct
      const pricePerDay = parseFloat(String(state.car.pricePerDay || state.car.price_per_day || 0));
      const calculatedPrice = parseInt(String(state.days || 0)) * pricePerDay;
      setBaseTotalPrice(calculatedPrice);
    }
  }, [state, navigate]);

  useEffect(() => {
    if (user?.phone) {
      setClientPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    loadCarLocations();
    loadBookedDates();
  }, [car?.id]);

  useEffect(() => {
    // Load delivery fee when location is selected
    if (selectedPickupLocation) {
      setDeliveryFee(parseFloat(String(selectedPickupLocation.deliveryFee || 0)));
    }
  }, [selectedPickupLocation]);

  useEffect(() => {
    // Recalculate when dates change in edit mode
    if (isEditingBookingDetails && dateValue.startDate && dateValue.endDate) {
      recalculatePricing();
    }
  }, [dateValue, isEditingBookingDetails]);

  const loadCarLocations = async () => {
    try {
      const currentLang = i18n.language.split('-')[0];
      console.log('🟡 [BookingPage] Loading car locations with language:', currentLang);
      const locations = await airportApi.getCarLocationFees(car.id, currentLang);
      const availableLocations = locations.filter(loc => loc.is_available);
      setLocationFees(availableLocations);

      console.log('📍 Available locations for booking:', availableLocations);
      console.log('📍 State from navigation:', { airportId: state?.airportId, cityId: state?.cityId });

      // Pré-sélectionner le lieu passé depuis la page précédente (CarDetailsPage ou SearchPage)
      if (state?.airportId || state?.cityId) {
        const preselectedLocation = availableLocations.find(loc =>
          loc.location_id === (state.airportId || state.cityId)
        );

        if (preselectedLocation) {
          const displayName = preselectedLocation.type === 'airport'
            ? `${preselectedLocation.city} - ${preselectedLocation.name}`
            : preselectedLocation.name || '';

          const location = {
            id: preselectedLocation.location_id,
            type: preselectedLocation.type,
            code: preselectedLocation.code,
            name: preselectedLocation.name || '',
            displayName,
            deliveryFee: preselectedLocation.delivery_fee
          };

          console.log('✅ Pre-selecting location from state:', location);
          setSelectedPickupLocation(location);
          setSelectedDropoffLocation(location);
          setDeliveryFee(preselectedLocation.delivery_fee);
          return;
        }
      }

      // Sinon, pré-sélectionner le premier lieu disponible
      if (availableLocations.length > 0) {
        const firstLocation = availableLocations[0];
        const displayName = firstLocation.type === 'airport'
          ? `${firstLocation.city} - ${firstLocation.name}`
          : firstLocation.name || '';

        const location = {
          id: firstLocation.location_id,
          type: firstLocation.type,
          code: firstLocation.code,
          name: firstLocation.name || '',
          displayName,
          deliveryFee: firstLocation.delivery_fee
        };

        console.log('ℹ️ No location in state, using first available:', location);
        setSelectedPickupLocation(location);
        setSelectedDropoffLocation(location);
        setDeliveryFee(firstLocation.delivery_fee);
      }
    } catch (error) {
      console.error('Error loading car locations:', error);
      toast.error(t('booking.errors.loadLocationsError'));
    }
  };

  const loadBookedDates = async () => {
    try {
      const bookedDates = await bookingsApi.getCarBookedDates(car.id);
      const allDisabledDates: { startDate: Date; endDate: Date }[] = [];

      bookedDates.forEach(({ startDate, endDate }) => {
        allDisabledDates.push({
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      });

      setDisabledDates(allDisabledDates as any);
    } catch (error) {
      console.error('Error loading booked dates:', error);
    }
  };

  const recalculatePricing = () => {
    if (!dateValue.startDate || !dateValue.endDate) return;

    const start = new Date(dateValue.startDate as string);
    const end = new Date(dateValue.endDate as string);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const pricePerDayNum = parseFloat(String(car.pricePerDay || car.price_per_day || 0));
    const calculatedPrice = diffDays * pricePerDayNum;

    setDays(diffDays);
    setStartDate(dateValue.startDate as string);
    setEndDate(dateValue.endDate as string);
    setBaseTotalPrice(calculatedPrice);
  };

  const handleSaveBookingDetails = () => {
    // Validate
    if (!dateValue.startDate || !dateValue.endDate) {
      toast.error(t('booking.errors.selectDates'));
      return;
    }

    if (!selectedPickupLocation || !selectedDropoffLocation) {
      toast.error(t('booking.errors.selectLocations'));
      return;
    }

    // CAHIER DES CHARGES: Vérification stricte du chevauchement
    const startDateObj = new Date(dateValue.startDate as string);
    const endDateObj = new Date(dateValue.endDate as string);

    if (hasOverlap(startDateObj, endDateObj)) {
      toast.error(t('booking.errors.unavailableDates'));
      return;
    }

    // Check minimum rental days
    const minRentalDays = car.minRentalDays || car.min_rental_days || 1;
    if (days < minRentalDays) {
      toast.error(t('booking.errors.minRentalDays', { days: minRentalDays }));
      return;
    }

    recalculatePricing();
    setIsEditingBookingDetails(false);
    toast.success(t('bookings.bookingDetailsUpdated'));
  };

  if (!car) {
    return null;
  }

  const pricePerDay = car.pricePerDay || car.price_per_day || 0;
  const depositAmount = car.depositAmount || car.deposit_amount || 0;
  // La caution n'est PAS incluse dans le paiement - elle sera payée à la livraison
  const grandTotal = parseFloat(String(baseTotalPrice)) + parseFloat(String(deliveryFee));

  const handleSubmitBooking = async () => {
    if (!acceptTerms) {
      toast.error(t('booking.errors.acceptTerms'));
      return;
    }

    if (!clientPhone || clientPhone.trim() === '') {
      toast.error(t('booking.errors.enterPhone'));
      return;
    }

    if (!clientAge || clientAge < 18 || clientAge > 100) {
      toast.error(t('booking.errors.ageRange'));
      return;
    }

    if (!selectedPickupLocation || !selectedDropoffLocation) {
      toast.error(t('booking.errors.selectPickupAndDropoff'));
      return;
    }

    // CAHIER DES CHARGES: Validation finale du chevauchement avant soumission
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (hasOverlap(startDateObj, endDateObj)) {
        toast.error(t('booking.errors.unavailableDatesModify'));
        return;
      }
    }

    // Nettoyer le numéro de téléphone (supprimer les espaces)
    const cleanPhone = clientPhone.replace(/\s+/g, '');
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

    const bookingData = {
      carId: car.id,
      startDate,
      endDate,
      ...(selectedPickupLocation.type === 'airport'
        ? { pickupAirportId: selectedPickupLocation.id }
        : { pickupCityId: selectedPickupLocation.id }),
      ...(selectedDropoffLocation.type === 'airport'
        ? { dropoffAirportId: selectedDropoffLocation.id }
        : { dropoffCityId: selectedDropoffLocation.id }),
      clientPhone: formattedPhone,
      clientAge,
      notes: notes || '',
    };

    /**
     * CAHIER DES CHARGES - Vérification du mode:
     * Mode 1 (instant_booking = true): Procéder directement
     * Mode 2 (instant_booking = false): Afficher popup obligatoire d'abord
     */
    const ownerInstantBooking = (car as any).owner_instant_booking;
    console.log('Owner instant booking setting:', ownerInstantBooking);

    if (ownerInstantBooking === false) {
      // Mode 2: Afficher popup obligatoire (empreinte bancaire)
      console.log('Mode 2: Affichage du popup de validation manuelle');
      setPendingBookingData(bookingData);
      setShowManualValidationModal(true);
      return;
    }

    // Mode 1: Procéder directement
    console.log('Mode 1: Réservation instantanée');
    await proceedWithBooking(bookingData);
  };

  const proceedWithBooking = async (bookingData: any) => {
    try {
      setLoading(true);
      setShowManualValidationModal(false);

      const booking = await bookingsApi.createBooking(bookingData);

      // Always redirect to payment page (both instant and manual validation)
      toast.success(t('bookings.bookingConfirmed'));
      navigate(`/payment/${booking.id}`, {
        state: {
          booking,
          car,
          totalPrice: baseTotalPrice,
          deliveryFee: deliveryFee,
        },
      });
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorData = error.response?.data;
      const errorCode = errorData?.code;
      const currentLang = i18n.language.split('-')[0];

      // Handle specific booking errors with multi-language messages
      if (errorCode === 'ACTIVE_BOOKING_EXISTS') {
        const message = currentLang === 'ar' ? errorData.message_ar :
                        currentLang === 'en' ? errorData.message_en :
                        errorData.message;
        toast.error(
          <div>
            <p className="font-bold mb-2">{message}</p>
            <button
              onClick={() => navigate(`/client/bookings/${errorData.activeBookingId}`)}
              className="text-sm underline text-blue-600 hover:text-blue-800"
            >
              {t('booking.errors.viewActiveBooking', 'Voir la réservation active')}
            </button>
          </div>,
          { autoClose: 10000 }
        );
      } else if (errorCode === 'OVERLAPPING_BOOKING') {
        const message = currentLang === 'ar' ? errorData.message_ar :
                        currentLang === 'en' ? errorData.message_en :
                        errorData.message;
        toast.error(
          <div>
            <p className="font-bold mb-2">{message}</p>
            <button
              onClick={() => navigate(`/client/bookings/${errorData.overlappingBookingId}`)}
              className="text-sm underline text-blue-600 hover:text-blue-800"
            >
              {t('booking.errors.viewOverlappingBooking', 'Voir la réservation existante')}
            </button>
          </div>,
          { autoClose: 10000 }
        );
      } else {
        toast.error(errorData?.message || t('booking.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmManualValidation = () => {
    if (pendingBookingData) {
      proceedWithBooking(pendingBookingData);
    }
  };

  const handleCancelManualValidation = () => {
    setShowManualValidationModal(false);
    setPendingBookingData(null);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md text-center">
          <div className="mb-6">
            <div className="text-6xl mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-4xl">✓</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-textPrimary mb-4">
            {t('booking.requestSent')}
          </h2>
          <p className="text-textSecondary mb-4">
            {t('booking.requestSentDescription')}
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>{t('booking.nextStep')}:</strong> {t('booking.ownerMustConfirm')}
            </p>
          </div>
          <button
            onClick={() => navigate('/client/bookings')}
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            {t('booking.viewMyBookings')}
          </button>
        </div>
      </div>
    );
  }

  // Mobile: Use wizard, Desktop: Use normal flow
  if (isMobile) {
    // Calculate price directly to avoid race condition with useEffect
    const pricePerDayForMobile = parseFloat(String(car?.pricePerDay || car?.price_per_day || 0));
    const calculatedTotalForMobile = days * pricePerDayForMobile;

    return (
      <MobileBookingWizard
        car={car}
        initialStartDate={startDate!}
        initialEndDate={endDate!}
        initialDays={days}
        initialTotalPrice={calculatedTotalForMobile}
        initialAirportId={state?.airportId}
        initialStartTime={state?.startTime}
        initialEndTime={state?.endTime}
        initialDeliveryFee={deliveryFee}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-textSecondary hover:text-primary"
          >
            <span>←</span>
            <span>{t('common.back')}</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-textPrimary mb-8">{t('booking.pageTitle')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Important Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>{t('booking.important')}:</strong> {t('booking.importantNotice')}
              </p>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-textPrimary mb-6">{t('booking.bookingDetails')}</h2>

              {/* User Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-textPrimary mb-4">{t('booking.yourInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('booking.fullName')}
                    </label>
                    <input
                      type="text"
                      value={`${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('booking.phoneRequired')}
                    </label>
                    <PhoneInput
                      value={clientPhone}
                      onChange={setClientPhone}
                      placeholder="6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('booking.ageRequired')}
                    </label>
                    <input
                      type="number"
                      value={clientAge}
                      onChange={(e) => setClientAge(parseInt(e.target.value) || 0)}
                      min="18"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-textSecondary mt-1">{t('booking.ageMin')}</p>
                  </div>
                </div>
              </div>

              {/* Dates et Aéroports */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-textPrimary">{t('booking.bookingDetails')}</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingBookingDetails(!isEditingBookingDetails)}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {isEditingBookingDetails ? t('common.cancel') : t('booking.modify')}
                  </button>
                </div>

                {!isEditingBookingDetails ? (
                  /* Mode lecture - grisé */
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    {/* Dates */}
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📅</span>
                          <div>
                            <p className="text-xs text-textSecondary">{t('home.search.pickupDate')}</p>
                            <p className="font-semibold text-textPrimary">{new Date(startDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">📅</span>
                          <div>
                            <p className="text-xs text-textSecondary">{t('home.search.returnDate')}</p>
                            <p className="font-semibold text-textPrimary">{new Date(endDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-textSecondary mt-2">
                        {t('booking.duration')}: <span className="font-semibold">{days} {t('common.day', { count: days })}</span>
                      </p>
                    </div>

                    {/* Locations */}
                    <div>
                      <p className="text-xs text-textSecondary mb-2">{t('booking.pickupAndDropoff')}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">✈️</span>
                          <div>
                            <p className="text-xs text-textSecondary">{t('booking.pickupLocationShort')}</p>
                            <p className="font-semibold text-textPrimary">
                              {selectedPickupLocation?.displayName || t('booking.notDefined')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">✈️</span>
                          <div>
                            <p className="text-xs text-textSecondary">{t('booking.dropoffLocationShort')}</p>
                            <p className="font-semibold text-textPrimary">
                              {selectedDropoffLocation?.displayName || t('booking.notDefined')}
                            </p>
                          </div>
                        </div>
                      </div>
                      {deliveryFee > 0 && (
                        <p className="text-sm text-textSecondary mt-2">
                          {t('booking.deliveryFeeAirport')}: <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Mode édition */
                  <div className="space-y-6">
                    {/* Date Pickers séparés */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-textPrimary mb-3">{t('home.search.pickupDate')}</label>
                        <Datepicker
                          value={{ startDate: dateValue.startDate as any, endDate: dateValue.startDate as any }}
                          onChange={(newValue: any) => setDateValue(prev => ({ ...prev, startDate: newValue?.startDate }))}
                          minDate={new Date()}
                          disabledDates={disabledDates}
                          primaryColor="teal"
                          placeholder={t('home.search.selectPickupDate')}
                          asSingle={true}
                          useRange={false}
                          displayFormat="DD/MM/YYYY"
                          i18n="fr"
                          inputClassName="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all"
                          containerClassName="relative"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-textPrimary mb-3">{t('home.search.returnDate')}</label>
                        <Datepicker
                          value={{ startDate: dateValue.endDate as any, endDate: dateValue.endDate as any }}
                          onChange={(newValue: any) => setDateValue(prev => ({ ...prev, endDate: newValue?.startDate }))}
                          minDate={dateValue.startDate ? new Date(dateValue.startDate) : new Date()}
                          disabledDates={disabledDates}
                          primaryColor="teal"
                          placeholder={t('home.search.selectReturnDate')}
                          asSingle={true}
                          useRange={false}
                          displayFormat="DD/MM/YYYY"
                          i18n="fr"
                          inputClassName="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all"
                          containerClassName="relative"
                        />
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">{t('home.search.pickupTime')}</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">{t('home.search.returnTime')}</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Lieu de Récupération avec dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-textPrimary mb-2">{t('booking.choosePickupLocation')}</label>
                      <button
                        type="button"
                        onClick={() => setIsPickupDropdownOpen(!isPickupDropdownOpen)}
                        className="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-left transition-all hover:bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {selectedPickupLocation && (
                            <>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                                {selectedPickupLocation.type === 'airport' ? selectedPickupLocation.code : selectedPickupLocation.name?.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-gray-900 font-semibold text-sm">{selectedPickupLocation.displayName}</span>
                            </>
                          )}
                          {!selectedPickupLocation && <span className="text-gray-500 font-medium">{t('booking.chooseLocation')}</span>}
                        </div>
                        <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isPickupDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isPickupDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                          <div className="max-h-64 overflow-y-auto">
                            {locationFees.map((loc) => (
                              <button
                                key={loc.location_id}
                                type="button"
                                onClick={() => {
                                  const displayName = loc.type === 'airport'
                                    ? `${loc.city} - ${loc.name}`
                                    : loc.name || '';
                                  setSelectedPickupLocation({
                                    id: loc.location_id,
                                    type: loc.type,
                                    code: loc.code,
                                    name: loc.name || '',
                                    displayName,
                                    deliveryFee: loc.delivery_fee
                                  });
                                  setIsPickupDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                                      {loc.type === 'airport' ? loc.code : loc.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <div className="font-semibold text-gray-900 text-sm">
                                          {loc.type === 'airport' ? loc.city : loc.name}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          loc.type === 'airport' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                          {loc.type === 'airport' ? t('booking.airport') : t('booking.city')}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {loc.type === 'airport' ? loc.name : `${loc.region} • ${loc.country}`}
                                      </div>
                                    </div>
                                  </div>
                                  {loc.delivery_fee > 0 && (
                                    <div className="text-xs font-semibold text-primary">+{formatPrice(loc.delivery_fee)}</div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lieu de Retour avec dropdown */}
                    <div className="relative">
                      <label className="block text-sm font-semibold text-textPrimary mb-2">{t('booking.chooseDropoffLocation')}</label>
                      <button
                        type="button"
                        onClick={() => setIsDropoffDropdownOpen(!isDropoffDropdownOpen)}
                        className="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-left transition-all hover:bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {selectedDropoffLocation && (
                            <>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                                {selectedDropoffLocation.type === 'airport' ? selectedDropoffLocation.code : selectedDropoffLocation.name?.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-gray-900 font-semibold text-sm">{selectedDropoffLocation.displayName}</span>
                            </>
                          )}
                          {!selectedDropoffLocation && <span className="text-gray-500 font-medium">{t('booking.chooseLocation')}</span>}
                        </div>
                        <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isDropoffDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isDropoffDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                          <div className="max-h-64 overflow-y-auto">
                            {locationFees.map((loc) => (
                              <button
                                key={loc.location_id}
                                type="button"
                                onClick={() => {
                                  const displayName = loc.type === 'airport'
                                    ? `${loc.city} - ${loc.name}`
                                    : loc.name || '';
                                  setSelectedDropoffLocation({
                                    id: loc.location_id,
                                    type: loc.type,
                                    code: loc.code,
                                    name: loc.name || '',
                                    displayName,
                                    deliveryFee: loc.delivery_fee
                                  });
                                  setIsDropoffDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                                      {loc.type === 'airport' ? loc.code : loc.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <div className="font-semibold text-gray-900 text-sm">
                                          {loc.type === 'airport' ? loc.city : loc.name}
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          loc.type === 'airport' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                          {loc.type === 'airport' ? t('booking.airport') : t('booking.city')}
                                        </span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {loc.type === 'airport' ? loc.name : `${loc.region} • ${loc.country}`}
                                      </div>
                                    </div>
                                  </div>
                                  {loc.delivery_fee > 0 && (
                                    <div className="text-xs font-semibold text-primary">+{formatPrice(loc.delivery_fee)}</div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bouton Enregistrer */}
                    <button
                      type="button"
                      onClick={handleSaveBookingDetails}
                      className="w-full py-3 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: FlitCarColors.primary }}
                    >
                      {t('booking.saveChanges')}
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  {t('booking.notesOptional')}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('booking.additionalInfo')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Refund Policy */}
              <div className="mb-6">
                <RefundPolicyCard compact />
              </div>

              {/* Terms */}
              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-textSecondary">
                    {t('booking.termsAndConditions.accept')}{' '}
                    <a href="/terms" className="text-primary hover:underline">
                      {t('booking.termsAndConditions.terms')}
                    </a>{' '}
                    {t('booking.termsAndConditions.and')}{' '}
                    <a href="/privacy" className="text-primary hover:underline">
                      {t('booking.termsAndConditions.privacy')}
                    </a>
                  </span>
                </label>
              </div>

              <button
                onClick={handleSubmitBooking}
                disabled={loading || !acceptTerms}
                className="w-full py-4 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                {loading ? t('common.loading') : t('booking.confirmButton')}
              </button>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-textPrimary mb-4">{t('booking.summary')}</h2>

              {/* Car Info */}
              <div className="mb-6 pb-6 border-b">
                {((car.images && car.images.length > 0) || (car.image_urls && car.image_urls.length > 0)) && (
                  <img
                    src={(car.images && car.images[0]) || (car.image_urls && car.image_urls[0]) || ''}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-40 rounded-lg object-cover mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-textPrimary">
                  {car.brand} {car.model}
                </h3>
                <p className="text-sm text-textSecondary">{car.year}</p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-bold text-textPrimary mb-3 uppercase tracking-wide">{t('booking.priceBreakdown.title')}</h3>

                <div className="flex justify-between items-center text-textSecondary">
                  <span className="text-sm">
                    {days} {t('common.day', { count: days })}
                  </span>
                  <span className="font-semibold text-sm">{formatPrice(baseTotalPrice)}</span>
                </div>

                {deliveryFee > 0 && (
                  <div className="flex justify-between items-center text-textSecondary">
                    <span className="text-sm">{t('booking.deliveryFeeAirport')}</span>
                    <span className="font-semibold text-sm">{formatPrice(deliveryFee)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-bold text-xl text-textPrimary pt-3 border-t-2" style={{ borderColor: FlitCarColors.primary }}>
                  <span>{t('booking.priceBreakdown.totalToPay')}</span>
                  <span style={{ color: FlitCarColors.primary }}>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Deposit Info - Completely Separate */}
              {depositAmount > 0 && (
                <div className="border-t-2 border-gray-200 pt-6 mt-6">
                  <h3 className="text-sm font-bold text-textPrimary mb-3 uppercase tracking-wide">{t('booking.deposit.title')}</h3>
                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-start space-x-3">
                      <FaShield className="text-blue-600 mt-1 text-xl" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-base font-bold text-blue-900">{t('booking.deposit.amount')}</p>
                          <p className="text-xl font-black text-blue-900">{formatPrice(depositAmount)}</p>
                        </div>
                        <p className="text-xs text-blue-700">
                          {t('booking.deposit.note')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  <strong>{t('booking.deposit.noteShort')}:</strong> {t('booking.deposit.paymentAfterConfirmation')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Validation Confirmation Modal */}
      <ManualValidationModal
        isOpen={showManualValidationModal}
        onConfirm={handleConfirmManualValidation}
        onCancel={handleCancelManualValidation}
      />
    </div>
  );
};

export default BookingPage;
