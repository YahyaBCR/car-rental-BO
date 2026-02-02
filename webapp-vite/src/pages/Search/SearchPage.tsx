/**
 * Search Page - Booking.com Style with FLIT Colors
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Datepicker from 'react-tailwindcss-datepicker';
import {
  IoLocationOutline,
  IoCalendarOutline,
  IoCarSportOutline,
  IoStarSharp,
  IoCheckmarkCircle,
  IoClose,
  IoFunnelOutline,
  IoPeopleOutline,
  IoSpeedometerOutline
} from 'react-icons/io5';
import { FaGasPump } from 'react-icons/fa6';
import { carsApi } from '../../services/api/carsApi';
import { bookingsApi } from '../../services/api/bookingsApi';
import { locationsApi } from '../../services/api/locationsApi';
import type { Car, Airport, SearchFilters as SearchFiltersType } from '../../types/car.types';
import type { Location } from '../../services/api/locationsApi';
import { FlitCarColors } from '../../constants/colors';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyFormat();

  // Search states
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);

  // Search box states
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationType, setLocationType] = useState<'airport' | 'city'>('airport');
  const [dateValue, setDateValue] = useState<{startDate: Date | null, endDate: Date | null}>({
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null
  });
  const [startTime, setStartTime] = useState(searchParams.get('startTime') || '10:00');
  const [endTime, setEndTime] = useState(searchParams.get('endTime') || '10:00');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Filters states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    page: 1,
    limit: 20,
    sortBy: 'price',
    sortOrder: 'asc',
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    airportId: searchParams.get('airportId') || undefined,
    cityId: searchParams.get('cityId') || undefined,
  });

  // Filter options
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedFuel, setSelectedFuel] = useState<string>('');
  const [minSeats, setMinSeats] = useState<number>(0);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadLocations();
    loadCars();
  }, []);

  useEffect(() => {
    loadCars();
  }, [filters]);

  // Pré-remplir le lieu sélectionné depuis l'URL
  useEffect(() => {
    const airportId = searchParams.get('airportId');
    const cityId = searchParams.get('cityId');
    const locationId = airportId || cityId;
    const type = airportId ? 'airport' : 'city';

    if (locationId && locations.length > 0 && !selectedLocation) {
      const location = locations.find(loc => loc.id === locationId);
      if (location) {
        setSelectedLocation(location);
        setLocationType(location.type);
        setLocationSearchQuery(location.type === 'airport' ? `${location.city} - ${location.name}` : location.name);
      }
    }
  }, [searchParams, locations]);

  const loadLocations = async () => {
    try {
      const data = await locationsApi.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('❌ Error loading locations:', error);
    }
  };

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await carsApi.searchCars(filters);
      console.log('🚗 Cars loaded:', response);
      setCars(response.cars || []);
    } catch (error) {
      console.error('❌ Error loading cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const newFilters: SearchFiltersType = {
      ...filters,
      startDate: dateValue.startDate ? dateValue.startDate.toISOString().split('T')[0] : undefined,
      endDate: dateValue.endDate ? dateValue.endDate.toISOString().split('T')[0] : undefined,
      airportId: selectedLocation?.type === 'airport' ? selectedLocation.id : undefined,
      cityId: selectedLocation?.type === 'city' ? selectedLocation.id : undefined,
      type: selectedType || undefined,
      transmission: selectedTransmission || undefined,
      fuelType: selectedFuel || undefined,
      minSeats: minSeats > 0 ? minSeats : undefined,
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSelectedType('');
    setSelectedTransmission('');
    setSelectedFuel('');
    setMinSeats(0);
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'price',
      sortOrder: 'asc',
      startDate: dateValue.startDate ? dateValue.startDate.toISOString().split('T')[0] : undefined,
      endDate: dateValue.endDate ? dateValue.endDate.toISOString().split('T')[0] : undefined,
      airportId: selectedLocation?.type === 'airport' ? selectedLocation.id : undefined,
      cityId: selectedLocation?.type === 'city' ? selectedLocation.id : undefined,
    });
  };

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

  const getCarFeatures = (car: Car): string[] => {
    const features: string[] = [];
    if (car.transmission === 'automatic') features.push('Automatique');
    else if (car.transmission === 'manual') features.push('Manuelle');

    const fuel = (car.fuelType || car.fuel_type)?.toLowerCase();
    if (fuel === 'diesel') features.push('Diesel');
    else if (fuel === 'essence' || fuel === 'gasoline') features.push('Essence');

    if (car.seats) features.push(`${car.seats} places`);
    return features.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec recherche collapsible */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Version réduite - Toujours visible */}
          {!isSearchExpanded && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <IoLocationOutline className="text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      {selectedLocation ? (selectedLocation.type === 'airport' ? selectedLocation.city : selectedLocation.name) : t('home.search.searchLocation')}
                    </span>
                  </div>
                  {dateValue.startDate && dateValue.endDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <IoCalendarOutline />
                      <span>
                        {new Date(dateValue.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} {startTime}
                        {' → '}
                        {new Date(dateValue.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} {endTime}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-50"
                  style={{ color: FlitCarColors.primary }}
                >
                  {t('common.edit')} ▼
                </button>
              </div>
            </div>
          )}

          {/* Version complète - Visible quand expanded */}
          {isSearchExpanded && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{t('common.edit')} {t('common.search').toLowerCase()}</h2>
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <IoClose className="text-2xl" />
                </button>
              </div>

              <div className="rounded-lg p-1" style={{ backgroundColor: FlitCarColors.primary }}>
                <div className="bg-white rounded-md p-4">
                  <div className="space-y-4">
                    {/* Location - Autocomplete */}
                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <IoLocationOutline />
                          {t('home.search.pickupLocation')}
                        </div>
                      </label>
                      <input
                        type="text"
                        value={locationSearchQuery}
                        onChange={(e) => {
                          setLocationSearchQuery(e.target.value);
                          setShowLocationDropdown(true);
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                        placeholder={t('home.search.searchLocation')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': FlitCarColors.primary } as any}
                        onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                      />

                      {showLocationDropdown && filteredLocations.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-60 overflow-y-auto">
                          {filteredLocations.map((location) => (
                            <button
                              key={location.id}
                              type="button"
                              onClick={() => {
                                setSelectedLocation(location);
                                setLocationType(location.type);
                                setLocationSearchQuery(location.type === 'airport' ? `${location.city} - ${location.name}` : location.name);
                                setShowLocationDropdown(false);
                              }}
                              className="w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0 flex items-center gap-2"
                            >
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center text-xs font-black text-white flex-shrink-0"
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
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Date de prise en charge */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <IoCalendarOutline />
                          {t('home.search.pickupDate')}
                        </div>
                      </label>
                      <div className="datepicker-wrapper">
                        <Datepicker
                          value={{ startDate: dateValue.startDate as any, endDate: dateValue.startDate as any }}
                          onChange={(newValue: any) => setDateValue(prev => ({ ...prev, startDate: newValue?.startDate }))}
                          minDate={new Date()}
                          primaryColor="teal"
                          placeholder={t('home.search.selectPickupDate')}
                          asSingle={true}
                          useRange={false}
                          displayFormat="DD/MM/YYYY"
                          i18n="fr"
                          inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent text-sm"
                          readOnly={true}
                        />
                      </div>
                    </div>

                    {/* Date de restitution */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <IoCalendarOutline />
                          {t('home.search.returnDate')}
                        </div>
                      </label>
                      <div className="datepicker-wrapper">
                        <Datepicker
                          value={{ startDate: dateValue.endDate as any, endDate: dateValue.endDate as any }}
                          onChange={(newValue: any) => setDateValue(prev => ({ ...prev, endDate: newValue?.startDate }))}
                          minDate={dateValue.startDate ? new Date(dateValue.startDate as any) : new Date()}
                          primaryColor="teal"
                          placeholder={t('home.search.selectReturnDate')}
                          asSingle={true}
                          useRange={false}
                          displayFormat="DD/MM/YYYY"
                          i18n="fr"
                          inputClassName="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent text-sm"
                          readOnly={true}
                        />
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {t('home.search.pickupTime')}
                        </label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent text-sm"
                          style={{ '--tw-ring-color': FlitCarColors.primary } as any}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          {t('home.search.returnTime')}
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent text-sm"
                          style={{ '--tw-ring-color': FlitCarColors.primary } as any}
                        />
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsSearchExpanded(false)}
                        className="flex-1 py-3 rounded-md border-2 font-bold transition-opacity"
                        style={{ borderColor: FlitCarColors.primary, color: FlitCarColors.primary }}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={() => {
                          handleSearch();
                          setIsSearchExpanded(false);
                        }}
                        className="flex-1 py-3 rounded-md text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
                        style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                      >
                        {t('home.search.searchButton')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:w-80">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">{t('common.filters')}</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: FlitCarColors.primary }}
                >
                  {t('common.reset')}
                </button>
              </div>

              <div className="space-y-6">
                {/* Type de véhicule */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">{t('carDetails.specifications')}</h3>
                  <div className="space-y-2">
                    {['Berline', 'SUV', 'Compact', 'Luxe'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          checked={selectedType === type}
                          onChange={() => setSelectedType(type)}
                          className="w-4 h-4 accent-teal-600"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Transmission</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'automatic', label: 'Automatique' },
                      { value: 'manual', label: 'Manuelle' }
                    ].map((trans) => (
                      <label key={trans.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="transmission"
                          checked={selectedTransmission === trans.value}
                          onChange={() => setSelectedTransmission(trans.value)}
                          className="w-4 h-4 accent-teal-600"
                        />
                        <span className="text-sm text-gray-700">{trans.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Carburant */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Carburant</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'essence', label: 'Essence' },
                      { value: 'diesel', label: 'Diesel' }
                    ].map((fuel) => (
                      <label key={fuel.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="fuel"
                          checked={selectedFuel === fuel.value}
                          onChange={() => setSelectedFuel(fuel.value)}
                          className="w-4 h-4 accent-teal-600"
                        />
                        <span className="text-sm text-gray-700">{fuel.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Nombre de places */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Places minimum</h3>
                  <select
                    value={minSeats}
                    onChange={(e) => setMinSeats(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': FlitCarColors.primary } as any}
                  >
                    <option value="0">{t('common.filter')}</option>
                    <option value="2">2+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                    <option value="7">7+</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="w-full mt-6 py-3 rounded-md text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
              >
                {t('common.apply')} {t('common.filters').toLowerCase()}
              </button>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden fixed bottom-4 right-4 z-50 px-6 py-3 rounded-full text-white font-bold shadow-2xl flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
          >
            <IoFunnelOutline className="text-xl" />
            {t('common.filters')}
          </button>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-700">
                <span className="font-bold">{cars.length}</span> {t('home.popularDestinations.availableVehicles')}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderTopColor: FlitCarColors.primary }}></div>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <IoCarSportOutline className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('common.noResultsFound')}
                </h3>
                <p className="text-gray-600">
                  {t('common.tryAnotherSearch')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cars.map((car, index) => {
                  const images = car.images || car.image_urls || [];
                  const totalPrice = car.pricing?.totalPrice || car.total_price || 0;
                  const rating = car.rating || 4.5;
                  const features = getCarFeatures(car);

                  return (
                    <div
                      key={car.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/cars/${car.id}`, {
                        state: {
                          startDate: dateValue.startDate ? (dateValue.startDate instanceof Date ? dateValue.startDate.toISOString().split('T')[0] : dateValue.startDate) : null,
                          endDate: dateValue.endDate ? (dateValue.endDate instanceof Date ? dateValue.endDate.toISOString().split('T')[0] : dateValue.endDate) : null,
                          startTime,
                          endTime,
                          location: selectedLocation,
                        }
                      })}
                    >
                      <div className="flex flex-col md:flex-row md:h-64">
                        {/* Image */}
                        <div className="w-full md:w-80 h-48 md:h-64 flex-shrink-0 relative">
                          <img
                            src={images[0] || 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80'}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                          {index < 3 && (
                            <div className="absolute top-3 left-3 px-3 py-1 rounded text-white text-xs font-bold" style={{ backgroundColor: FlitCarColors.primary }}>
                              {index === 0 ? t('home.specialOffers.badges.bestDeal') : index === 1 ? t('home.specialOffers.badges.mostBooked') : t('home.specialOffers.badges.premium')}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between min-h-0">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {car.brand} {car.model}
                                </h3>
                                <p className="text-sm text-gray-600">{car.type || 'Berline'} • {car.year}</p>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: FlitCarColors.primary }}>
                                <IoStarSharp className="text-white text-sm" />
                                <span className="text-white font-bold text-sm">{rating.toFixed(1)}</span>
                              </div>
                            </div>

                            {/* Features */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  <IoCheckmarkCircle className="text-teal-600" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-end justify-between mt-4">
                            <div>
                              <p className="text-sm text-gray-500">{t('booking.priceBreakdown.total')}</p>
                              <p className="text-3xl font-black" style={{ color: FlitCarColors.primary }}>
                                {formatPrice(totalPrice)}
                              </p>
                            </div>
                            <button
                              className="px-6 py-2 rounded-lg text-white font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                              style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                            >
                              {t('carDetails.bookNow')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{t('common.filters')}</h2>
              <button onClick={() => setShowFilters(false)}>
                <IoClose className="text-2xl text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Same filters as desktop */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{t('carDetails.specifications')}</h3>
                <div className="space-y-2">
                  {['Berline', 'SUV', 'Compact', 'Luxe'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type-mobile"
                        checked={selectedType === type}
                        onChange={() => setSelectedType(type)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Transmission</h3>
                <div className="space-y-2">
                  {[
                    { value: 'automatic', label: 'Automatique' },
                    { value: 'manual', label: 'Manuelle' }
                  ].map((trans) => (
                    <label key={trans.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transmission-mobile"
                        checked={selectedTransmission === trans.value}
                        onChange={() => setSelectedTransmission(trans.value)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-sm text-gray-700">{trans.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Carburant</h3>
                <div className="space-y-2">
                  {[
                    { value: 'essence', label: 'Essence' },
                    { value: 'diesel', label: 'Diesel' }
                  ].map((fuel) => (
                    <label key={fuel.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="fuel-mobile"
                        checked={selectedFuel === fuel.value}
                        onChange={() => setSelectedFuel(fuel.value)}
                        className="w-4 h-4 accent-teal-600"
                      />
                      <span className="text-sm text-gray-700">{fuel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Places minimum</h3>
                <select
                  value={minSeats}
                  onChange={(e) => setMinSeats(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="0">{t('common.filter')}</option>
                  <option value="2">2+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                  <option value="7">7+</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 rounded-lg border-2 font-bold"
                style={{ borderColor: FlitCarColors.primary, color: FlitCarColors.primary }}
              >
                {t('common.reset')}
              </button>
              <button
                onClick={() => {
                  handleSearch();
                  setShowFilters(false);
                }}
                className="flex-1 py-3 rounded-lg text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
              >
                {t('common.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
