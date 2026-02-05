import React from 'react';

// Country codes with their dial codes and flag emojis
const COUNTRY_DIAL_CODES: { code: string; dialCode: string; flag: string; name: string }[] = [
  { code: 'MA', dialCode: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: 'FR', dialCode: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'Espagne' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'États-Unis' },
  { code: 'GB', dialCode: '+44', flag: '🇬🇧', name: 'Royaume-Uni' },
  { code: 'DE', dialCode: '+49', flag: '🇩🇪', name: 'Allemagne' },
  { code: 'IT', dialCode: '+39', flag: '🇮🇹', name: 'Italie' },
  { code: 'PT', dialCode: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: 'BE', dialCode: '+32', flag: '🇧🇪', name: 'Belgique' },
  { code: 'CH', dialCode: '+41', flag: '🇨🇭', name: 'Suisse' },
  { code: 'NL', dialCode: '+31', flag: '🇳🇱', name: 'Pays-Bas' },
  { code: 'DZ', dialCode: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: 'TN', dialCode: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: 'EG', dialCode: '+20', flag: '🇪🇬', name: 'Égypte' },
  { code: 'SA', dialCode: '+966', flag: '🇸🇦', name: 'Arabie Saoudite' },
  { code: 'AE', dialCode: '+971', flag: '🇦🇪', name: 'Émirats Arabes Unis' },
  { code: 'CA', dialCode: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: 'SN', dialCode: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: 'CI', dialCode: '+225', flag: '🇨🇮', name: 'Côte d\'Ivoire' },
];

// Sort by dial code length (longest first) to match more specific codes first
const SORTED_DIAL_CODES = [...COUNTRY_DIAL_CODES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

interface PhoneDisplayProps {
  phone: string;
  className?: string;
}

/**
 * Detects the country from a phone number and returns the flag and formatted number
 */
const parsePhoneNumber = (phone: string): { flag: string; dialCode: string; localNumber: string; countryName: string } => {
  if (!phone) {
    return { flag: '🌐', dialCode: '', localNumber: '', countryName: 'Inconnu' };
  }

  // Normalize the phone number (remove spaces, dashes, parentheses)
  const normalized = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it starts with + or 00
  let phoneWithPlus = normalized;
  if (normalized.startsWith('00')) {
    phoneWithPlus = '+' + normalized.substring(2);
  } else if (!normalized.startsWith('+')) {
    // If no country code, assume Morocco
    return {
      flag: '🇲🇦',
      dialCode: '+212',
      localNumber: normalized.startsWith('0') ? normalized.substring(1) : normalized,
      countryName: 'Maroc'
    };
  }

  // Find the matching country code
  for (const country of SORTED_DIAL_CODES) {
    if (phoneWithPlus.startsWith(country.dialCode)) {
      const localNumber = phoneWithPlus.substring(country.dialCode.length);
      return {
        flag: country.flag,
        dialCode: country.dialCode,
        localNumber: localNumber,
        countryName: country.name,
      };
    }
  }

  // If no match found, return the full number with a generic flag
  return {
    flag: '🌐',
    dialCode: '',
    localNumber: phoneWithPlus,
    countryName: 'Inconnu'
  };
};

/**
 * Formats a local phone number with spaces for readability
 */
const formatLocalNumber = (localNumber: string): string => {
  // Remove any leading zeros
  const number = localNumber.replace(/^0+/, '');

  // Format based on length
  if (number.length <= 6) {
    return number;
  } else if (number.length <= 9) {
    // Format as XXX XXX XXX
    return number.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3').trim();
  } else {
    // Format as XXX XX XX XX XX for longer numbers
    return number.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5').trim();
  }
};

const PhoneDisplay: React.FC<PhoneDisplayProps> = ({ phone, className = '' }) => {
  if (!phone) {
    return <span className={`text-gray-400 ${className}`}>Non renseigné</span>;
  }

  const { flag, dialCode, localNumber, countryName } = parsePhoneNumber(phone);
  const formattedLocal = formatLocalNumber(localNumber);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xl" title={countryName}>{flag}</span>
      <span className="text-sm text-textPrimary">
        {dialCode && <span className="text-textSecondary">{dialCode} </span>}
        {formattedLocal}
      </span>
    </div>
  );
};

export default PhoneDisplay;
