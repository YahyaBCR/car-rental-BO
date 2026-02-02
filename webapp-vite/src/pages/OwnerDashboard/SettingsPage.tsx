/**
 * Owner Settings Page
 * Allows owners to configure their booking validation preferences
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCog, FaClock } from 'react-icons/fa';
import { FlitCarColors } from '../../constants/colors';
import { authApi } from '../../services/api/authApi';

interface UserSettings {
  instant_booking: boolean;
}

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    instant_booking: true
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      const user = await authApi.getProfile();
      setSettings({
        instant_booking: (user as any).instant_booking !== false // Default to true
      });
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInstantBooking = async (value: boolean) => {
    try {
      setSaving(true);

      await authApi.updateProfile({
        instant_booking: value
      });

      setSettings(prev => ({ ...prev, instant_booking: value }));

      toast.success('Paramètres mis à jour avec succès');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-textPrimary mb-2 flex items-center gap-3">
            <FaCog style={{ color: FlitCarColors.primary }} />
            Paramètres
          </h1>
          <p className="text-textSecondary">
            Gérez vos préférences de réservation et les paramètres de votre compte
          </p>
        </div>

        {/* Booking Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
            <FaClock style={{ color: FlitCarColors.primary }} />
            Paramètres de réservation
          </h2>

          <div className="space-y-4">
            {/* Mode Instant */}
            <div
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                settings.instant_booking
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleToggleInstantBooking(true)}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  checked={settings.instant_booking}
                  onChange={() => handleToggleInstantBooking(true)}
                  disabled={saving}
                  className="mt-1 w-5 h-5 text-green-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚡</span>
                    <span className="font-bold text-gray-900 text-lg">
                      Réservation instantanée
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                      Recommandé
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Les réservations sont confirmées <strong>immédiatement</strong> après le paiement du client.
                    Vous n'avez pas besoin de les valider manuellement.
                  </p>
                  <div className="bg-white/50 rounded-lg p-3 text-xs text-gray-600">
                    <span className="font-medium">✅ Flux:</span> Client paie → <span className="font-semibold text-green-700">Réservation confirmée</span> → Livraison
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Manual */}
            <div
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                !settings.instant_booking
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleToggleInstantBooking(false)}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  checked={!settings.instant_booking}
                  onChange={() => handleToggleInstantBooking(false)}
                  disabled={saving}
                  className="mt-1 w-5 h-5 text-orange-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FaClock className="text-orange-600 text-lg" />
                    <span className="font-bold text-gray-900 text-lg">
                      Validation manuelle (24h)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Le client paie d'abord, puis vous avez <strong>24 heures</strong> pour accepter ou refuser la réservation.
                    Si refusée ou expirée, le client est remboursé automatiquement.
                  </p>
                  <div className="bg-white/50 rounded-lg p-3 text-xs text-gray-600">
                    <span className="font-medium">⏳ Flux:</span> Client paie → <span className="font-semibold text-orange-700">En attente (24h)</span> → Vous acceptez/refusez → Confirmation ou Remboursement
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <div className="text-blue-600 mt-0.5 text-lg">ℹ️</div>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">À propos de ces modes :</p>
                <ul className="list-disc list-inside space-y-1.5 text-blue-800">
                  <li>
                    <strong>Réservation instantanée</strong> : Meilleur taux de conversion, clients satisfaits car confirmation immédiate
                  </li>
                  <li>
                    <strong>Validation manuelle</strong> : Plus de contrôle, mais risque de perdre des clients qui préfèrent la confirmation instantanée
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Saving Indicator */}
        {saving && (
          <div className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-200">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-sm font-semibold text-textPrimary">Enregistrement...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
