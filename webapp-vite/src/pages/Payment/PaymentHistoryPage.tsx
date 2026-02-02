import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../services/api/paymentsApi';
import type { Payment } from '../../types/payment.types';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';
import { FaChevronDown } from 'react-icons/fa6';

const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCard = (paymentId: string) => {
    if (!isMobile) return;
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.getPaymentHistory();
      setPayments(data as any);
    } catch (error) {
      console.error('Error loading payment history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      case 'refunded':
        return 'Remboursé';
      default:
        return status;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'wallet':
        return '👛';
      case 'cash':
        return '💵';
      default:
        return '💰';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Carte bancaire';
      case 'wallet':
        return 'Portefeuille';
      case 'cash':
        return 'Espèces';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-textSecondary hover:text-primary mb-4"
            >
              ← Retour
            </button>
            <h1 className="text-3xl font-black text-textPrimary mb-2">Historique des paiements</h1>
            <p className="text-textSecondary">Consultez tous vos paiements effectués</p>
          </div>

          {/* Payments List */}
          {payments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
              <div className="text-6xl mb-4">💳</div>
              <p className="text-textSecondary mb-4">Aucun paiement trouvé</p>
              <button
                onClick={() => navigate('/client/home')}
                className="px-6 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                Rechercher des véhicules
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const isExpanded = expandedCards.has(payment.id) || !isMobile;
                return (
                  <div
                    key={payment.id}
                    className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="flex items-start justify-between mb-3 lg:mb-4 cursor-pointer lg:cursor-default"
                      onClick={() => toggleCard(payment.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 lg:space-x-3 mb-1 lg:mb-2">
                          <span className="text-xl lg:text-2xl">{getPaymentMethodIcon((payment as any).payment_method || payment.paymentMethod)}</span>
                          <div>
                            <h3 className="text-base lg:text-lg font-bold text-textPrimary">
                              {getPaymentMethodLabel((payment as any).payment_method || payment.paymentMethod)}
                            </h3>
                            <p className="text-xs lg:text-sm text-textSecondary">
                              {(() => {
                                const dateStr = (payment as any).created_at || payment.createdAt;
                                if (!dateStr) return 'Date inconnue';
                                try {
                                  return new Date(dateStr).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  });
                                } catch (e) {
                                  return 'Date invalide';
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {getStatusLabel(payment.status)}
                        </span>
                        {isMobile && (
                          <FaChevronDown
                            className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <>
                        <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-3 lg:mb-4">
                          <div>
                            <p className="text-xs lg:text-sm text-textSecondary mb-1">Montant</p>
                            <p className="text-lg lg:text-xl font-bold" style={{ color: FlitCarColors.primary }}>
                              {payment.amount} DH
                            </p>
                          </div>
                          {((payment as any).transaction_id || payment.transactionId) && (
                            <div>
                              <p className="text-xs lg:text-sm text-textSecondary mb-1">Transaction ID</p>
                              <p className="text-xs lg:text-sm font-mono text-textPrimary">
                                {((payment as any).transaction_id || payment.transactionId).slice(0, 16)}...
                              </p>
                            </div>
                          )}
                        </div>

                        {payment.booking && (
                          <div className="pt-3 lg:pt-4 border-t">
                            <p className="text-xs lg:text-sm text-textSecondary mb-1">Réservation associée</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/client/bookings/${(payment as any).booking_id || payment.bookingId}`);
                              }}
                              className="text-xs lg:text-sm font-semibold hover:underline"
                              style={{ color: FlitCarColors.primary }}
                            >
                              Voir les détails de la réservation →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
