import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShield, FaChevronDown, FaCalendarDays } from 'react-icons/fa6';
import type { Car } from '../../types/car.types';
import { airportApi, type AirportFee, type LocationFee } from '../../services/api/airportApi';
import { bookingsApi } from '../../services/api/bookingsApi';
import { FlitCarColors } from '../../constants/colors';
import { useAppSelector } from '../../hooks/useRedux';
import { toast } from 'react-toastify';
import PhoneInput from '../../components/common/PhoneInput';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { RefundPolicyCard } from '../../components/RefundPolicyCard';
import { useTranslation } from 'react-i18next';
import MobileFullScreenDatePicker from '../../components/common/MobileFullScreenDatePicker';

interface MobileBookingWizardProps {
  car: Car;
  initialStartDate: string;
  initialEndDate: string;
  initialDays: number;
  initialTotalPrice: number;
  initialAirportId?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialDeliveryFee?: number;
}

const MobileBookingWizard: React.FC<MobileBookingWizardProps> = ({
  car,
  initialStartDate,
  initialEndDate,
  initialDays,
  initialTotalPrice,
  initialAirportId,
  initialStartTime,
  initialDeliveryFee,
}) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { formatPrice } = useCurrencyFormat();
  const { t, i18n } = useTranslation();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Booking Details
  const [dateValue, setDateValue] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: initialStartDate || null,
    endDate: initialEndDate || null
  });
  const [startTime, setStartTime] = useState(initialStartTime || '10:00');
  const [endTime, setEndTime] = useState(initialStartTime || '10:00');
  const [locationFees, setLocationFees] = useState<LocationFee[]>([]);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState<{ id: string; type: 'airport' | 'city'; code?: string; name: string; displayName: string; deliveryFee: number } | null>(null);
  const [selectedDropoffLocation, setSelectedDropoffLocation] = useState<{ id: string; type: 'airport' | 'city'; code?: string; name: string; displayName: string; deliveryFee: number } | null>(null);
  const [sameLocationForReturn, setSameLocationForReturn] = useState(true);
  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState(false);
  const [isDropoffDropdownOpen, setIsDropoffDropdownOpen] = useState(false);
  const [disabledDates, setDisabledDates] = useState<any>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Step 2: Client Info
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [clientAge, setClientAge] = useState<number>(25);
  const [notes, setNotes] = useState('');

  // Step 3: Summary
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [days, setDays] = useState(initialDays);
  const [deliveryFee, setDeliveryFee] = useState(Number(initialDeliveryFee) || 0);
  const [baseTotalPrice, setBaseTotalPrice] = useState(Number(initialTotalPrice) || 0);

  useEffect(() => {
    loadCarLocations();
    loadBookedDates();
  }, [car?.id, i18n.language]);

  useEffect(() => {
    if (user?.phone) {
      setClientPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (selectedPickupLocation) {
      setDeliveryFee(selectedPickupLocation.deliveryFee);
      // If same location for return is checked, sync dropoff
      if (sameLocationForReturn) {
        setSelectedDropoffLocation(selectedPickupLocation);
      }
    }
  }, [selectedPickupLocation, sameLocationForReturn]);

  useEffect(() => {
    if (dateValue.startDate && dateValue.endDate) {
      recalculatePricing();
    }
  }, [dateValue]);

  const loadCarLocations = async () => {
    try {
      const currentLang = i18n.language.split('-')[0];
      console.log('🟡 [MobileBookingWizard] Loading car locations with language:', currentLang);
      const locations = await airportApi.getCarLocationFees(car.id, currentLang);
      const availableLocations = locations.filter(loc => loc.is_available);
      setLocationFees(availableLocations);

      if (initialAirportId && availableLocations.length > 0) {
        const preselectedLocation = availableLocations.find(loc => loc.location_id === initialAirportId);
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
          setSelectedPickupLocation(location);
          setSelectedDropoffLocation(location);
        }
      }
    } catch (error) {
      console.error('Error loading car locations:', error);
      toast.error(t('errors.loadError'));
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
    const newDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDays(newDays);

    // Ensure price is a number
    const pricePerDay = Number(car.pricePerDay || car.price_per_day || 0);
    const newTotalPrice = newDays * pricePerDay;
    setBaseTotalPrice(newTotalPrice);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!dateValue.startDate || !dateValue.endDate) {
        toast.error(t('booking.errors.selectDates'));
        return;
      }
      if (!selectedPickupLocation) {
        toast.error(t('booking.errors.selectLocations'));
        return;
      }
      if (!sameLocationForReturn && !selectedDropoffLocation) {
        toast.error(t('booking.errors.selectPickupAndDropoff'));
        return;
      }
    }

    if (currentStep === 2) {
      if (!clientPhone) {
        toast.error(t('booking.errors.enterPhone'));
        return;
      }
      if (clientAge < 21) {
        toast.error(t('booking.errors.ageRange'));
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!acceptTerms) {
      toast.error(t('booking.errors.acceptTerms'));
      return;
    }

    if (!clientPhone || clientPhone.trim() === '') {
      toast.error(t('booking.errors.enterPhone'));
      return;
    }

    if (!selectedPickupLocation || !selectedDropoffLocation) {
      toast.error(t('booking.errors.selectLocations'));
      return;
    }

    try {
      setLoading(true);

      const dropoffLocation = sameLocationForReturn ? selectedPickupLocation : selectedDropoffLocation;

      // Format dates correctly (YYYY-MM-DD)
      const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Format phone number
      const cleanPhone = clientPhone.replace(/\s+/g, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

      const bookingData = {
        carId: car.id,
        startDate: `${formatDate(dateValue.startDate)}T${startTime}:00`,
        endDate: `${formatDate(dateValue.endDate)}T${endTime}:00`,
        pickupAirportId: selectedPickupLocation!.type === 'airport' ? selectedPickupLocation!.id : undefined,
        pickupCityId: selectedPickupLocation!.type === 'city' ? selectedPickupLocation!.id : undefined,
        dropoffAirportId: dropoffLocation!.type === 'airport' ? dropoffLocation!.id : undefined,
        dropoffCityId: dropoffLocation!.type === 'city' ? dropoffLocation!.id : undefined,
        notes,
        clientPhone: formattedPhone,
        clientAge: clientAge,
      };

      const booking = await bookingsApi.createBooking(bookingData);

      // Check if instant validation is enabled (status = waiting_payment)
      if (booking.status === 'waiting_payment') {
        toast.success(t('bookings.bookingConfirmed'));
        navigate(`/payment/${booking.id}`, {
          state: {
            booking,
            car,
            totalPrice: baseTotalPrice,
            deliveryFee: deliveryFee,
          },
        });
      } else {
        // Manual validation required (status = pending_owner)
        toast.success(t('bookings.status.awaitingOwnerValidation'));
        navigate(`/client/bookings/${booking.id}`);
      }
    } catch (error: any) {
      console.error('Create booking error:', error);
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

  // Ensure all values are proper numbers to avoid string concatenation
  const totalPrice = Number(baseTotalPrice) + Number(deliveryFee);
  const depositAmount = Number(car.depositAmount || car.deposit_amount || 0);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header with progress */}
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => currentStep === 1 ? navigate(-1) : handlePrevious()}
            className="flex items-center space-x-2 text-textSecondary hover:text-primary transition-colors mb-4"
          >
            <span>&larr;</span>
            <span>{currentStep === 1 ? t('common.back') : t('common.previous')}</span>
          </button>

          {/* Progress Bar - More Visible */}
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      currentStep >= step
                        ? 'text-white shadow-lg'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    style={currentStep >= step ? { backgroundColor: FlitCarColors.primary } : {}}
                  >
                    {step}
                  </div>
                  <span className={`text-xs mt-2 font-semibold ${currentStep >= step ? 'text-primary' : 'text-gray-400'}`}>
                    {step === 1 ? t('booking.steps.dates') : step === 2 ? t('booking.steps.info') : t('booking.steps.recap')}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-2 mx-3 rounded-full transition-all ${
                      currentStep > step ? 'bg-primary' : 'bg-gray-200'
                    }`}
                    style={currentStep > step ? { backgroundColor: FlitCarColors.primary } : {}}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          {/* Step 1: Booking Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-textPrimary">{t('booking.title')}</h2>

              {/* Date Pickers - Style Booking.com */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2" style={{ borderColor: '#febb02' }}>
                {/* Date de prise en charge + Heure */}
                <div className="flex border-b border-gray-200">
                  <div
                    className="flex-1 p-3 border-r border-gray-200 cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <label className="block text-xs text-gray-500 mb-1">{t('home.search.pickupDate')}</label>
                    <div className="flex items-center gap-2">
                      <FaCalendarDays className="text-gray-400 text-sm" />
                      <span className="text-sm font-bold text-gray-900">
                        {dateValue.startDate
                          ? new Date(dateValue.startDate).toLocaleDateString(
                              i18n.language.split('-')[0] === 'ar' ? 'ar-MA' : i18n.language.split('-')[0] === 'en' ? 'en-US' : 'fr-FR',
                              { weekday: 'short', day: 'numeric', month: 'short' }
                            )
                          : t('home.search.selectPickupDate')}
                      </span>
                    </div>
                  </div>
                  <div className="w-24 p-3">
                    <label className="block text-xs text-gray-500 mb-1">{t('home.search.time')}</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-sm font-bold text-gray-900 focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Date de restitution + Heure */}
                <div className="flex">
                  <div
                    className="flex-1 p-3 border-r border-gray-200 cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <label className="block text-xs text-gray-500 mb-1">{t('home.search.returnDate')}</label>
                    <div className="flex items-center gap-2">
                      <FaCalendarDays className="text-gray-400 text-sm" />
                      <span className="text-sm font-bold text-gray-900">
                        {dateValue.endDate
                          ? new Date(dateValue.endDate).toLocaleDateString(
                              i18n.language.split('-')[0] === 'ar' ? 'ar-MA' : i18n.language.split('-')[0] === 'en' ? 'en-US' : 'fr-FR',
                              { weekday: 'short', day: 'numeric', month: 'short' }
                            )
                          : t('home.search.selectReturnDate')}
                      </span>
                    </div>
                  </div>
                  <div className="w-24 p-3">
                    <label className="block text-xs text-gray-500 mb-1">{t('home.search.time')}</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-sm font-bold text-gray-900 focus:outline-none bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Full-Screen Date Picker Modal */}
              <MobileFullScreenDatePicker
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onConfirm={(start, end) => {
                  setDateValue({ startDate: start, endDate: end });
                  setIsDatePickerOpen(false);
                }}
                startDate={dateValue.startDate}
                endDate={dateValue.endDate}
                minDate={new Date()}
                disabledDates={disabledDates}
              />

              {/* Pickup Location */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-3">{t('booking.pickupLocation')}</label>
                <button
                  type="button"
                  onClick={() => setIsPickupDropdownOpen(!isPickupDropdownOpen)}
                  className="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-left"
                >
                  {selectedPickupLocation ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                          {selectedPickupLocation.code}
                        </div>
                        <div className="text-gray-900 font-semibold text-sm">{selectedPickupLocation.name}</div>
                      </div>
                      <FaChevronDown className={`transition-transform ${isPickupDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  ) : (
                    <span className="text-gray-500">{t('home.search.pickupLocation')}</span>
                  )}
                </button>

                {isPickupDropdownOpen && (
                  <div className="mt-2 max-h-64 overflow-y-auto bg-white rounded-xl border shadow-lg">
                    {locationFees.map((location) => {
                      const displayName = location.type === 'airport'
                        ? `${location.city} - ${location.name}`
                        : location.name || '';

                      return (
                        <button
                          key={location.location_id}
                          onClick={() => {
                            setSelectedPickupLocation({
                              id: location.location_id,
                              type: location.type,
                              code: location.code,
                              name: location.name || '',
                              displayName,
                              deliveryFee: location.delivery_fee
                            });
                            setIsPickupDropdownOpen(false);
                          }}
                          className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b"
                        >
                          <div className="flex items-center space-x-3">
                            {location.type === 'airport' && location.code && (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                                {location.code}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-sm">{location.name}</div>
                              {location.city && <div className="text-xs text-gray-500">{location.city}</div>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Same Location Checkbox */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameLocationForReturn}
                    onChange={(e) => setSameLocationForReturn(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {t('booking.pickupLocation')} = {t('booking.dropoffLocation')}
                  </span>
                </label>
              </div>

              {/* Dropoff Location - Conditional */}
              {!sameLocationForReturn && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <label className="block text-sm font-bold text-gray-900 mb-3">{t('booking.dropoffLocation')}</label>
                  <button
                    type="button"
                    onClick={() => setIsDropoffDropdownOpen(!isDropoffDropdownOpen)}
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-left"
                  >
                    {selectedDropoffLocation ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                            {selectedDropoffLocation.code}
                          </div>
                          <div className="text-gray-900 font-semibold text-sm">{selectedDropoffLocation.name}</div>
                        </div>
                        <FaChevronDown className={`transition-transform ${isDropoffDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    ) : (
                      <span className="text-gray-500">{t('home.search.dropoffLocation')}</span>
                    )}
                  </button>

                  {isDropoffDropdownOpen && (
                    <div className="mt-2 max-h-64 overflow-y-auto bg-white rounded-xl border shadow-lg">
                      {locationFees.map((location) => {
                        const displayName = location.type === 'airport'
                          ? `${location.city} - ${location.name}`
                          : location.name || '';

                        return (
                          <button
                            key={location.location_id}
                            onClick={() => {
                              setSelectedDropoffLocation({
                                id: location.location_id,
                                type: location.type,
                                code: location.code,
                                name: location.name || '',
                                displayName,
                                deliveryFee: location.delivery_fee
                              });
                              setIsDropoffDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b"
                          >
                            <div className="flex items-center space-x-3">
                              {location.type === 'airport' && location.code && (
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}>
                                  {location.code}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-sm">{location.name}</div>
                                {location.city && <div className="text-xs text-gray-500">{location.city}</div>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Client Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-textPrimary">{t('booking.driverInfo.title')}</h2>

              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                {/* Full Name - Read only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('booking.fullName')}</label>
                  <input
                    type="text"
                    value={`${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600"
                  />
                </div>

                {/* Email - Read only */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('booking.driverInfo.phone')}</label>
                  <PhoneInput value={clientPhone} onChange={setClientPhone} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('booking.driverInfo.age')}</label>
                  <input
                    type="number"
                    min="21"
                    max="99"
                    value={clientAge}
                    onChange={(e) => setClientAge(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('booking.additionalInfo')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary resize-none"
                    placeholder={t('booking.additionalInfo')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div className="space-y-6 pb-4">
              <h2 className="text-2xl font-bold text-textPrimary">{t('booking.summary')}</h2>

              {/* Car Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-3">{car.brand} {car.model}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-textSecondary">{days} {t('common.day', { count: days })}</span>
                    <span className="font-semibold">{formatPrice(baseTotalPrice)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-textSecondary">{t('booking.priceBreakdown.serviceFee')}</span>
                      <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold text-lg">
                    <span>{t('booking.priceBreakdown.total')}</span>
                    <span style={{ color: FlitCarColors.primary }}>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Deposit Info */}
              {depositAmount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <FaShield className="text-amber-600 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">{t('booking.termsAndConditions.deposit')}</p>
                      <p className="text-lg font-black text-amber-900">{formatPrice(depositAmount)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Policy */}
              <RefundPolicyCard compact />

              {/* Terms */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300"
                  />
                  <span className="text-sm text-textSecondary">
                    {t('booking.termsAndConditions.accept')}{' '}
                    <a href="/terms" className="hover:underline" style={{ color: FlitCarColors.primary }}>
                      {t('booking.termsAndConditions.terms')}
                    </a>{' '}
                    {t('booking.termsAndConditions.and')}{' '}
                    <a href="/privacy" className="hover:underline" style={{ color: FlitCarColors.primary }}>
                      {t('booking.termsAndConditions.privacy')}
                    </a>
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="bg-white border-t shadow-lg px-4 py-2 flex-shrink-0">
        <button
          onClick={currentStep === 3 ? handleSubmit : handleNext}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
        >
          {loading ? t('common.loading') : currentStep === 3 ? t('booking.confirmButton') : t('common.next')}
        </button>
      </div>
    </div>
  );
};

export default MobileBookingWizard;
