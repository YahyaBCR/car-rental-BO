import { format, formatDistance, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} DH`;
};

export const formatDate = (date: string | Date | null | undefined, formatStr: string = 'dd/MM/yyyy'): string => {
  if (!date) return 'Non disponible';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'Date invalide';
  }
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy à HH:mm', { locale: fr });
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Format: +33 6 12 34 56 78
  if (!phone || !phone.startsWith('+')) return phone;

  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+33')) {
    return cleaned.replace(/(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
  }
  return phone;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
