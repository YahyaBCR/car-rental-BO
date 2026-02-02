/**
 * Search Filters Component - Responsive with Mobile Sidebar
 */

import React, { useState, useEffect } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import { FaCalendar, FaPlane, FaCar, FaGear, FaGasPump, FaUsers, FaDollarSign, FaLocationDot, FaXmark, FaFilter } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import type { SearchFilters as SearchFiltersType, Airport } from '../../types/car.types';
import { bookingsApi } from '../../services/api/bookingsApi';
import { locationsApi } from '../../services/api/locationsApi';
import type { Location } from '../../services/api/locationsApi';
import { FlitCarColors } from '../../constants/colors';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange }) => {
  const { t, i18n } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationType, setLocationType] = useState<'airport' | 'city'>('airport');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    // Find selected location on initial load
    const locationId = localFilters.airportId || localFilters.cityId;
    if (locationId && locations.length > 0) {
      const location = locations.find(loc => loc.id === locationId);
      if (location) {
        setSelectedLocation(location);
        setLocationType(location.type);
      }
    }
  }, [localFilters.airportId, localFilters.cityId, locations]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const loadLocations = async () => {
    try {
      const data = await locationsApi.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setLocationType(location.type);
    if (location.type === 'airport') {
      handleChange('airportId', location.id);
      handleChange('cityId', undefined);
    } else {
      handleChange('cityId', location.id);
      handleChange('airportId', undefined);
    }
    setIsLocationDropdownOpen(false);
    setLocationSearchQuery('');
  };

  const applyFilters = () => {
    // Include times in the filters
    const filtersWithTime = {
      ...localFilters,
      startTime,
      endTime
    };
    onFilterChange(filtersWithTime);
    setIsMobileMenuOpen(false); // Close mobile menu after applying
  };

  const resetFilters = () => {
    const defaultFilters: SearchFiltersType = {
      page: 1,
      limit: 20,
      sortBy: 'price',
      sortOrder: 'asc',
    };
    setLocalFilters(defaultFilters);
    setSelectedLocation(null);
    onFilterChange(defaultFilters);
  };

  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-gray-900">{t('search.filters.title')}</h3>
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: FlitCarColors.primary }}
        />
      </div>

      {/* ===== DATES SECTION - Modern Design ===== */}
      <div className="mb-8">
        <label className="flex items-center text-sm font-bold text-gray-900 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
            style={{ backgroundColor: `${FlitCarColors.primary}15` }}
          >
            <FaCalendar style={{ color: FlitCarColors.primary }} />
          </div>
          {t('home.search.rentalDates')}
        </label>

        <div className="space-y-4">
          {/* Date Range Picker */}
          <div className="datepicker-wrapper">
            <Datepicker
              value={{
                startDate: localFilters.startDate || null,
                endDate: localFilters.endDate || null
              } as any}
              onChange={(newValue: any) => {
                if (newValue) {
                  handleChange('startDate', newValue.startDate);
                  handleChange('endDate', newValue.endDate);
                }
              }}
              minDate={new Date()}
              primaryColor="teal"
              placeholder={t('common.selectDates')}
              separator={i18n.language === 'ar' ? 'إلى' : i18n.language === 'en' ? 'to' : 'au'}
              displayFormat="DD/MM/YYYY"
              i18n={i18n.language === 'ar' ? 'ar' : i18n.language === 'en' ? 'en' : 'fr'}
              inputClassName="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white"
              containerClassName="relative"
              readOnly={true}
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            {/* Start Time */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">
                {t('home.search.startDate')}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white text-sm"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">
                {t('home.search.endDate')}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white text-sm"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Days Count Display */}
          {localFilters.startDate && localFilters.endDate && (
            <div
              className="p-3 rounded-xl text-center"
              style={{ backgroundColor: `${FlitCarColors.primary}10` }}
            >
              <div className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                {Math.ceil((new Date(localFilters.endDate).getTime() - new Date(localFilters.startDate).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-xs font-semibold text-gray-600 uppercase">{t('common.day_plural')}</div>
            </div>
          )}
        </div>
      </div>

      {/* ===== LOCATION SECTION - Custom Dropdown (Airports + Cities) ===== */}
      <div className="mb-8">
        <label className="flex items-center text-sm font-bold text-gray-900 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-3"
            style={{ backgroundColor: `${FlitCarColors.primary}15` }}
          >
            <FaLocationDot style={{ color: FlitCarColors.primary }} />
          </div>
          {t('home.search.pickupLocation')}
        </label>

        <div className="relative">
          {/* Selected Location Display / Trigger */}
          <button
            type="button"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 hover:border-primary focus:border-primary focus:outline-none transition-all text-left bg-gray-50 hover:bg-white group"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {selectedLocation ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                  >
                    {selectedLocation.type === 'airport' ? selectedLocation.code : selectedLocation.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{selectedLocation.name}</div>
                    <div className="text-xs text-gray-500">
                      {selectedLocation.type === 'airport' ? `${t('booking.airport')} • ${selectedLocation.city}` : `${t('booking.city')} • ${selectedLocation.region}`}
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaLocationDot className="text-gray-400 group-hover:text-primary transition-colors" />
                  <span className="text-gray-500 font-medium">{t('booking.chooseLocation')}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </button>

          {/* Dropdown List */}
          {isLocationDropdownOpen && (
            <div
              className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    placeholder={t('home.search.searchLocation')}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Location List - Scrollable */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {/* All Locations Option */}
                {!locationSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation(null);
                      handleChange('airportId', undefined);
                      handleChange('cityId', undefined);
                      setIsLocationDropdownOpen(false);
                      setLocationSearchQuery('');
                    }}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FaLocationDot className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{t('search.filters.typeAll')}</div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Filtered Location List */}
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
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {t('common.noResultsFound')}
                      </div>
                    );
                  }

                  return filteredLocations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white"
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
                    </div>
                    {selectedLocation?.id === location.id && (
                      <svg
                        className="w-5 h-5"
                        style={{ color: FlitCarColors.primary }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

      {/* Car Type */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <FaCar className="mr-2" style={{ color: FlitCarColors.primary }} />
          {t('search.filters.carType')}
        </label>
        <select
          value={localFilters.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white"
        >
          <option value="">{t('search.filters.typeAll')}</option>
          <option value="citadine">{t('search.filters.typeHatchback')}</option>
          <option value="berline">{t('search.filters.typeSedan')}</option>
          <option value="suv">{t('search.filters.typeSuv')}</option>
          <option value="compact">{t('search.filters.typeHatchback')}</option>
          <option value="luxe">{t('search.filters.typeLuxury')}</option>
          <option value="utilitaire">{t('search.filters.typeMinivan')}</option>
          <option value="monospace">{t('search.filters.typeMinivan')}</option>
        </select>
      </div>

      {/* Transmission */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <FaGear className="mr-2" style={{ color: FlitCarColors.primary }} />
          {t('search.filters.transmission')}
        </label>
        <select
          value={localFilters.transmission || ''}
          onChange={(e) => handleChange('transmission', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white"
        >
          <option value="">{t('search.filters.transmissionAll')}</option>
          <option value="manual">{t('search.filters.transmissionManual')}</option>
          <option value="automatic">{t('search.filters.transmissionAutomatic')}</option>
        </select>
      </div>

      {/* Fuel Type */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <FaGasPump className="mr-2" style={{ color: FlitCarColors.primary }} />
          {t('search.filters.fuelType')}
        </label>
        <select
          value={localFilters.fuelType || ''}
          onChange={(e) => handleChange('fuelType', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white"
        >
          <option value="">{t('search.filters.fuelAll')}</option>
          <option value="gasoline">{t('search.filters.fuelGasoline')}</option>
          <option value="diesel">{t('search.filters.fuelDiesel')}</option>
          <option value="electric">{t('search.filters.fuelElectric')}</option>
          <option value="hybrid">{t('search.filters.fuelHybrid')}</option>
        </select>
      </div>

      {/* Seats */}
      <div className="mb-6">
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <FaUsers className="mr-2" style={{ color: FlitCarColors.primary }} />
          {t('search.filters.seats')}
        </label>
        <select
          value={localFilters.minSeats || ''}
          onChange={(e) => handleChange('minSeats', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white"
        >
          <option value="">{t('search.filters.seatsAll')}</option>
          <option value="2">{t('search.filters.seatsMin', { count: 2 })}</option>
          <option value="4">{t('search.filters.seatsMin', { count: 4 })}</option>
          <option value="5">{t('search.filters.seatsMin', { count: 5 })}</option>
          <option value="7">{t('search.filters.seatsMin', { count: 7 })}</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
          <FaDollarSign className="mr-2" style={{ color: FlitCarColors.primary }} />
          {t('search.filters.pricePerDay')} (DH)
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">{t('search.filters.minPrice')}</label>
            <input
              type="number"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wide">{t('search.filters.maxPrice')}</label>
            <input
              type="number"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="10000"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-all text-gray-900 font-medium bg-gray-50 hover:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={applyFilters}
          className="w-full py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})`,
          }}
        >
          {t('search.filters.apply')}
        </button>
        <button
          onClick={resetFilters}
          className="w-full py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-700"
        >
          {t('search.filters.reset')}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button - Fixed at bottom */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})`,
        }}
      >
        <FaFilter className="text-xl" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-black text-gray-900">Filtres de recherche</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <FaXmark className="text-gray-600" />
          </button>
        </div>

        {/* Mobile Filter Content */}
        <div className="p-6">
          <FilterContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-lg p-6 sticky top-24">
        <FilterContent />
      </div>
    </>
  );
};

export default SearchFilters;
