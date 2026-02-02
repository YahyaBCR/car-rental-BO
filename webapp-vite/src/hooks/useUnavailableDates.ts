/**
 * Hook pour récupérer les dates indisponibles d'une voiture
 * Utilisé pour désactiver les dates dans le calendrier (anti-surbooking)
 */

import { useState, useEffect } from 'react';
import axios from 'axios';

interface UnavailablePeriod {
  startDate: string;
  endDate: string;
  status: string;
}

interface UseUnavailableDatesReturn {
  unavailablePeriods: UnavailablePeriod[];
  loading: boolean;
  error: string | null;
  isDateUnavailable: (date: Date) => boolean;
  hasOverlap: (startDate: Date, endDate: Date) => boolean;
}

export const useUnavailableDates = (carId: string | undefined): UseUnavailableDatesReturn => {
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!carId) return;

    const fetchUnavailableDates = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/bookings/cars/${carId}/unavailable-dates`
        );

        setUnavailablePeriods(response.data.unavailablePeriods || []);
      } catch (err: any) {
        console.error('Error fetching unavailable dates:', err);
        setError(err.response?.data?.message || 'Failed to fetch unavailable dates');
        setUnavailablePeriods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailableDates();
  }, [carId]);

  /**
   * Vérifie si une date spécifique est indisponible
   */
  const isDateUnavailable = (date: Date): boolean => {
    if (!date) return false;

    return unavailablePeriods.some(period => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);

      // Normaliser les dates pour comparer uniquement la date (pas l'heure)
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const periodStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const periodEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      return checkDate >= periodStart && checkDate <= periodEnd;
    });
  };

  /**
   * CAHIER DES CHARGES: Détection de chevauchement
   * Vérifie si la période sélectionnée chevauche une période indisponible
   * Formule: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
   */
  const hasOverlap = (startDate: Date, endDate: Date): boolean => {
    if (!startDate || !endDate) return false;

    return unavailablePeriods.some(period => {
      const existingStart = new Date(period.startDate);
      const existingEnd = new Date(period.endDate);

      // Normaliser les dates
      const newStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const newEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const periodStart = new Date(existingStart.getFullYear(), existingStart.getMonth(), existingStart.getDate());
      const periodEnd = new Date(existingEnd.getFullYear(), existingEnd.getMonth(), existingEnd.getDate());

      // Détection de chevauchement
      return periodStart < newEnd && periodEnd > newStart;
    });
  };

  return {
    unavailablePeriods,
    loading,
    error,
    isDateUnavailable,
    hasOverlap
  };
};
