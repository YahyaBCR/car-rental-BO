import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { FlitCarColors } from '../../constants/colors';

interface DisabledDateRange {
  startDate: Date;
  endDate: Date;
}

interface MobileFullScreenDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
  startDate: string | null;
  endDate: string | null;
  minDate?: Date;
  disabledDates?: DisabledDateRange[];
}

const MONTHS_TO_SHOW = 12;

const MobileFullScreenDatePicker: React.FC<MobileFullScreenDatePickerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  startDate: initialStartDate,
  endDate: initialEndDate,
  minDate,
  disabledDates = [],
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split('-')[0];
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedStart, setSelectedStart] = useState<Date | null>(
    initialStartDate ? new Date(initialStartDate) : null
  );
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(
    initialEndDate ? new Date(initialEndDate) : null
  );
  const [selectingEnd, setSelectingEnd] = useState(false);

  // Sync with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStart(initialStartDate ? new Date(initialStartDate) : null);
      setSelectedEnd(initialEndDate ? new Date(initialEndDate) : null);
      setSelectingEnd(false);
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  // Day names based on locale
  const getDayNames = useCallback(() => {
    if (lang === 'ar') return ['اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'];
    if (lang === 'en') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
  }, [lang]);

  // Month names
  const getMonthName = useCallback((date: Date) => {
    return date.toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  }, [lang]);

  // Generate months to display
  const getMonths = useCallback(() => {
    const months: Date[] = [];
    const now = new Date();
    for (let i = 0; i < MONTHS_TO_SHOW; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(month);
    }
    return months;
  }, []);

  // Get days in month grid (including padding for day of week alignment)
  const getMonthDays = useCallback((monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: (Date | null)[] = [];

    // Padding for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, []);

  const isDateDisabled = useCallback((date: Date) => {
    // Before min date
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      const check = new Date(date);
      check.setHours(0, 0, 0, 0);
      if (check < min) return true;
    }

    // In disabled ranges
    for (const range of disabledDates) {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const check = new Date(date);
      check.setHours(0, 0, 0, 0);
      if (check >= start && check <= end) return true;
    }

    return false;
  }, [minDate, disabledDates]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const isSameDay = useCallback((a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }, []);

  const isInRange = useCallback((date: Date) => {
    if (!selectedStart || !selectedEnd) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const s = new Date(selectedStart);
    s.setHours(0, 0, 0, 0);
    const e = new Date(selectedEnd);
    e.setHours(0, 0, 0, 0);
    return d > s && d < e;
  }, [selectedStart, selectedEnd]);

  const handleDayClick = useCallback((date: Date) => {
    if (isDateDisabled(date)) return;

    if (!selectingEnd || !selectedStart) {
      // First click: select start date
      setSelectedStart(date);
      setSelectedEnd(null);
      setSelectingEnd(true);
    } else {
      // Second click: select end date
      if (date < selectedStart) {
        // If clicked before start, swap
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else if (isSameDay(date, selectedStart)) {
        // Same day clicked: reset
        setSelectedStart(date);
        setSelectedEnd(null);
        setSelectingEnd(true);
      } else {
        setSelectedEnd(date);
        setSelectingEnd(false);
      }
    }
  }, [selectingEnd, selectedStart, isDateDisabled, isSameDay]);

  const formatDateShort = useCallback((date: Date | null) => {
    if (!date) return '';
    const locale = lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }, [lang]);

  const formatToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = () => {
    if (selectedStart && selectedEnd) {
      onConfirm(formatToYMD(selectedStart), formatToYMD(selectedEnd));
    }
  };

  // Selection summary text
  const getSelectionText = () => {
    if (selectedStart && selectedEnd) {
      return `${formatDateShort(selectedStart)} - ${formatDateShort(selectedEnd)}`;
    }
    if (selectedStart) {
      return formatDateShort(selectedStart);
    }
    return '';
  };

  if (!isOpen) return null;

  const months = getMonths();
  const dayNames = getDayNames();

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
          {t('datePicker.title', 'Choisissez vos dates de location')}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          <FaTimes className="text-gray-600 text-lg" />
        </button>
      </div>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 px-4 py-2 border-b border-gray-100">
        {dayNames.map((name, i) => (
          <div key={i} className="text-center text-xs font-semibold text-gray-500 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Scrollable Calendar */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-4">
        {months.map((monthDate, monthIndex) => (
          <div key={monthIndex} className="mt-6">
            {/* Month title */}
            <h3 className="text-base font-bold text-gray-900 mb-3 capitalize">
              {getMonthName(monthDate)}
            </h3>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {getMonthDays(monthDate).map((day, dayIndex) => {
                if (!day) {
                  return <div key={`empty-${dayIndex}`} className="h-11" />;
                }

                const disabled = isDateDisabled(day);
                const today = isToday(day);
                const isStart = isSameDay(day, selectedStart);
                const isEnd = isSameDay(day, selectedEnd);
                const inRange = isInRange(day);
                const isSelected = isStart || isEnd;

                return (
                  <div
                    key={`day-${dayIndex}`}
                    className="relative flex items-center justify-center h-11"
                  >
                    {/* Range background */}
                    {inRange && (
                      <div className="absolute inset-0 bg-blue-50" />
                    )}
                    {isStart && selectedEnd && (
                      <div className="absolute inset-y-0 right-0 left-1/2 bg-blue-50" />
                    )}
                    {isEnd && selectedStart && (
                      <div className="absolute inset-y-0 left-0 right-1/2 bg-blue-50" />
                    )}

                    {/* Day button */}
                    <button
                      type="button"
                      onClick={() => handleDayClick(day)}
                      disabled={disabled}
                      className={`relative z-10 w-10 h-10 flex items-center justify-center text-sm font-medium rounded-full transition-colors
                        ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                        ${isSelected ? 'text-white font-bold' : ''}
                        ${!isSelected && !disabled && today ? 'font-bold text-blue-600' : ''}
                        ${!isSelected && !disabled && !today ? 'text-gray-900' : ''}
                        ${inRange && !isSelected ? 'text-gray-900' : ''}
                      `}
                      style={isSelected ? { backgroundColor: FlitCarColors.primary } : {}}
                    >
                      {day.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with selection and confirm button */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        {/* Selected date range display */}
        {getSelectionText() && (
          <p className="text-center text-sm text-gray-600 mb-3">
            {getSelectionText()}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selectedStart || !selectedEnd}
          className="w-full py-3.5 rounded-xl font-bold text-white text-base disabled:opacity-50"
          style={{
            backgroundColor: FlitCarColors.primary,
          }}
        >
          {t('datePicker.confirm', 'Sélectionner des dates')}
        </button>
      </div>
    </div>
  );
};

export default MobileFullScreenDatePicker;
