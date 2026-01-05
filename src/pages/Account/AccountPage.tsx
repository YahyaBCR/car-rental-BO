import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Layout/AdminLayout';
import { FaSave, FaCog, FaBolt, FaClock } from 'react-icons/fa';
import { FlitCarColors } from '../../utils/constants';
import authApi from '../../services/authApi';

interface UserSettings {
  instant_booking: boolean;
}

const AccountPage: React.FC = () => {
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
      const response = await authApi.getProfile();
      setSettings({
        instant_booking: response.instant_booking !== false // Default to true
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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaCog className="text-indigo-600" />
            Paramètres du compte
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez vos préférences de réservation et les paramètres de votre compte
          </p>
        </div>

        {/* Booking Settings Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaClock className="text-indigo-600" />
            Paramètres de réservation
          </h2>

          <div className="space-y-6">
            {/* Instant Booking Toggle */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FaBolt className={settings.instant_booking ? "text-green-600" : "text-orange-600"} />
                  <h3 className="text-lg font-medium text-gray-900">
                    Mode de validation des réservations
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Mode Instant (current selection) */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      settings.instant_booking
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleToggleInstantBooking(true)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={settings.instant_booking}
                        onChange={() => handleToggleInstantBooking(true)}
                        disabled={saving}
                        className="mt-1 w-4 h-4 text-green-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FaBolt className="text-green-600" />
                          <span className="font-semibold text-gray-900">
                            Réservation instantanée
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Recommandé
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Les réservations sont confirmées <strong>immédiatement</strong> après le paiement du client.
                          Vous n'avez pas besoin de les valider manuellement.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          ✅ Flux: Client paie → <span className="font-medium">Réservation confirmée</span> → Livraison
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mode Manual (new option) */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      !settings.instant_booking
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleToggleInstantBooking(false)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={!settings.instant_booking}
                        onChange={() => handleToggleInstantBooking(false)}
                        disabled={saving}
                        className="mt-1 w-4 h-4 text-orange-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FaClock className="text-orange-600" />
                          <span className="font-semibold text-gray-900">
                            Validation manuelle (24h)
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Le client paie d'abord, puis vous avez <strong>24 heures</strong> pour accepter ou refuser la réservation.
                          Si refusée ou expirée, le client est remboursé automatiquement.
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          ⏳ Flux: Client paie → <span className="font-medium">En attente (24h)</span> → Vous acceptez/refusez → Confirmation ou Remboursement
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <div className="text-blue-600 mt-0.5">ℹ️</div>
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">À propos de ces modes :</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li><strong>Réservation instantanée</strong> : Meilleur taux de conversion, clients satisfaits car confirmation immédiate</li>
                    <li><strong>Validation manuelle</strong> : Plus de contrôle, mais risque de perdre des clients qui préfèrent la confirmation instantanée</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save button (optional, changes are saved immediately) */}
        {saving && (
          <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span className="text-sm font-medium text-gray-700">Enregistrement...</span>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AccountPage;
