/**
 * PhoneInput Component - Input téléphone avec sélecteur d'indicatif pays
 */

import React, { useState, useRef, useEffect } from 'react';
import { FaPhone, FaChevronDown } from 'react-icons/fa6';

interface CountryCode {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: 'MA', name: 'Maroc', dial_code: '+212', flag: '🇲🇦' },
  { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷' },
  { code: 'ES', name: 'Espagne', dial_code: '+34', flag: '🇪🇸' },
  { code: 'BE', name: 'Belgique', dial_code: '+32', flag: '🇧🇪' },
  { code: 'DE', name: 'Allemagne', dial_code: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', dial_code: '+39', flag: '🇮🇹' },
  { code: 'GB', name: 'Royaume-Uni', dial_code: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis', dial_code: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dial_code: '+1', flag: '🇨🇦' },
  { code: 'DZ', name: 'Algérie', dial_code: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', dial_code: '+216', flag: '🇹🇳' },
  { code: 'SA', name: 'Arabie Saoudite', dial_code: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'Émirats Arabes Unis', dial_code: '+971', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar', dial_code: '+974', flag: '🇶🇦' },
  { code: 'PT', name: 'Portugal', dial_code: '+351', flag: '🇵🇹' },
  { code: 'CH', name: 'Suisse', dial_code: '+41', flag: '🇨🇭' },
  { code: 'NL', name: 'Pays-Bas', dial_code: '+31', flag: '🇳🇱' },
  { code: 'EG', name: 'Égypte', dial_code: '+20', flag: '🇪🇬' },
  { code: 'SN', name: 'Sénégal', dial_code: '+221', flag: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', dial_code: '+225', flag: '🇨🇮' },
];

// Sort by dial code length (longest first) to match more specific codes first
const sortedCountryCodes = [...countryCodes].sort(
  (a, b) => b.dial_code.length - a.dial_code.length
);

/**
 * Detect country from phone number based on dial code
 */
const detectCountryFromPhone = (phone: string): CountryCode | null => {
  if (!phone) return null;

  // Normalize phone number
  const normalized = phone.replace(/[\s\-\(\)]/g, '');

  // Check if starts with + or 00
  let phoneWithPlus = normalized;
  if (normalized.startsWith('00')) {
    phoneWithPlus = '+' + normalized.substring(2);
  } else if (!normalized.startsWith('+')) {
    return null; // No country code detected
  }

  // Find matching country by dial code (longest match first)
  for (const country of sortedCountryCodes) {
    if (phoneWithPlus.startsWith(country.dial_code)) {
      return country;
    }
  }

  return null;
};

/**
 * Extract local number from phone (without dial code)
 */
const extractLocalNumber = (phone: string, dialCode: string): string => {
  if (!phone) return '';
  const normalized = phone.replace(/[\s\-\(\)]/g, '');

  let phoneWithPlus = normalized;
  if (normalized.startsWith('00')) {
    phoneWithPlus = '+' + normalized.substring(2);
  }

  if (phoneWithPlus.startsWith(dialCode)) {
    return phoneWithPlus.substring(dialCode.length);
  }

  return normalized;
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (dialCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
  defaultCountryCode?: string; // Indicatif par défaut (ex: '' pour Maroc, '+33' pour France)
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onCountryChange,
  disabled = false,
  placeholder = '6XX XXX XXX',
  className = '',
  error,
  defaultCountryCode = '+212',
}) => {
  // Detect country from initial value or use default
  const getInitialCountry = (): CountryCode => {
    const detected = detectCountryFromPhone(value);
    if (detected) return detected;
    return countryCodes.find(c => c.dial_code === defaultCountryCode) || countryCodes[0];
  };

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(getInitialCountry);
  const [localNumber, setLocalNumber] = useState<string>(() => {
    const detected = detectCountryFromPhone(value);
    if (detected) {
      return extractLocalNumber(value, detected.dial_code);
    }
    // If no country code detected, return value as is (might be local number)
    return value.replace(/[\s\-\(\)]/g, '').replace(/^\+?212/, '');
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Detect country from value when it changes externally (e.g., from user profile)
  useEffect(() => {
    if (!hasInitialized.current && value) {
      hasInitialized.current = true;
      const detected = detectCountryFromPhone(value);
      if (detected) {
        setSelectedCountry(detected);
        setLocalNumber(extractLocalNumber(value, detected.dial_code));
      }
    }
  }, [value]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');

    if (onCountryChange) {
      onCountryChange(country.dial_code);
    }

    // Update the full value with new dial code
    onChange(country.dial_code + localNumber);
  };

  const handleLocalNumberChange = (newLocalNumber: string) => {
    // Remove any dial code if user pastes full number
    let cleanNumber = newLocalNumber.replace(/[\s\-\(\)]/g, '');

    // Check if user pasted a full number with country code
    const detected = detectCountryFromPhone(cleanNumber);
    if (detected) {
      setSelectedCountry(detected);
      cleanNumber = extractLocalNumber(cleanNumber, detected.dial_code);
    }

    setLocalNumber(cleanNumber);
    onChange(selectedCountry.dial_code + cleanNumber);
  };

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dial_code.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <div className={`flex ${className}`}>
        {/* Country Code Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`flex items-center space-x-2 px-3 py-3 rounded-l-xl border border-r-0 border-gray-200 hover:bg-gray-50 transition-colors ${
              disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
            } ${error ? 'border-red-500' : 'border-gray-200'}`}
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            {selectedCountry.dial_code && (
              <span className="text-sm font-semibold text-gray-700">{selectedCountry.dial_code}</span>
            )}
            <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-50 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un pays..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                  autoFocus
                />
              </div>

              {/* Countries List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                        selectedCountry.code === country.code ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-gray-900">{country.name}</div>
                          <div className="text-xs text-gray-500">{country.code}</div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        {country.dial_code || 'Local'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400">
                    <p className="text-sm font-semibold">Aucun pays trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Input */}
        <div className="relative flex-1">
          <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input
            type="tel"
            value={localNumber}
            onChange={(e) => handleLocalNumberChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full pl-12 pr-4 py-3 rounded-r-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white focus:border-primary'
            } ${error ? 'border-red-500' : 'border-gray-200'}`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;
