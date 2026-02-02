import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShield, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import { bookingsApi } from '../../services/api/bookingsApi';
import { paymentsApi } from '../../services/api/paymentsApi';
import { settingsApi } from '../../services/api/settingsApi';
import type { Booking } from '../../types/booking.types';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';
import { useCurrencyFormat } from '../../hooks/useCurrencyFormat';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, currency } = useCurrencyFormat();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState<string>('');
  const [summaryOpen, setSummaryOpen] = useState(true);

  // Payment settings from BO
  const [paymentSettings, setPaymentSettings] = useState<any>(null);

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'cash' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [transferReference, setTransferReference] = useState('');

  useEffect(() => {
    if (id) {
      loadBooking(id);
    }
    loadPaymentSettings();
  }, [id]);

  const loadPaymentSettings = async () => {
    try {
      const settings = await settingsApi.getPaymentSettings();
      setPaymentSettings(settings);

      // Set default payment method based on what's enabled
      const methods = settings.payment_methods || {};
      if (methods.card) {
        setPaymentMethod('card');
      } else if (methods.transfer) {
        setPaymentMethod('bank_transfer');
      } else if (methods.cash) {
        setPaymentMethod('cash');
      } else if (methods.paypal) {
        setPaymentMethod('paypal');
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
      // Fallback to defaults if API fails
      setPaymentSettings({
        payment_methods: { card: true, transfer: true },
      });
    }
  };

  // SLA Timer - 1 hour to pay after owner acceptance
  useEffect(() => {
    if (!booking || booking.status !== 'waiting_payment') return;

    const calculateTimeRemaining = () => {
      // Use payment_deadline field from backend
      const paymentDeadline = (booking as any).payment_deadline || (booking as any).paymentDeadline;
      if (!paymentDeadline) return null;

      const deadlineTime = new Date(paymentDeadline).getTime();
      const now = Date.now();
      const remaining = deadlineTime - now;

      return remaining > 0 ? remaining : 0;
    };

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      if (remaining !== null) {
        setTimeRemaining(remaining);

        if (remaining === 0) {
          toast.error('Le délai de paiement est expiré. La réservation sera annulée.');
          setTimeout(() => navigate('/client/bookings'), 3000);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [booking, navigate]);

  const loadBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const foundBooking = await bookingsApi.getBookingDetails(bookingId);

      if (!foundBooking) {
        toast.error('Réservation non trouvée');
        navigate('/client/bookings');
        return;
      }

      if (foundBooking.status !== 'waiting_payment') {
        toast.error('Cette réservation ne peut pas être payée pour le moment');
        navigate('/client/bookings');
        return;
      }

      setBooking(foundBooking);
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Erreur lors du chargement de la réservation');
      navigate('/client/bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePayment = async () => {
    if (!booking) return;

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
        toast.error('Veuillez remplir tous les champs de paiement');
        return;
      }
    }

    if (paymentMethod === 'bank_transfer') {
      if (!transferReference) {
        toast.error('Veuillez saisir la référence du virement');
        return;
      }
    }

    try {
      setProcessing(true);

      // Process payment via API (only online payment amount)
      const paymentData: any = {
        bookingId: booking.id,
        amount: onlinePaymentAmount,
        paymentMethod,
        currency, // Send the selected currency
      };

      if (paymentMethod === 'card') {
        paymentData.cardNumber = cardNumber;
        paymentData.cardholderName = cardName;
        paymentData.expiryDate = cardExpiry;
        paymentData.cvv = cardCVV;
      } else if (paymentMethod === 'bank_transfer') {
        paymentData.transferReference = transferReference;
      }

      const response = await paymentsApi.processPayment(paymentData);

      if (response.success) {
        toast.success('Paiement effectué avec succès!');

        // Load delivery code
        try {
          const codeData = await bookingsApi.getDeliveryCode(booking.id);
          setDeliveryCode(codeData.deliveryCode);
        } catch (error) {
          console.error('Error loading delivery code:', error);
        }

        setPaymentSuccess(true);

        // Redirect to booking details after 5 seconds
        setTimeout(() => {
          navigate(`/client/bookings/${booking.id}`);
        }, 5000);
      } else {
        toast.error(response.message || 'Échec du paiement');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const car = booking.car;
  const depositAmount = car?.depositAmount || car?.deposit_amount || 0;
  const totalPrice = Number(booking.totalPrice || booking.total_price || 0);
  const onlinePaymentAmount = Number((booking as any).onlinePaymentAmount || (booking as any).online_payment_amount || 0);
  const ownerPaymentAmount = Number((booking as any).ownerPaymentAmount || (booking as any).owner_payment_amount || 0);
  const deliveryFee = Number((booking as any).deliveryFee || (booking as any).delivery_fee || 0);
  const startDate = booking.startDate || booking.start_date || '';
  const endDate = booking.endDate || booking.end_date || '';

  // Payment Success Screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">✓</span>
              </div>
              <h1 className="text-3xl font-black text-textPrimary mb-2">Paiement réussi!</h1>
              <p className="text-textSecondary">Votre réservation a été confirmée</p>
              <p className="text-xs text-textSecondary mt-2">
                Redirection automatique dans 5 secondes...
              </p>
            </div>

            {/* Delivery Code */}
            {deliveryCode && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                <h2 className="text-xl font-bold text-textPrimary mb-3">🔑 Code de livraison</h2>
                <p className="text-sm text-textSecondary mb-4">
                  Présentez ce code au propriétaire lors de la récupération du véhicule
                </p>
                <div className="bg-white rounded-lg p-6 mb-4">
                  <p className="text-5xl font-black text-primary tracking-wider" style={{ fontFamily: 'monospace' }}>
                    {deliveryCode}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(deliveryCode);
                    toast.success('Code copié dans le presse-papier!');
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  📋 Copier le code
                </button>
              </div>
            )}

            {/* Booking Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold text-textPrimary mb-3">Détails de la réservation</h3>
              {car && (
                <p className="text-sm text-textSecondary mb-2">
                  <span className="font-semibold">Véhicule:</span> {car.brand} {car.model}
                </p>
              )}
              <p className="text-sm text-textSecondary mb-2">
                <span className="font-semibold">Période:</span> {new Date(startDate).toLocaleDateString('fr-FR')} - {new Date(endDate).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-textSecondary">
                <span className="font-semibold">Montant payé en ligne:</span> {formatPrice(onlinePaymentAmount)}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/client/bookings/${booking.id}`)}
                className="w-full py-3 rounded-lg font-bold text-white"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                Voir ma réservation
              </button>
              <button
                onClick={() => navigate('/client/bookings')}
                className="w-full py-3 rounded-lg font-semibold text-textPrimary border-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: FlitCarColors.primary, color: FlitCarColors.primary }}
              >
                Voir toutes mes réservations
              </button>
              <button
                onClick={() => navigate('/search')}
                className="w-full py-3 rounded-lg font-semibold text-textPrimary bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Nouvelle recherche
              </button>
            </div>

            {/* Important Notes */}
            <div className="mt-6 space-y-3">
              {depositAmount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">🛡️ Caution:</span> Une caution de {formatPrice(depositAmount)} sera demandée lors de la récupération du véhicule (remboursable).
                  </p>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">✈️ Frais de livraison:</span> {formatPrice(deliveryFee)} inclus dans le montant à régler au propriétaire.
                  </p>
                </div>
              )}
              {depositAmount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">🔒 Caution:</span> {formatPrice(depositAmount)} à régler lors de la récupération du véhicule (remboursable).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <div className="container mx-auto px-3 py-4 lg:px-4 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 lg:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-textSecondary hover:text-primary mb-3 lg:mb-4 text-sm"
            >
              ← Retour
            </button>
            <h1 className="text-xl lg:text-3xl font-black text-textPrimary mb-1 lg:mb-2">Paiement de la réservation</h1>
            <p className="text-sm lg:text-base text-textSecondary">Finalisez votre réservation en effectuant le paiement</p>
          </div>

          {/* SLA Timer */}
          {timeRemaining !== null && (
            <div className={`mb-4 lg:mb-6 rounded-xl lg:rounded-2xl p-3 lg:p-6 shadow-sm ${
              timeRemaining < 600000 ? 'bg-red-50 border-2 border-red-300' : 'bg-blue-50 border-2 border-blue-300'
            }`}>
              <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between gap-3">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <FaClock className={`text-lg lg:text-2xl ${timeRemaining < 600000 ? 'text-red-600' : 'text-blue-600'}`} />
                  <div>
                    <h3 className={`text-sm lg:text-lg font-bold ${timeRemaining < 600000 ? 'text-red-900' : 'text-blue-900'}`}>
                      Temps restant
                    </h3>
                    <p className={`text-xs lg:text-sm ${timeRemaining < 600000 ? 'text-red-700' : 'text-blue-700'}`}>
                      {timeRemaining < 600000
                        ? 'Le délai expire bientôt'
                        : 'Finalisez votre paiement'}
                    </p>
                  </div>
                </div>
                <div className={`text-2xl lg:text-4xl font-black ${timeRemaining < 600000 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 lg:space-y-6">
            {/* Summary - Dropdown Section */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="w-full px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-base lg:text-xl font-bold text-textPrimary">Récapitulatif</h3>
                {summaryOpen ? (
                  <FaChevronUp className="text-textSecondary" />
                ) : (
                  <FaChevronDown className="text-textSecondary" />
                )}
              </button>

              {summaryOpen && (
                <div className="px-4 lg:px-6 pb-4 lg:pb-6 border-t">
                  <div className="pt-3 lg:pt-4">
                    {/* Car Info */}
                    {car && (
                      <div className="mb-4 lg:mb-6 pb-4 lg:pb-6 border-b">
                        <h4 className="text-sm lg:text-base font-bold text-textPrimary mb-1 lg:mb-2">
                          {car.brand} {car.model}
                        </h4>
                        <p className="text-xs lg:text-sm text-textSecondary">
                          {new Date(startDate).toLocaleDateString('fr-FR')} - {new Date(endDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-3 lg:space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg lg:rounded-xl p-3 lg:p-4 border-2 border-green-200">
                        <div className="flex items-start lg:items-center justify-between mb-1 lg:mb-2">
                          <div className="flex items-center space-x-1 lg:space-x-2">
                            <span className="text-lg lg:text-2xl">💳</span>
                            <span className="text-xs lg:text-sm font-bold text-green-900">Montant total</span>
                          </div>
                          <span className="text-lg lg:text-2xl font-black text-green-700">
                            {formatPrice(onlinePaymentAmount)}
                          </span>
                        </div>
                        <p className="text-xs text-green-700 ml-6 lg:ml-8">
                          Paiement sécurisé
                        </p>
                      </div>

                      {deliveryFee > 0 && (
                        <div className="bg-purple-50 rounded-lg p-2 lg:p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 lg:space-x-2">
                              <span className="text-sm lg:text-base">✈️</span>
                              <span className="text-xs lg:text-sm font-medium text-purple-900">Frais de livraison</span>
                            </div>
                            <span className="text-xs lg:text-sm font-semibold text-purple-700">
                              {formatPrice(deliveryFee)}
                            </span>
                          </div>
                          <p className="text-xs text-purple-600 mt-1 ml-5 lg:ml-7">
                            Inclus dans le montant
                          </p>
                        </div>
                      )}

                      {depositAmount > 0 && (
                        <div className="bg-yellow-50 rounded-lg p-2 lg:p-3">
                          <div className="flex items-start space-x-1 lg:space-x-2">
                            <FaShield className="text-yellow-600 mt-0.5 lg:mt-1 text-sm lg:text-base" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs lg:text-sm font-semibold text-yellow-900">Caution</p>
                                <span className="text-xs lg:text-sm font-bold text-yellow-700">
                                  {formatPrice(depositAmount)}
                                </span>
                              </div>
                              <p className="text-xs text-yellow-700">
                                À payer à la récupération
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm lg:text-lg font-bold">Total à payer</span>
                        <span className="text-xl lg:text-3xl font-black" style={{ color: FlitCarColors.primary }}>
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-textSecondary mt-1 lg:mt-2 text-center">
                        Paiement en ligne sécurisé
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div>
              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm">
                <h2 className="text-base lg:text-xl font-bold text-textPrimary mb-4 lg:mb-6">Informations de paiement</h2>

                {/* Payment Method */}
                <div className="mb-4 lg:mb-6">
                  <h3 className="text-sm lg:text-lg font-semibold text-textPrimary mb-3 lg:mb-4">Mode de paiement</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    {paymentSettings?.payment_methods?.card && (
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 lg:p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className="text-sm lg:text-base font-semibold">💳 Carte bancaire</p>
                      </button>
                    )}
                    {paymentSettings?.payment_methods?.transfer && (
                      <button
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`p-3 lg:p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'bank_transfer'
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className="text-sm lg:text-base font-semibold">🏦 Virement</p>
                      </button>
                    )}
                    {paymentSettings?.payment_methods?.cash && (
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3 lg:p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className="text-sm lg:text-base font-semibold">💵 Espèces</p>
                      </button>
                    )}
                    {paymentSettings?.payment_methods?.paypal && (
                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-3 lg:p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className="text-sm lg:text-base font-semibold">💰 PayPal</p>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-textPrimary mb-2">
                        Numéro de carte
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-textPrimary mb-2">
                        Nom sur la carte
                      </label>
                      <input
                        type="text"
                        placeholder="JOHN DOE"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-textPrimary mb-2">
                          Expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-textPrimary mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardCVV}
                          onChange={(e) => setCardCVV(e.target.value)}
                          maxLength={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Instructions de virement</p>
                      <p className="text-xs text-blue-700 mb-2">
                        Veuillez effectuer le virement bancaire et saisir la référence de transaction ci-dessous.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-textPrimary mb-2">
                        Référence du virement
                      </label>
                      <input
                        type="text"
                        placeholder="REF123456789"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Cash Payment */}
                {paymentMethod === 'cash' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-green-900 mb-2">Paiement en espèces</p>
                      <p className="text-xs text-green-700 mb-2">
                        Vous payez {formatPrice(onlinePaymentAmount)} maintenant pour confirmer votre réservation.
                      </p>
                      <p className="text-xs text-green-700">
                        <strong>À remettre au propriétaire:</strong> {formatPrice(ownerPaymentAmount)} + caution de {formatPrice(depositAmount)} en espèces lors de la récupération.
                      </p>
                    </div>
                  </div>
                )}

                {/* PayPal Payment */}
                {paymentMethod === 'paypal' && (
                  <div className="space-y-4 mb-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-yellow-900 mb-2">Paiement PayPal</p>
                      <p className="text-xs text-yellow-700 mb-2">
                        Vous serez redirigé vers PayPal pour finaliser le paiement en toute sécurité.
                      </p>
                    </div>
                  </div>
                )}

                {/* Desktop Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="hidden lg:block w-full py-4 rounded-lg font-bold text-white disabled:opacity-50"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  {processing ? 'Traitement...' : `Payer ${formatPrice(onlinePaymentAmount)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sticky Payment Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-textSecondary">Total à payer</div>
              <div className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                {formatPrice(onlinePaymentAmount)}
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="px-6 py-3 rounded-xl font-bold text-white shadow-lg disabled:opacity-50"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              {processing ? 'Traitement...' : 'Payer maintenant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
