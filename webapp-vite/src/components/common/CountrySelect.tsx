/**
 * Country Select Component
 * Sélecteur de pays de résidence
 */

import React from 'react';
import { IoGlobeOutline } from 'react-icons/io5';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

// Liste des pays les plus courants pour la location de voiture au Maroc
const COUNTRIES = [
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪' },
  { code: 'SA', name: 'Arabie Saoudite', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳' },
].sort((a, b) => a.name.localeCompare(b.name));

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  error,
  placeholder = 'Sélectionnez votre pays'
}) => {
  return (
    <div>
      <div className="relative">
        <IoGlobeOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary pointer-events-none z-10" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
            error ? 'border-error' : 'border-gray-200'
          } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none bg-white cursor-pointer`}
        >
          <option value="">{placeholder}</option>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};

export default CountrySelect;
