import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Datepicker from 'react-tailwindcss-datepicker';
import { FaShield } from 'react-icons/fa6';
import type { Car } from '../../types/car.types';
import { FlitCarColors } from '../../constants/colors';
import { useAppSelector } from '../../hooks/useRedux';
import { airportApi, type AirportFee } from '../../services/api/airportApi';
import { bookingsApi } from '../../services/api/bookingsApi';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';

interface BookingCardProps {
  car: Car;
  pricePerDay: number;
  initialStartDate?: string;
  initialEndDate?: string;
  initialAirportId?: string;
}

const BookingCard: React.FC<BookingCardProps> = ({
  car,
  pricePerDay,
  initialStartDate,
  initialEndDate,
  initialAirportId,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { formatPrice } = useCurrencyFormat();

  const [dateValue, setDateValue] = useState({
    startDate: initialStartDate || null,
    endDate: initialEndDate || null
  });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [airportFees, setAirportFees] = useState<AirportFee[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<{ id: string; code: string; name: string; city: string; deliveryFee: number } | null>(null);
  const [isAirportDropdownOpen, setIsAirportDropdownOpen] = useState(false);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [disabledDates, setDisabledDates] = useState<any>([]);

  useEffect(() => {
    loadCarAirports();
    loadBookedDates();
  }, [car.id]);

  useEffect(() => {
    if (initialAirportId && airportFees.length > 0) {
      const airportFee = airportFees.find((af) => af.airport_id === initialAirportId);
      if (airportFee && airportFee.is_available) {
        setSelectedAirport({
          id: airportFee.airport_id,
          code: airportFee.code || '',
          name: airportFee.name || '',
          city: airportFee.city || '',
          deliveryFee: airportFee.delivery_fee
        });
      }
    }
  }, [initialAirportId, airportFees]);

  const loadCarAirports = async () => {
    try {
      const data = await airportApi.getCarAirportFees(car.id);
      // Filtrer uniquement les aéroports disponibles
      const availableAirports = data.filter(af => af.is_available);
      setAirportFees(availableAirports);
    } catch (error) {
      console.error('Error loading car airports:', error);
    }
  };

  const loadBookedDates = async () => {
    try {
      const bookedDates = await bookingsApi.getCarBookedDates(car.id);

      // Convertir les périodes de réservation en format attendu par react-tailwindcss-datepicker
      const allDisabledDates: { startDate: Date; endDate: Date }[] = [];

      bookedDates.forEach(({ startDate, endDate }) => {
        allDisabledDates.push({
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      });

      setDisabledDates(allDisabledDates as any);
    } catch (error) {
      console.error('Error loading booked dates:', error);
    }
  };

  const calculateDays = () => {
    if (!dateValue.startDate || !dateValue.endDate) return 0;
    const start = new Date(dateValue.startDate as string);
    const end = new Date(dateValue.endDate as string);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = calculateDays();
  const deliveryFee = Number(selectedAirport?.deliveryFee) || 0;
  const subtotal = Number(days) * Number(pricePerDay);
  const totalPrice = subtotal + deliveryFee;
  const depositAmount = car.depositAmount || car.deposit_amount || 0;
  const minRentalDays = car.minRentalDays || car.min_rental_days || 1;

  const handleBooking = () => {
    if (!dateValue.startDate || !dateValue.endDate) {
      alert('Veuillez sélectionner des dates de location');
      return;
    }

    if (days < minRentalDays) {
      alert(`La durée minimale de location est de ${minRentalDays} jour(s)`);
      return;
    }

    if (!selectedAirport) {
      alert('Veuillez sélectionner un aéroport');
      return;
    }

    if (!isAuthenticated) {
      // Sauvegarder toutes les données de réservation avant de rediriger vers login
      const redirectData = {
        returnUrl: `/cars/${car.id}`,
        state: {
          searchParams: {
            startDate: dateValue.startDate,
            endDate: dateValue.endDate,
            airportId: selectedAirport.id
          },
          bookingData: {
            startDate: dateValue.startDate,
            endDate: dateValue.endDate,
            startTime,
            endTime,
            selectedAirport: selectedAirport,
            days,
            deliveryFee,
            totalPrice: subtotal
          }
        }
      };
      localStorage.setItem('flitcar_redirect_data', JSON.stringify(redirectData));
      navigate('/login');
      return;
    }

    navigate(`/booking/${car.id}`, {
      state: {
        car,
        startDate: dateValue.startDate,
        endDate: dateValue.endDate,
        startTime,
        endTime,
        airportId: selectedAirport.id,
        deliveryFee,
        days,
        totalPrice: subtotal, // Passer le sous-total SANS deliveryFee
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
      {/* Price */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-4xl font-black" style={{ color: FlitCarColors.primary }}>
            {formatPrice(pricePerDay)}
          </span>
        </div>
        {minRentalDays > 1 && (
          <p className="text-sm text-textSecondary">
            Location minimale: {minRentalDays} jours
          </p>
        )}
      </div>

      {/* Airport Selector */}
      <div className="relative mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          Aéroport
        </label>
        <button
          type="button"
          onClick={() => setIsAirportDropdownOpen(!isAirportDropdownOpen)}
          className="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-left transition-all hover:bg-white"
        >
          {selectedAirport ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                >
                  {selectedAirport.code}
                </div>
                <div className="text-gray-900 font-semibold text-sm truncate">
                  {selectedAirport.name}
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isAirportDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Choisir un aéroport</span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isAirportDropdownOpen ? 'rotate-180' : ''}`}
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
        {isAirportDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={airportSearchQuery}
                  onChange={(e) => setAirportSearchQuery(e.target.value)}
                  placeholder="Rechercher un aéroport..."
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

            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {(() => {
                const filteredAirports = airportFees.filter(airportFee => {
                  if (!airportSearchQuery) return true;
                  const query = airportSearchQuery.toLowerCase();
                  return (
                    airportFee.name?.toLowerCase().includes(query) ||
                    airportFee.code?.toLowerCase().includes(query) ||
                    airportFee.city?.toLowerCase().includes(query)
                  );
                });

                if (filteredAirports.length === 0) {
                  return (
                    <div className="px-4 py-12 text-center text-gray-400">
                      <svg
                        className="w-12 h-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="font-semibold text-sm">Aucun aéroport trouvé</p>
                    </div>
                  );
                }

                return filteredAirports.map((airportFee) => (
                  <button
                    key={airportFee.airport_id}
                    type="button"
                    onClick={() => {
                      setSelectedAirport({
                        id: airportFee.airport_id,
                        code: airportFee.code || '',
                        name: airportFee.name || '',
                        city: airportFee.city || '',
                        deliveryFee: airportFee.delivery_fee
                      });
                      setIsAirportDropdownOpen(false);
                      setAirportSearchQuery('');
                    }}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black text-white"
                          style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
                        >
                          {airportFee.code}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{airportFee.name}</div>
                          <div className="text-xs text-gray-500">{airportFee.city}</div>
                        </div>
                      </div>
                      {airportFee.delivery_fee > 0 && (
                        <div className="text-xs font-semibold text-primary">
                          +{formatPrice(airportFee.delivery_fee)}
                        </div>
                      )}
                    </div>
                  </button>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Date Range Picker */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Dates de location
        </label>
        <div className="space-y-3">
          <div className="datepicker-wrapper">
            <Datepicker
              value={dateValue as any}
              onChange={(newValue: any) => setDateValue(newValue)}
              minDate={new Date()}
              disabledDates={disabledDates}
              primaryColor="teal"
              placeholder="Sélectionnez vos dates"
              separator="au"
              displayFormat="DD/MM/YYYY"
              i18n="fr"
              inputClassName="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all"
              containerClassName="relative"
              readOnly={true}
            />
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Heure départ</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Heure retour</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 font-semibold hover:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      {days > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-textSecondary">
              <span>{formatPrice(pricePerDay)} × {days} jour{days > 1 ? 's' : ''}</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-textSecondary">
                <span>Frais de livraison</span>
                <span className="font-semibold">{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-textPrimary pt-2 border-t border-gray-200">
              <span>Total</span>
              <span style={{ color: FlitCarColors.primary }}>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Info */}
      {depositAmount > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <FaShield className="text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Caution requise</p>
              <p className="text-lg font-black text-amber-900">{formatPrice(depositAmount)}</p>
              <p className="text-xs text-amber-700 mt-1">
                À payer séparément lors de la livraison. Sera restituée au retour.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={handleBooking}
        className="w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primaryDark})` }}
      >
        {isAuthenticated ? 'Réserver maintenant' : 'Se connecter pour réserver'}
      </button>

      {!isAuthenticated && (
        <p className="text-xs text-textSecondary text-center mt-3">
          Vous devez vous connecter pour réserver
        </p>
      )}
    </div>
  );
};

export default BookingCard;
