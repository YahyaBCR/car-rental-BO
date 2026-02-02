/**
 * SearchBox Component - Recherche rapide avec aéroport et dates
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Datepicker from 'react-tailwindcss-datepicker';
import type { Location } from '../../services/api/locationsApi';
import { locationsApi } from '../../services/api/locationsApi';
import { FlitCarColors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

interface SearchBoxProps {
  variant?: 'hero' | 'card'; // hero = glassmorphism, card = white card
  onSearch?: () => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ variant = 'card', onSearch }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [dateValue, setDateValue] = useState({
    startDate: null,
    endDate: null
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [locationId, setLocationId] = useState('');
  const [locationType, setLocationType] = useState<'airport' | 'city'>('airport');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  useEffect(() => {
    loadLocations();
  }, [i18n.language]); // Reload when language changes

  const loadLocations = async () => {
    try {
      // Normalize language to 2-letter code (ar-MA -> ar, en-US -> en)
      const currentLang = i18n.language.split('-')[0];
      console.log('🌍 Loading locations with language:', currentLang);
      const data = await locationsApi.getAllLocations(currentLang);
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleQuickSearch = () => {
    const params = new URLSearchParams();

    // Convert dates to YYYY-MM-DD format for the API
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

    if (onSearch) onSearch();
  };

  const isHeroVariant = variant === 'hero';
  const containerClasses = isHeroVariant
    ? "backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-10 border border-white/20"
    : "bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-gray-100";

  const labelClasses = isHeroVariant
    ? "block text-base font-bold text-white mb-4 flex items-center"
    : "block text-base font-bold text-gray-900 mb-4 flex items-center";

  const inputClasses = isHeroVariant
    ? "w-full px-5 py-5 rounded-xl bg-white/95 backdrop-blur border-0 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 font-semibold hover:bg-white transition-all"
    : "w-full px-5 py-5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all";

  return (
    <div
      className={containerClasses}
      style={isHeroVariant ? { boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' } : {}}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Location Selector (Airports + Cities) */}
        <div className="relative">
          <label className={labelClasses}>
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Lieu de prise en charge
          </label>
          <button
            type="button"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className={inputClasses + " text-left"}
          >
            {selectedLocation ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                  >
                    {selectedLocation.type === 'airport' ? selectedLocation.code : selectedLocation.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-gray-900 font-semibold text-sm truncate">
                    {selectedLocation.name}
                    {selectedLocation.type === 'city' && <span className="text-xs text-gray-500 ml-1">(Ville)</span>}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Choisir un lieu</span>
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

          {/* Dropdown */}
          {isLocationDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <div className="relative">
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    placeholder="Rechercher un lieu..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-gray-50 hover:bg-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
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
                      <div className="px-4 py-12 text-center text-gray-400">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="font-semibold">Aucun lieu trouvé</p>
                        <p className="text-sm mt-1">Essayez une autre recherche</p>
                      </div>
                    );
                  }

                  return filteredLocations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(location);
                        setLocationId(location.id);
                        setLocationType(location.type);
                        setIsLocationDropdownOpen(false);
                        setLocationSearchQuery('');
                      }}
                      className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                    >
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
                            {location.type === 'airport' ? `Aéroport • ${location.city}` : `Ville • ${location.region}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="relative">
          <label className={labelClasses}>
            <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Dates de location
          </label>
          <div className="space-y-3">
            <div className="datepicker-wrapper">
              <Datepicker
                value={dateValue}
                onChange={(newValue: any) => setDateValue(newValue)}
                minDate={new Date()}
                primaryColor="teal"
                placeholder="Sélectionnez vos dates"
                separator="au"
                displayFormat="DD/MM/YYYY"
                i18n="fr"
                inputClassName={inputClasses + " text-base"}
                containerClassName="relative"
                readOnly={true}
              />
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={isHeroVariant ? "block text-sm font-semibold text-white mb-2" : "block text-sm font-semibold text-gray-700 mb-2"}>
                  Heure de départ
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClasses + " py-3 px-4"}
                />
              </div>
              <div>
                <label className={isHeroVariant ? "block text-sm font-semibold text-white mb-2" : "block text-sm font-semibold text-gray-700 mb-2"}>
                  Heure de retour
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClasses + " py-3 px-4"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleQuickSearch}
        className="w-full py-5 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
      >
        Rechercher
      </button>
    </div>
  );
};

export default SearchBox;
