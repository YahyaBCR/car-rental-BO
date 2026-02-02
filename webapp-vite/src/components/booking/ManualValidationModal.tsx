/**
 * Manual Validation Modal
 * Displays a confirmation dialog when booking a car that requires manual validation (24h)
 */

import React from 'react';
import { FaClock } from 'react-icons/fa';
import { FlitCarColors } from '../../constants/colors';

interface ManualValidationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ManualValidationModal: React.FC<ManualValidationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <FaClock className="text-orange-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Validation manuelle requise
              </h2>
              <p className="text-sm text-gray-500">Délai de réponse : 24 heures maximum</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
            <p className="text-sm text-amber-900">
              <strong>💳 Paiement bloqué temporairement</strong><br/>
              Les fonds seront bloqués sur votre carte mais <strong>ne seront débités que si le propriétaire accepte</strong> votre demande.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Comment ça marche ?</h3>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Empreinte bancaire</strong> : Les fonds sont bloqués sur votre carte (pas encore débités)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-orange-700 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Le propriétaire a 3h maximum</strong> pour accepter ou refuser votre demande
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-700 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Si acceptée</strong> : Les fonds sont <strong>débités</strong> et votre réservation est confirmée
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-700 font-bold text-sm">4</span>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Si refusée ou expirée (3h)</strong> : Les fonds sont <strong>libérés automatiquement</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg mt-0.5 flex-shrink-0">✓</span>
              <p className="text-sm text-green-900">
                <strong>Garantie :</strong> Si le propriétaire refuse ou ne répond pas dans les 3h, les fonds bloqués seront automatiquement libérés. Aucun débit ne sera effectué.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl text-white font-bold hover:opacity-90 transition-opacity shadow-md"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            J'accepte, continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualValidationModal;
