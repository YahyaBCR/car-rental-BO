/**
 * Car Details Page - Booking.com Style with FLIT Colors
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Datepicker from 'react-tailwindcss-datepicker';
import {
  IoLocationOutline,
  IoStarSharp,
  IoCheckmarkCircle,
  IoChevronBack,
  IoPeopleOutline,
  IoSpeedometerOutline,
  IoCarSportOutline,
  IoCalendarOutline,
  IoColorPaletteOutline,
  IoShieldCheckmarkOutline,
  IoHeartOutline,
  IoChevronDown,
  IoChevronForward,
  IoClose
} from 'react-icons/io5';
import { FaGasPump } from 'react-icons/fa6';
import type { Car, Airport } from '../../types/car.types';
import { carsApi } from '../../services/api/carsApi';
import { featuresApi, type Feature } from '../../services/api/featuresApi';
import { airportApi, type LocationFee } from '../../services/api/airportApi';
import { bookingsApi } from '../../services/api/bookingsApi';
import { FlitCarColors } from '../../constants/colors';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';
import { useAppSelector } from '../../hooks/useRedux';

const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrencyFormat();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Get search params passed from SearchPage
  const navigationState = location.state as {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    location?: { id: string; type: 'airport' | 'city'; name: string; city?: string; code?: string };
  } | null;

  const [car, setCar] = useState<Car | null>(null);
  const [carFeatures, setCarFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mobile accordion states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true);
  const [isOwnerOpen, setIsOwnerOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);

  // Location autocomplete - both airports and cities where car is available
  const [locationFees, setLocationFees] = useState<LocationFee[]>([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; type: 'airport' | 'city'; code?: string; name: string; displayName: string; deliveryFee: number } | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Booking dates
  const [dateValue, setDateValue] = useState<{startDate: Date | null, endDate: Date | null}>({
    startDate: null,
    endDate: null
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [disabledDates, setDisabledDates] = useState<any>([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      loadCarDetails(id);
      loadCarLocations(id);
      loadBookedDates(id);
    }

    // Use dates from navigation state if available, otherwise default (today + 3 days)
    if (navigationState?.startDate && navigationState?.endDate) {
      setDateValue({
        startDate: new Date(navigationState.startDate),
        endDate: new Date(navigationState.endDate)
      });
      if (navigationState.startTime) setStartTime(navigationState.startTime);
      if (navigationState.endTime) setEndTime(navigationState.endTime);
    } else {
      const today = new Date();
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      setDateValue({
        startDate: today,
        endDate: threeDaysLater
      });
    }

    // Set location from navigation state if available
    if (navigationState?.location) {
      const loc = navigationState.location;
      const displayName = loc.type === 'airport'
        ? `${loc.city} - ${loc.name}`
        : loc.name;
      setSelectedLocation({
        id: loc.id,
        type: loc.type,
        code: loc.code,
        name: loc.name,
        displayName,
        deliveryFee: 0 // Will be updated when locationFees are loaded
      });
      setLocationSearchQuery(displayName);
    }
  }, [id, i18n.language]); // Reload when language changes

  const loadCarLocations = async (carId: string) => {
    try {
      // Normalize language to 2-letter code (ar-MA -> ar, en-US -> en)
      const currentLang = i18n.language.split('-')[0];
      console.log('🌍 Loading car locations with language:', currentLang);
      const data = await airportApi.getCarLocationFees(carId, currentLang);
      console.log('📍 Available locations for car:', data);
      setLocationFees(data);

      // Update delivery fee if a location was pre-selected from navigation
      if (navigationState?.location && data.length > 0) {
        const matchingLocation = data.find(loc => loc.location_id === navigationState.location?.id);
        if (matchingLocation) {
          setSelectedLocation(prev => prev ? { ...prev, deliveryFee: matchingLocation.delivery_fee } : prev);
        }
      }
    } catch (error) {
      console.error('❌ Error loading car locations:', error);
    }
  };

  const loadBookedDates = async (carId: string) => {
    try {
      const bookedDates = await bookingsApi.getCarBookedDates(carId);
      console.log('📅 Booked dates for car:', bookedDates);

      // Convertir les périodes de réservation en format attendu par react-tailwindcss-datepicker
      const allDisabledDates: { startDate: Date; endDate: Date }[] = [];

      bookedDates.forEach(({ startDate, endDate }) => {
        allDisabledDates.push({
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      });

      setDisabledDates(allDisabledDates as any);
    } catch (error) {
      console.error('❌ Error loading booked dates:', error);
    }
  };

  const loadCarDetails = async (carId: string) => {
    try {
      setLoading(true);
      // Normalize language to 2-letter code (ar-MA -> ar, en-US -> en)
      const currentLang = i18n.language.split('-')[0];
      console.log('🌍 Loading car features with language:', currentLang);
      const [carResponse, featuresResponse] = await Promise.all([
        carsApi.getCarDetails(carId),
        featuresApi.getCarFeatures(carId, currentLang).catch(() => [])
      ]);
      console.log('🚗 Car details loaded:', carResponse);
      console.log('🔧 Features loaded:', featuresResponse);
      setCar(carResponse);
      setCarFeatures(featuresResponse || []);
    } catch (error) {
      console.error('❌ Error loading car details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (!dateValue.startDate || !dateValue.endDate) return 0;
    const diffTime = Math.abs(dateValue.endDate.getTime() - dateValue.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleBooking = () => {
    if (!car) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const pricePerDay = Number(car.pricePerDay || car.price_per_day || 0);
    const days = calculateDays();
    const totalPrice = days * pricePerDay;
    const deliveryFee = Number(selectedLocation?.deliveryFee || 0);

    const navigationState = {
      car,
      startDate: dateValue.startDate?.toISOString().split('T')[0],
      endDate: dateValue.endDate?.toISOString().split('T')[0],
      days,
      totalPrice,
      airportId: selectedLocation?.type === 'airport' ? selectedLocation.id : undefined,
      cityId: selectedLocation?.type === 'city' ? selectedLocation.id : undefined,
      deliveryFee,
    };

    console.log('🚀 CarDetailsPage: Navigating to booking with state:', navigationState);
    console.log('🚀 Selected location:', selectedLocation);

    navigate(`/booking/${car.id}`, { state: navigationState });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4" style={{ borderTopColor: FlitCarColors.primary }}></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.notFound')}</h2>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-3 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: FlitCarColors.primary }}
        >
          {t('common.back')} {t('nav.search').toLowerCase()}
        </button>
      </div>
    );
  }

  const images = car.images || car.image_urls || [];
  const pricePerDay = Number(car.pricePerDay || car.price_per_day || 0);
  const deliveryFee = Number(selectedLocation?.deliveryFee || 0);
  const days = calculateDays();
  const totalPrice = days * pricePerDay;
  const rating = car.rating || 4.5;
  const reviewCount = car.reviewCount || car.review_count || 12;

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Header avec retour */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <IoChevronBack className="text-xl" />
            <span className="font-medium">{t('common.back')}</span>
          </button>
        </div>
      </div>

      {/* Booking.com style - Pickup/Return Info Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Mobile Layout - Compact like Booking.com */}
          <div className="lg:hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Location name */}
                <h3 className="font-bold text-gray-900 text-base truncate">
                  {selectedLocation?.displayName || t('carDetails.searchLocationPlaceholder')}
                </h3>
                {/* Compact date range */}
                <p className="text-sm text-gray-600 mt-0.5">
                  {dateValue.startDate && dateValue.endDate
                    ? `${dateValue.startDate.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }).replace('.', '')}, ${startTime.replace(':', 'h')} - ${dateValue.endDate.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }).replace('.', '')}, ${endTime.replace(':', 'h')}`
                    : t('home.search.selectDates')}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-white font-semibold rounded-lg transition-colors flex-shrink-0"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                {t('common.modify')}
              </button>
            </div>
            {/* Pickup reminder info */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
              <IoCalendarOutline className="text-lg flex-shrink-0" style={{ color: FlitCarColors.primary }} />
              <span>{t('carDetails.pickupReminder', { time: startTime })}</span>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-wrap items-center justify-between gap-4">
            {/* Location & Dates Info */}
            <div className="flex flex-wrap items-center gap-4 lg:gap-8">
              {/* Pickup Location & Date */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  {selectedLocation?.displayName || t('carDetails.searchLocationPlaceholder')}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {dateValue.startDate
                    ? `${dateValue.startDate.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, ${startTime}`
                    : t('home.search.selectPickupDate')}
                </span>
              </div>

              {/* Arrow separator */}
              <div className="text-gray-400">
                <IoChevronForward className="text-xl" />
              </div>

              {/* Return Location & Date */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">
                  {selectedLocation?.displayName || t('carDetails.searchLocationPlaceholder')}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {dateValue.endDate
                    ? `${dateValue.endDate.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}, ${endTime}`
                    : t('home.search.selectReturnDate')}
                </span>
              </div>
            </div>

            {/* Pickup time reminder + Modify button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <IoCalendarOutline className="text-lg" />
                <span>{t('carDetails.pickupReminder', { time: startTime })}</span>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                {t('common.modify')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{t('carDetails.modifyBookingDetails')}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoClose className="text-xl text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Lieu de prise en charge */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-1">
                    <IoLocationOutline className="text-lg" />
                    {t('home.search.pickupLocation')}
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => {
                      setLocationSearchQuery(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder={t('home.search.searchLocation')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': FlitCarColors.primary } as any}
                    onBlur={() => {
                      setTimeout(() => setShowLocationDropdown(false), 200);
                    }}
                  />

                  {/* Dropdown */}
                  {showLocationDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-60 overflow-y-auto">
                      {(() => {
                        const filteredLocations = locationFees.filter(loc => {
                          if (!locationSearchQuery) return true;
                          const query = locationSearchQuery.toLowerCase();
                          return (
                            loc.name?.toLowerCase().includes(query) ||
                            loc.code?.toLowerCase().includes(query) ||
                            loc.city?.toLowerCase().includes(query) ||
                            loc.region?.toLowerCase().includes(query)
                          );
                        });

                        if (filteredLocations.length === 0) {
                          return (
                            <div className="px-4 py-8 text-center text-gray-400">
                              <p className="font-semibold">{t('common.noResultsFound')}</p>
                              <p className="text-sm mt-1">{t('common.tryAnotherSearch')}</p>
                            </div>
                          );
                        }

                        return filteredLocations.map((loc) => (
                          <button
                            key={loc.location_id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const displayName = loc.type === 'airport'
                                ? `${loc.city} - ${loc.name}`
                                : loc.name || '';
                              setSelectedLocation({
                                id: loc.location_id,
                                type: loc.type,
                                code: loc.code,
                                name: loc.name || '',
                                displayName,
                                deliveryFee: loc.delivery_fee
                              });
                              setLocationSearchQuery(displayName);
                              setShowLocationDropdown(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0 flex items-center gap-3"
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                            >
                              {loc.type === 'airport' ? loc.code : loc.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-gray-900 text-sm">
                                  {loc.type === 'airport' ? loc.city : loc.name}
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  loc.type === 'airport'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {loc.type === 'airport' ? t('booking.airport') : t('booking.city')}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {loc.type === 'airport' ? loc.name : `${loc.region} • ${loc.country}`}
                              </div>
                            </div>
                            {loc.delivery_fee > 0 && (
                              <div className="text-xs font-semibold" style={{ color: FlitCarColors.primary }}>
                                +{formatPrice(loc.delivery_fee)}
                              </div>
                            )}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Date de prise en charge + Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('home.search.pickupDate')}</label>
                  <div className="datepicker-wrapper">
                    <Datepicker
                      value={{ startDate: dateValue.startDate as any, endDate: dateValue.startDate as any }}
                      onChange={(newValue: any) => setDateValue(prev => ({ ...prev, startDate: newValue?.startDate ? new Date(newValue.startDate) : null }))}
                      minDate={new Date()}
                      disabledDates={disabledDates}
                      primaryColor="teal"
                      placeholder={t('home.search.selectPickupDate')}
                      asSingle={true}
                      useRange={false}
                      displayFormat="DD/MM/YYYY"
                      i18n={i18n.language.split('-')[0]}
                      inputClassName="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                      containerClassName="relative"
                      readOnly={true}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('home.search.pickupTime')}</label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ '--tw-ring-color': FlitCarColors.primary } as any}
                  >
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2).toString().padStart(2, '0');
                      const min = i % 2 === 0 ? '00' : '30';
                      return <option key={i} value={`${hour}:${min}`}>{hour}:{min}</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Date de restitution + Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('home.search.returnDate')}</label>
                  <div className="datepicker-wrapper">
                    <Datepicker
                      value={{ startDate: dateValue.endDate as any, endDate: dateValue.endDate as any }}
                      onChange={(newValue: any) => setDateValue(prev => ({ ...prev, endDate: newValue?.startDate ? new Date(newValue.startDate) : null }))}
                      minDate={dateValue.startDate || new Date()}
                      disabledDates={disabledDates}
                      primaryColor="teal"
                      placeholder={t('home.search.selectReturnDate')}
                      asSingle={true}
                      useRange={false}
                      displayFormat="DD/MM/YYYY"
                      i18n={i18n.language.split('-')[0]}
                      inputClassName="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                      containerClassName="relative"
                      readOnly={true}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('home.search.returnTime')}</label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
                    style={{ '--tw-ring-color': FlitCarColors.primary } as any}
                  >
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2).toString().padStart(2, '0');
                      const min = i % 2 === 0 ? '00' : '30';
                      return <option key={i} value={`${hour}:${min}`}>{hour}:{min}</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={() => setShowEditModal(false)}
                className="w-full py-3 text-white font-bold rounded-lg transition-colors"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Détails */}
          <div className="lg:col-span-2 space-y-4">
            {/* Titre et note */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {car.brand} {car.model}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <IoLocationOutline className="text-lg" style={{ color: FlitCarColors.primary }} />
                      <span>{car.location || car.airport?.city || 'Paris'}</span>
                    </div>
                    <span>•</span>
                    <span>{car.year}</span>
                  </div>
                </div>
                <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <IoHeartOutline className="text-2xl text-gray-600" />
                </button>
              </div>

              {/* Note style Booking */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded-lg text-white font-bold" style={{ backgroundColor: FlitCarColors.primary }}>
                  {rating.toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <IoStarSharp
                        key={i}
                        className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {reviewCount} {t('carDetails.reviews')} • <span className="font-semibold">{t('reviews.verySatisfied')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Carrousel photos */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              {/* Image principale */}
              <div className="relative w-full aspect-video md:aspect-[16/9]">
                <img
                  src={images[selectedImage] || images[0] || '/placeholder-car.jpg'}
                  alt={`Photo ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Boutons de navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                    >
                      <IoChevronBack className="text-xl text-gray-800" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                    >
                      <IoChevronForward className="text-xl text-gray-800" />
                    </button>
                  </>
                )}

                {/* Compteur d'images */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/70 text-white text-sm font-medium">
                  {selectedImage + 1} / {images.length}
                </div>
              </div>

              {/* Miniatures */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === selectedImage
                          ? 'border-teal-600 ring-2 ring-teal-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Miniature ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Badge populaire */}
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <IoShieldCheckmarkOutline className="text-2xl text-green-600" />
              <div>
                <p className="font-semibold text-green-900">{t('home.specialOffers.badges.mostBooked')}</p>
                <p className="text-sm text-green-700">{t('home.specialOffers.badges.recommended')}</p>
              </div>
            </div>

            {/* Caractéristiques principales */}
            <div className="bg-white border border-gray-200 rounded-xl lg:rounded-lg p-4 lg:p-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsSpecsOpen(!isSpecsOpen)}
              >
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('carDetails.specifications')}</h2>
                {isMobile && (
                  <IoChevronDown
                    className={`text-gray-400 transition-transform ${isSpecsOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {(isSpecsOpen || !isMobile) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 lg:mt-4">
                  {[
                    { icon: <IoPeopleOutline />, label: t('carDetails.seats'), value: `${car.seats || 5}` },
                    { icon: <IoSpeedometerOutline />, label: t('carDetails.transmission'), value: car.transmission === 'automatic' ? t('carDetails.automatic') : t('carDetails.manual') },
                    { icon: <FaGasPump />, label: t('carDetails.fuelType'), value: car.fuelType || car.fuel_type || t('carDetails.gasoline') },
                    { icon: <IoColorPaletteOutline />, label: t('carDetails.color'), value: car.color || t('carDetails.black') },
                  ].map((spec, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl" style={{ color: FlitCarColors.primary }}>
                        {spec.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">{spec.label}</p>
                        <p className="font-semibold text-gray-900">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-xl lg:rounded-lg p-4 lg:p-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsDescriptionOpen(!isDescriptionOpen)}
              >
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('carDetails.title')}</h2>
                {isMobile && (
                  <IoChevronDown
                    className={`text-gray-400 transition-transform ${isDescriptionOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {(isDescriptionOpen || !isMobile) && (
                <p className="text-sm lg:text-base text-gray-700 leading-relaxed mt-3 lg:mt-3">
                  {car.description || t('carDetails.defaultDescription', { brand: car.brand, model: car.model, year: car.year })}
                </p>
              )}
            </div>

            {/* Équipements avec checkmarks verts */}
            <div className="bg-white border border-gray-200 rounded-xl lg:rounded-lg p-4 lg:p-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsFeaturesOpen(!isFeaturesOpen)}
              >
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('carDetails.features')}</h2>
                {isMobile && (
                  <IoChevronDown
                    className={`text-gray-400 transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {(isFeaturesOpen || !isMobile) && (
                <div className="mt-3 lg:mt-4">
              {carFeatures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {carFeatures.map((feature) => (
                    <div key={feature.id} className="flex items-center gap-3">
                      <IoCheckmarkCircle className="text-2xl flex-shrink-0" style={{ color: FlitCarColors.primary }} />
                      <span className="text-gray-700">{feature.name}</span>
                      {feature.isPremium && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                          Premium
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Climatisation',
                    'Bluetooth',
                    'GPS',
                    'Airbags',
                    'ABS',
                    'Régulateur de vitesse',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <IoCheckmarkCircle className="text-2xl flex-shrink-0" style={{ color: FlitCarColors.primary }} />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}
                </div>
              )}
            </div>

            {/* Propriétaire style Booking */}
            <div className="bg-white border border-gray-200 rounded-xl lg:rounded-lg p-4 lg:p-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsOwnerOpen(!isOwnerOpen)}
              >
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('carDetails.owner')}</h2>
                {isMobile && (
                  <IoChevronDown
                    className={`text-gray-400 transition-transform ${isOwnerOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {(isOwnerOpen || !isMobile) && (
              <div className="mt-3 lg:mt-4 space-y-3">
                {/* Avatar + Nom + Stats */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{ backgroundColor: FlitCarColors.primary }}
                  >
                    {car.owner?.name?.charAt(0)?.toUpperCase() || 'F'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900">
                      {car.owner?.name?.split(' ')[0] || 'FlitCar'} ***
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IoStarSharp className="text-yellow-400 flex-shrink-0" />
                      <span className="font-semibold">{car.owner?.rating?.toFixed(1) || '4.8'}</span>
                      <span>•</span>
                      <span className="truncate">{car.owner?.totalBookings || 45} {t('carDetails.ownerInfo.rentals')}</span>
                    </div>
                  </div>
                </div>
                {/* Badge FlitCar */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">{t('carDetails.ownerFlitCar')}</span>
                    <span className="mx-2">•</span>
                    <span style={{ color: FlitCarColors.primary }}>{t('carDetails.bookingOptions.instantBooking')}</span>
                  </p>
                </div>
              </div>
              )}
            </div>

            {/* Avis clients style Booking */}
            <div className="bg-white border border-gray-200 rounded-xl lg:rounded-lg p-4 lg:p-6">
              <div
                className="flex items-center justify-between cursor-pointer lg:cursor-default"
                onClick={() => isMobile && setIsReviewsOpen(!isReviewsOpen)}
              >
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">{t('carDetails.reviews')}</h2>
                {isMobile && (
                  <IoChevronDown
                    className={`text-gray-400 transition-transform ${isReviewsOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {(isReviewsOpen || !isMobile) && (
                <div className="mt-3 lg:mt-4">
              {/* Résumé des notes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: t('carDetails.cleanliness'), score: 4.7 },
                  { label: t('carDetails.specifications'), score: 4.6 },
                  { label: t('carDetails.vehicleCondition'), score: 4.8 },
                  { label: t('carDetails.specifications'), score: 4.9 },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold" style={{ color: FlitCarColors.primary }}>
                      {item.score}
                    </p>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Quelques avis */}
              <div className="space-y-4">
                {[
                  {
                    name: 'Marie L.',
                    date: 'Il y a 2 semaines',
                    rating: 5,
                    comment: t('carDetails.reviewsExamples.excellent'),
                  },
                  {
                    name: 'Thomas D.',
                    date: 'Il y a 1 mois',
                    rating: 4,
                    comment: t('carDetails.reviewsExamples.veryGood'),
                  },
                ].map((review, i) => (
                  <div key={i} className="border-t border-gray-200 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                      <div className="px-3 py-1 rounded text-white font-bold text-sm" style={{ backgroundColor: FlitCarColors.primary }}>
                        {review.rating}.0
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Carte de réservation style Booking (Desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="border-2 rounded-lg" style={{ borderColor: FlitCarColors.primary }}>
                <div className="bg-white p-6">
                  {/* Prix */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">{t('booking.priceBreakdown.total')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black" style={{ color: FlitCarColors.primary }}>
                        {formatPrice(totalPrice + deliveryFee)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{t('booking.termsAndConditions.validLicense')}</p>
                  </div>

                  {/* Prise en charge et restitution - Style Booking.com Timeline */}
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">{t('carDetails.pickupAndReturn')}</h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {/* Prise en charge */}
                      <div className="flex items-start gap-3 p-3 border-b border-gray-100">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: FlitCarColors.primary }}></div>
                          <div className="w-0.5 h-10 bg-gray-200 my-1"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {dateValue.startDate
                                ? dateValue.startDate.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })
                                : t('home.search.selectPickupDate')}
                            </span>
                            <span className="text-sm text-gray-500">• {startTime}</span>
                          </div>
                          <p className="text-sm font-semibold" style={{ color: FlitCarColors.primary }}>
                            {selectedLocation?.displayName || t('home.search.searchLocation')}
                          </p>
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline mt-1"
                            onClick={() => setShowEditModal(true)}
                          >
                            {t('carDetails.viewPickupInstructions')}
                          </button>
                        </div>
                      </div>

                      {/* Restitution */}
                      <div className="flex items-start gap-3 p-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FlitCarColors.primary }}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {dateValue.endDate
                                ? dateValue.endDate.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })
                                : t('home.search.selectReturnDate')}
                            </span>
                            <span className="text-sm text-gray-500">• {endTime}</span>
                          </div>
                          <p className="text-sm font-semibold" style={{ color: FlitCarColors.primary }}>
                            {selectedLocation?.displayName || t('home.search.searchLocation')}
                          </p>
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:underline mt-1"
                            onClick={() => setShowEditModal(true)}
                          >
                            {t('carDetails.viewReturnInstructions')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Résumé */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{days} {t('booking.days')}</span>
                      <span className="font-semibold">{formatPrice(totalPrice)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">{t('booking.priceBreakdown.serviceFee')}</span>
                        <span className="font-semibold">{formatPrice(deliveryFee)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                      <span className="font-bold text-gray-900">{t('booking.priceBreakdown.total')}</span>
                      <span className="font-bold text-2xl" style={{ color: FlitCarColors.primary }}>
                        {formatPrice(totalPrice + deliveryFee)}
                      </span>
                    </div>
                  </div>

                  {/* Bouton réserver */}
                  <button
                    onClick={handleBooking}
                    className="w-full py-4 rounded-lg text-white font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
                    style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                  >
                    {t('carDetails.bookNow')}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-3">
                    {t('booking.processing')}
                  </p>
                </div>

                {/* Garanties */}
                <div className="bg-gray-50 p-4 space-y-2">
                  {[
                    t('refundPolicy.freeCancellation'),
                    t('booking.termsAndConditions.validLicense'),
                    t('support.title'),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <IoCheckmarkCircle className="text-lg flex-shrink-0" style={{ color: FlitCarColors.primary }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t('booking.priceBreakdown.total')}</p>
              <div className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                {formatPrice(totalPrice + deliveryFee)}
              </div>
              <div className="text-xs text-gray-600">
                {days} {t('booking.days')} {dateValue.startDate && dateValue.endDate && (
                  <>• {dateValue.startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {dateValue.endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</>
                )}
              </div>
            </div>
            <button
              onClick={handleBooking}
              className="px-6 py-3 rounded-xl font-bold text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
            >
              Je réserve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;
