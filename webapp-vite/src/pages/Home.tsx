/**
 * FlitCar Homepage - Booking.com Style with FLIT Colors
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Datepicker from 'react-tailwindcss-datepicker';
import MobileFullScreenDatePicker from '../components/common/MobileFullScreenDatePicker';
import { ROUTES } from '../constants/routes';
import { FlitCarColors } from '../constants/colors';
import { bookingsApi } from '../services/api/bookingsApi';
import { carsApi } from '../services/api/carsApi';
import { locationsApi } from '../services/api/locationsApi';
import type { Airport, Car } from '../types/car.types';
import type { Location } from '../services/api/locationsApi';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import {
  IoLocationOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCarSportOutline,
  IoShieldCheckmarkOutline,
  IoWalletOutline,
  IoStarSharp,
  IoPeopleOutline,
  IoCheckmarkCircleSharp,
  IoArrowForward,
  IoSearchSharp
} from 'react-icons/io5';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrencyFormat();
  const [dateValue, setDateValue] = useState({
    startDate: null,
    endDate: null
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [locationId, setLocationId] = useState('');
  const [locationType, setLocationType] = useState<'airport' | 'city'>('airport');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [topCars, setTopCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    loadLocations();
    loadTopCars();
  }, [i18n.language]); // Reload when language changes

  const loadLocations = async () => {
    try {
      // Normalize language to 2-letter code (ar-MA -> ar, en-US -> en)
      const currentLang = i18n.language.split('-')[0];
      console.log('🌍 [HomePage] Loading locations with language:', currentLang);
      const data = await locationsApi.getAllLocations(currentLang);
      console.log('🌍 [HomePage] Locations loaded:', data.length, 'locations');
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadTopCars = async () => {
    try {
      setLoadingCars(true);
      const response = await carsApi.searchCars({ limit: 3 });
      setTopCars(response.cars);
    } catch (error) {
      console.error('❌ Error loading cars:', error);
    } finally {
      setLoadingCars(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (dateValue.startDate) {
      const startDate = new Date(dateValue.startDate as string);
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('startTime', startTime);
    }
    if (dateValue.endDate) {
      const endDate = new Date(dateValue.endDate as string);
      params.append('endDate', endDate.toISOString().split('T')[0]);
      params.append('endTime', endTime);
    }
    // Add either airportId or cityId based on location type
    if (locationId) {
      if (locationType === 'airport') {
        params.append('airportId', locationId);
      } else {
        params.append('cityId', locationId);
      }
    }
    navigate(`${ROUTES.SEARCH}?${params.toString()}`);
  };

  const handleDestinationClick = (destination: typeof popularDestinations[0]) => {
    // Trouver l'aéroport ou la ville correspondant à la destination
    const location = locations.find(
      (loc) => (loc.type === 'airport' && loc.city?.toLowerCase() === destination.airportCity.toLowerCase()) ||
               (loc.type === 'city' && loc.name?.toLowerCase() === destination.airportCity.toLowerCase())
    );

    console.log('🛫 Destination click:', {
      destinationCity: destination.airportCity,
      locationsLoaded: locations.length,
      locationFound: location ? `${location.name} (${location.id})` : 'NOT FOUND',
    });

    const params = new URLSearchParams();
    if (location) {
      if (location.type === 'airport') {
        params.append('airportId', location.id);
      } else {
        params.append('cityId', location.id);
      }
    } else {
      console.error('❌ Lieu non trouvé pour:', destination.airportCity);
    }
    navigate(`${ROUTES.SEARCH}?${params.toString()}`);
  };

  const popularDestinations = [
    {
      city: 'Casablanca',
      airportName: 'Aéroport Mohammed V',
      airportCity: 'Casablanca',
      image: 'https://i.ibb.co/sJ5qv6Gm/casa.jpg',
      vehicles: 120,
    },
    {
      city: 'Marrakech',
      airportName: 'Aéroport Menara',
      airportCity: 'Marrakech',
      image: 'https://i.ibb.co/39x1LzGM/marrakech.jpg',
      vehicles: 95,
    },
    {
      city: 'Agadir',
      airportName: 'Aéroport Al Massira',
      airportCity: 'Agadir',
      image: 'https://i.ibb.co/N2nrbSxG/agadir.jpg',
      vehicles: 68,
    },
    {
      city: 'Tanger',
      airportName: 'Aéroport Ibn Battouta',
      airportCity: 'Tanger',
      image: 'https://i.ibb.co/sv6hzq0g/tanger.jpg',
      vehicles: 52,
    },
  ];

  const getBadgeForCar = (index: number): string => {
    const badges = [
      t('home.specialOffers.badges.bestDeal'),
      t('home.specialOffers.badges.mostBooked'),
      t('home.specialOffers.badges.premium')
    ];
    return badges[index] || t('home.specialOffers.badges.recommended');
  };

  const getCarFeatures = (car: Car): string[] => {
    const features: string[] = [];

    // Transmission
    if (car.transmission === 'automatic') {
      features.push('Automatique');
    } else if (car.transmission === 'manual') {
      features.push('Manuelle');
    }

    // Fuel type
    if (car.fuelType || car.fuel_type) {
      const fuel = (car.fuelType || car.fuel_type)?.toLowerCase();
      if (fuel === 'diesel') features.push('Diesel');
      else if (fuel === 'essence' || fuel === 'gasoline') features.push('Essence');
      else if (fuel === 'electric') features.push('Électrique');
      else if (fuel === 'hybrid') features.push('Hybride');
    }

    // Seats
    const seats = car.seats;
    if (seats) features.push(`${seats} places`);

    return features.slice(0, 3);
  };

  const whyChooseUs = [
    {
      icon: <IoWalletOutline className="w-8 h-8" />,
      title: t('home.whyChooseUs.benefits.bestPrice.title'),
      description: t('home.whyChooseUs.benefits.bestPrice.description'),
    },
    {
      icon: <IoShieldCheckmarkOutline className="w-8 h-8" />,
      title: t('home.whyChooseUs.benefits.freeCancellation.title'),
      description: t('home.whyChooseUs.benefits.freeCancellation.description'),
    },
    {
      icon: <IoPeopleOutline className="w-8 h-8" />,
      title: t('home.whyChooseUs.benefits.satisfiedCustomers.title'),
      description: t('home.whyChooseUs.benefits.satisfiedCustomers.description'),
    },
    {
      icon: <IoCheckmarkCircleSharp className="w-8 h-8" />,
      title: t('home.whyChooseUs.benefits.instantConfirmation.title'),
      description: t('home.whyChooseUs.benefits.instantConfirmation.description'),
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* ========================================================================
          HERO WITH SEARCH - Style Booking avec charte FLIT
          ======================================================================== */}
      <section
        className="relative bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 168, 139, 0.85), rgba(0, 138, 114, 0.75)), url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-white mb-8">
            <h1 className="text-4xl md:text-5xl font-bold">
              {t('home.hero.title')}
            </h1>
          </div>

          {/* Search Box - Style Booking.com avec bordure orange */}
          <div className="rounded-lg p-1" style={{ backgroundColor: '#febb02' }}>
            <div className="bg-white rounded-md">

              {/* ============ MOBILE LAYOUT ============ */}
              <div className="lg:hidden p-3 space-y-3">
                {/* Location - Full width */}
                <div className="relative">
                  <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-md bg-white">
                    <IoSearchSharp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">{t('home.search.pickupLocation')}</div>
                      <input
                        type="text"
                        value={locationSearchQuery}
                        onChange={(e) => {
                          setLocationSearchQuery(e.target.value);
                          setShowLocationDropdown(true);
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                        placeholder={t('home.search.searchLocation')}
                        className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent placeholder-gray-400"
                        onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                      />
                    </div>
                  </div>

                  {/* Dropdown Mobile */}
                  {showLocationDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-60 overflow-y-auto">
                      {(() => {
                        const filteredLocations = locations.filter(location => {
                          if (!locationSearchQuery) return true;
                          const query = locationSearchQuery.toLowerCase();
                          return (
                            location.name.toLowerCase().includes(query) ||
                            (location.code && location.code.toLowerCase().includes(query)) ||
                            (location.city && location.city.toLowerCase().includes(query)) ||
                            (location.region && location.region.toLowerCase().includes(query))
                          );
                        });

                        if (filteredLocations.length === 0) {
                          return (
                            <div className="px-4 py-8 text-center text-gray-400">
                              <p className="font-semibold">{t('common.noResultsFound')}</p>
                            </div>
                          );
                        }

                        return filteredLocations.map((location) => (
                          <button
                            key={location.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSelectedLocation(location);
                              setLocationId(location.id);
                              setLocationType(location.type);
                              setLocationSearchQuery(location.type === 'airport' ? `${location.city}, ${location.name}` : location.name);
                              setShowLocationDropdown(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900 text-sm">{location.name}</div>
                            <div className="text-xs text-gray-500">{location.city}, {location.region}</div>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Date de prise en charge + Heure - Side by side */}
                <div className="flex gap-2">
                  <div
                    className="flex-1 p-3 border border-gray-300 rounded-md bg-white cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <div className="flex items-center gap-2">
                      <IoCalendarOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">{t('home.search.pickupDate')}</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {dateValue.startDate
                            ? new Date(dateValue.startDate as string).toLocaleDateString(
                                i18n.language.split('-')[0] === 'ar' ? 'ar-MA' : i18n.language.split('-')[0] === 'en' ? 'en-US' : 'fr-FR',
                                { weekday: 'short', day: 'numeric', month: 'short' }
                              )
                            : t('home.search.selectPickupDate')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-28 p-3 border border-gray-300 rounded-md bg-white">
                    <div className="flex items-center gap-2">
                      <IoTimeOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">{t('home.search.time')}</div>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent cursor-pointer appearance-none"
                        >
                          {Array.from({ length: 48 }, (_, i) => {
                            const hour = Math.floor(i / 2).toString().padStart(2, '0');
                            const min = i % 2 === 0 ? '00' : '30';
                            return <option key={i} value={`${hour}:${min}`}>{hour}:{min}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date de restitution + Heure - Side by side */}
                <div className="flex gap-2">
                  <div
                    className="flex-1 p-3 border border-gray-300 rounded-md bg-white cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <div className="flex items-center gap-2">
                      <IoCalendarOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">{t('home.search.returnDate')}</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {dateValue.endDate
                            ? new Date(dateValue.endDate as string).toLocaleDateString(
                                i18n.language.split('-')[0] === 'ar' ? 'ar-MA' : i18n.language.split('-')[0] === 'en' ? 'en-US' : 'fr-FR',
                                { weekday: 'short', day: 'numeric', month: 'short' }
                              )
                            : t('home.search.selectReturnDate')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-28 p-3 border border-gray-300 rounded-md bg-white">
                    <div className="flex items-center gap-2">
                      <IoTimeOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500">{t('home.search.time')}</div>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent cursor-pointer appearance-none"
                        >
                          {Array.from({ length: 48 }, (_, i) => {
                            const hour = Math.floor(i / 2).toString().padStart(2, '0');
                            const min = i % 2 === 0 ? '00' : '30';
                            return <option key={i} value={`${hour}:${min}`}>{hour}:{min}</option>;
                          })}
                        </select>
                      </div>
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
                />

                {/* Search Button Mobile */}
                <button
                  onClick={handleSearch}
                  className="w-full text-white font-bold py-4 rounded-md transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  {t('home.search.searchButton')}
                </button>
              </div>

              {/* ============ DESKTOP LAYOUT ============ */}
              <div className="hidden lg:flex lg:items-stretch">
                {/* Location - Autocomplete */}
                <div className="flex-[2] border-r border-gray-300 p-3">
                  <div className="relative h-full flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <IoLocationOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{t('home.search.pickupLocation')}</span>
                    </div>
                    <input
                      type="text"
                      value={locationSearchQuery}
                      onChange={(e) => {
                        setLocationSearchQuery(e.target.value);
                        setShowLocationDropdown(true);
                      }}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder={t('home.search.searchLocation')}
                      className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent placeholder-gray-400"
                      onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                    />

                    {/* Dropdown Desktop */}
                    {showLocationDropdown && (
                      <div className="absolute z-50 w-full top-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-60 overflow-y-auto">
                        {(() => {
                          const filteredLocations = locations.filter(location => {
                            if (!locationSearchQuery) return true;
                            const query = locationSearchQuery.toLowerCase();
                            return (
                              location.name.toLowerCase().includes(query) ||
                              (location.code && location.code.toLowerCase().includes(query)) ||
                              (location.city && location.city.toLowerCase().includes(query)) ||
                              (location.region && location.region.toLowerCase().includes(query))
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

                          return filteredLocations.map((location) => (
                            <button
                              key={location.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedLocation(location);
                                setLocationId(location.id);
                                setLocationType(location.type);
                                setLocationSearchQuery(location.type === 'airport' ? `${location.city} - ${location.name}` : location.name);
                                setShowLocationDropdown(false);
                              }}
                              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0 flex items-center gap-3"
                            >
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                                style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                              >
                                {location.type === 'airport' ? location.code : location.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{location.name}</div>
                                <div className="text-xs text-gray-500">
                                  {location.type === 'airport' ? `${t('booking.airport')} • ${location.city}` : `${t('booking.city')} • ${location.region}`}
                                </div>
                              </div>
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date de prise en charge */}
                <div className="flex-1 border-r border-gray-300 p-3">
                  <div className="h-full flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <IoCalendarOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{t('home.search.pickupDate')}</span>
                    </div>
                    <Datepicker
                      value={{ startDate: dateValue.startDate, endDate: dateValue.startDate }}
                      onChange={(newValue: any) => setDateValue(prev => ({ ...prev, startDate: newValue?.startDate }))}
                      minDate={new Date()}
                      primaryColor="teal"
                      placeholder={t('home.search.selectPickupDate')}
                      asSingle={true}
                      useRange={false}
                      displayFormat="ddd DD MMM"
                      i18n={i18n.language.split('-')[0]}
                      inputClassName="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent cursor-pointer"
                      toggleClassName="hidden"
                      containerClassName="relative"
                    />
                  </div>
                </div>

                {/* Heure prise en charge */}
                <div className="w-24 border-r border-gray-300 p-3">
                  <div className="h-full flex flex-col justify-center">
                    <div className="flex items-center gap-1 mb-1">
                      <IoTimeOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{t('home.search.time')}</span>
                    </div>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent cursor-pointer"
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const hour = Math.floor(i / 2).toString().padStart(2, '0');
                        const min = i % 2 === 0 ? '00' : '30';
                        return <option key={i} value={`${hour}:${min}`}>{hour}:{min}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* Date de restitution */}
                <div className="flex-1 border-r border-gray-300 p-3">
                  <div className="h-full flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <IoCalendarOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{t('home.search.returnDate')}</span>
                    </div>
                    <Datepicker
                      value={{ startDate: dateValue.endDate, endDate: dateValue.endDate }}
                      onChange={(newValue: any) => setDateValue(prev => ({ ...prev, endDate: newValue?.startDate }))}
                      minDate={dateValue.startDate ? new Date(dateValue.startDate as string) : new Date()}
                      primaryColor="teal"
                      placeholder={t('home.search.selectReturnDate')}
                      asSingle={true}
                      useRange={false}
                      displayFormat="ddd DD MMM"
                      i18n={i18n.language.split('-')[0]}
                      inputClassName="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent cursor-pointer"
                      toggleClassName="hidden"
                      containerClassName="relative"
                    />
                  </div>
                </div>

                {/* Heure restitution */}
                <div className="w-24 border-r border-gray-300 p-3">
                  <div className="h-full flex flex-col justify-center">
                    <div className="flex items-center gap-1 mb-1">
                      <IoTimeOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{t('home.search.time')}</span>
                    </div>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 focus:outline-none bg-transparent cursor-pointer"
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const hour = Math.floor(i / 2).toString().padStart(2, '0');
                        const min = i % 2 === 0 ? '00' : '30';
                        return <option key={i} value={`${hour}:${min}`}>{hour}:{min}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {/* Search Button Desktop */}
                <div className="p-3 flex items-center">
                  <button
                    onClick={handleSearch}
                    className="text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2 hover:opacity-90 h-full"
                    style={{ backgroundColor: FlitCarColors.primary }}
                  >
                    <span>{t('home.search.searchButton')}</span>
                    <IoSearchSharp className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 mt-6 text-white">
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleSharp className="w-5 h-5" style={{ color: '#ffffff' }} />
              <span className="text-sm">{t('home.trustIndicators.allInclusivePrice')}</span>
            </div>
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleSharp className="w-5 h-5" style={{ color: '#ffffff' }} />
              <span className="text-sm">{t('home.trustIndicators.noHiddenFees')}</span>
            </div>
            <div className="flex items-center gap-2">
              <IoCheckmarkCircleSharp className="w-5 h-5" style={{ color: '#ffffff' }} />
              <span className="text-sm">{t('home.trustIndicators.freeModification')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          OFFRES DU MOMENT - Cards style Booking avec vraies voitures
          ======================================================================== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('home.specialOffers.title')}
          </h2>
          <p className="text-gray-600">{t('home.specialOffers.subtitle')}</p>
        </div>

        {loadingCars ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topCars.map((car, i) => (
              <div
                key={car.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Image with badge */}
                <div className="relative h-48">
                  <img
                    src={(car.images?.[0] || car.image_urls?.[0]) || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80'}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 text-white px-3 py-1 rounded-md text-xs font-bold" style={{ backgroundColor: FlitCarColors.primary }}>
                    {getBadgeForCar(i)}
                  </div>
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md flex items-center gap-1">
                    <IoStarSharp className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold">4.{8 - i}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-sm text-gray-600">{car.type || 'Berline'}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-white px-2 py-0.5 rounded font-bold text-sm" style={{ backgroundColor: FlitCarColors.primary }}>
                      4.{8 - i}
                    </div>
                    <span className="text-sm text-gray-600">
                      Excellent · {Math.floor(Math.random() * 200) + 100} avis
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    {getCarFeatures(car).map((feature, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-gray-700">
                        <IoCheckmarkCircleSharp className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================
          DESTINATIONS POPULAIRES - Grid avec overlay
          ======================================================================== */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('home.popularDestinations.title')}
            </h2>
            <p className="text-gray-600">{t('home.popularDestinations.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {popularDestinations.map((dest, i) => (
              <div
                key={i}
                className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => handleDestinationClick(dest)}
              >
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{dest.city}</h3>
                  <p className="text-sm text-gray-200 mb-2">{dest.airportName}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <IoCarSportOutline className="w-4 h-4" />
                    <span>{dest.vehicles} {t('home.popularDestinations.availableVehicles')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================
          POURQUOI NOUS CHOISIR - Style Booking avec icônes
          ======================================================================== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('home.whyChooseUs.title')}
          </h2>
          <p className="text-gray-600">{t('home.whyChooseUs.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {whyChooseUs.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${FlitCarColors.primary}15`, color: FlitCarColors.primary }}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================
          BANNER - Inscription newsletter avec couleurs FLIT
          ======================================================================== */}
      <section className="py-12" style={{ backgroundColor: FlitCarColors.primary }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            {t('home.newsletter.title')}
          </h2>
          <p className="text-white opacity-90 text-lg mb-6">
            {t('home.newsletter.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              placeholder={t('home.newsletter.placeholder')}
              className="flex-1 px-4 py-3 rounded-md border-0 focus:outline-none focus:ring-2 text-base"
              style={{ '--tw-ring-color': FlitCarColors.primaryDark } as any}
            />
            <button className="bg-white hover:bg-gray-50 font-bold px-8 py-3 rounded-md transition-colors whitespace-nowrap" style={{ color: FlitCarColors.primary }}>
              {t('home.newsletter.subscribe')}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================
          STATS - Couleurs FLIT
          ======================================================================== */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: t('home.stats.availableVehicles') },
              { value: '2M+', label: t('home.stats.satisfiedClients') },
              { value: '15', label: t('home.stats.citiesCovered') },
              { value: '4.8/5', label: t('home.stats.averageRating') },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold mb-2" style={{ color: FlitCarColors.primary }}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
