import React, { useEffect, useState } from 'react';
import { FaCircleInfo, FaCircleCheck } from 'react-icons/fa6';
import { settingsApi } from '../services/api/settingsApi';
import type { PublicSettings } from '../services/api/settingsApi';

interface RefundPolicyCardProps {
  compact?: boolean;
}

export const RefundPolicyCard: React.FC<RefundPolicyCardProps> = ({ compact = false }) => {
  const [refundPolicy, setRefundPolicy] = useState<PublicSettings['payment']>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRefundPolicy();
  }, []);

  const loadRefundPolicy = async () => {
    try {
      const settings = await settingsApi.getPaymentSettings();
      setRefundPolicy(settings);
    } catch (error) {
      console.error('Error loading refund policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!refundPolicy?.refund_policy) {
    return null;
  }

  const policy = refundPolicy.refund_policy;

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <FaCircleInfo className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Politique d'annulation</p>
            <p>
              Annulation gratuite jusqu'à 7 jours avant la réservation.
              {policy.more_than_7_days !== undefined && policy.more_than_7_days === 100 ? (
                <span className="font-semibold"> Remboursement à 100%</span>
              ) : (
                <span className="font-semibold"> Remboursement partiel selon les conditions</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2 mb-3 lg:mb-4">
        <FaCircleInfo className="text-blue-600 text-base lg:text-xl" />
        <h3 className="text-sm lg:text-lg font-bold text-textPrimary">
          Politique de remboursement
        </h3>
      </div>

      <div className="space-y-2 lg:space-y-3">
        {/* More than 7 days */}
        {policy.more_than_7_days !== undefined && (
          <div className="flex items-start space-x-2 lg:space-x-3 p-2 lg:p-3 bg-green-50 rounded-lg border border-green-200">
            <FaCircleCheck className="text-green-600 text-xs lg:text-base mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs lg:text-base font-semibold text-green-900 mb-0.5 lg:mb-1">
                Annulation plus de 7 jours avant
              </p>
              <p className="text-xs lg:text-sm text-green-800">
                Remboursement de{' '}
                <span className="font-bold text-sm lg:text-lg">{policy.more_than_7_days}%</span> du montant payé
              </p>
            </div>
          </div>
        )}

        {/* 3 to 7 days */}
        {policy['3_to_7_days'] !== undefined && (
          <div className="flex items-start space-x-2 lg:space-x-3 p-2 lg:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <FaCircleInfo className="text-yellow-600 text-xs lg:text-base mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs lg:text-base font-semibold text-yellow-900 mb-0.5 lg:mb-1">
                Annulation entre 3 et 7 jours avant
              </p>
              <p className="text-xs lg:text-sm text-yellow-800">
                Remboursement de{' '}
                <span className="font-bold text-sm lg:text-lg">{policy['3_to_7_days']}%</span> du montant payé
              </p>
            </div>
          </div>
        )}

        {/* Less than 3 days */}
        {policy.less_than_3_days !== undefined && (
          <div className="flex items-start space-x-2 lg:space-x-3 p-2 lg:p-3 bg-red-50 rounded-lg border border-red-200">
            <FaCircleInfo className="text-red-600 text-xs lg:text-base mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs lg:text-base font-semibold text-red-900 mb-0.5 lg:mb-1">
                Annulation moins de 3 jours avant
              </p>
              <p className="text-xs lg:text-sm text-red-800">
                Remboursement de{' '}
                <span className="font-bold text-sm lg:text-lg">{policy.less_than_3_days}%</span> du montant payé
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <span className="font-semibold">Astuce :</span> Pour annuler votre réservation,
          rendez-vous dans "Mes réservations" et cliquez sur "Annuler la réservation".
          Le remboursement sera automatique selon la politique ci-dessus.
        </p>
      </div>
    </div>
  );
};
