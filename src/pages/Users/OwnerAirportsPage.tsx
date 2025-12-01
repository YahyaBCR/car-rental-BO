import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaSave, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import apiClient from '../../services/apiClient';
import { FlitCarColors } from '../../utils/constants';
import toast from 'react-hot-toast';

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  is_active: boolean;
  delivery_fee: number | null;
  is_available: boolean | null;
  is_configured: boolean;
}

interface OwnerInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const OwnerAirportsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadOwnerAirports();
  }, [userId]);

  const loadOwnerAirports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/airports/owner/${userId}`);
      setOwner(response.data.data.owner);
      setAirports(response.data.data.airports);
    } catch (error) {
      console.error('Error loading owner airports:', error);
      toast.error('Erreur lors du chargement des aéroports');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAirport = async (airport: Airport) => {
    if (!airport.is_configured) {
      // Add airport with default delivery fee
      const deliveryFee = prompt(`Prix de livraison pour ${airport.name} (DH):`, '0');
      if (deliveryFee === null) return;

      const fee = parseFloat(deliveryFee);
      if (isNaN(fee) || fee < 0) {
        toast.error('Prix invalide');
        return;
      }

      await saveAirportConfig(airport.id, fee, true);
    } else {
      // Remove airport
      if (!confirm(`Retirer ${airport.name} de la liste des aéroports de ce propriétaire ?`)) {
        return;
      }
      await removeAirportConfig(airport.id);
    }
  };

  const handleUpdateDeliveryFee = async (airport: Airport) => {
    const currentFee = airport.delivery_fee || 0;
    const newFee = prompt(`Nouveau prix de livraison pour ${airport.name} (DH):`, currentFee.toString());

    if (newFee === null) return;

    const fee = parseFloat(newFee);
    if (isNaN(fee) || fee < 0) {
      toast.error('Prix invalide');
      return;
    }

    await saveAirportConfig(airport.id, fee, airport.is_available ?? true);
  };

  const saveAirportConfig = async (airportId: string, deliveryFee: number, isAvailable: boolean) => {
    try {
      setSaving(airportId);
      await apiClient.post(`/admin/airports/owner/${userId}`, {
        airportId,
        deliveryFee,
        isAvailable,
      });
      toast.success('Configuration enregistrée');
      await loadOwnerAirports();
    } catch (error) {
      console.error('Error saving airport config:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(null);
    }
  };

  const removeAirportConfig = async (airportId: string) => {
    try {
      setSaving(airportId);
      await apiClient.delete(`/admin/airports/owner/${userId}/${airportId}`);
      toast.success('Aéroport retiré');
      await loadOwnerAirports();
    } catch (error) {
      console.error('Error removing airport config:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="text-textSecondary">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!owner) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-textSecondary">Propriétaire non trouvé</p>
        </div>
      </AdminLayout>
    );
  }

  const configuredAirports = airports.filter((a) => a.is_configured);
  const availableAirports = airports.filter((a) => !a.is_configured);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/users/${userId}`)}
              className="btn-secondary flex items-center gap-2"
            >
              <FaArrowLeft /> Retour
            </button>
            <div>
              <h1 className="text-3xl font-bold text-textPrimary">Gestion des aéroports</h1>
              <p className="text-textSecondary mt-1">
                {owner.first_name} {owner.last_name} ({owner.email})
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl" style={{ backgroundColor: FlitCarColors.primary }}>
                <FaPlane />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-textPrimary">
                  {configuredAirports.length} aéroport{configuredAirports.length > 1 ? 's' : ''} configuré{configuredAirports.length > 1 ? 's' : ''}
                </h3>
                <p className="text-textSecondary mt-1">
                  Ce propriétaire peut livrer des voitures à {configuredAirports.length} aéroport{configuredAirports.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configured Airports */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-textPrimary">Aéroports configurés</h2>
            <p className="text-textSecondary mt-1">
              Aéroports où ce propriétaire peut livrer des voitures avec le prix de livraison associé
            </p>
          </div>
          <div className="p-6">
            {configuredAirports.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FaPlane className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-textSecondary">Aucun aéroport configuré pour ce propriétaire</p>
                <p className="text-sm text-textSecondary mt-2">Ajoutez des aéroports ci-dessous</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configuredAirports.map((airport) => (
                  <div
                    key={airport.id}
                    className="border-2 border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCheck className="text-green-600" />
                          <h3 className="font-bold text-textPrimary">{airport.name}</h3>
                        </div>
                        <p className="text-sm text-textSecondary mb-1">
                          Code: {airport.code} • {airport.city}, {airport.country}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-textSecondary mb-1">Prix de livraison</p>
                            <p className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                              {airport.delivery_fee?.toLocaleString('fr-FR')} DH
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleUpdateDeliveryFee(airport)}
                          disabled={saving === airport.id}
                          className="btn-primary text-sm px-3 py-1 flex items-center gap-1"
                          title="Modifier le prix"
                        >
                          <FaSave className="text-xs" /> Modifier
                        </button>
                        <button
                          onClick={() => handleToggleAirport(airport)}
                          disabled={saving === airport.id}
                          className="btn-secondary text-sm px-3 py-1 flex items-center gap-1 text-red-600 hover:bg-red-50"
                          title="Retirer l'aéroport"
                        >
                          <FaTrash className="text-xs" /> Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Airports to Add */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-textPrimary">Aéroports disponibles</h2>
            <p className="text-textSecondary mt-1">Cliquez sur un aéroport pour l'ajouter</p>
          </div>
          <div className="p-6">
            {availableAirports.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-textSecondary">Tous les aéroports sont déjà configurés</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableAirports.map((airport) => (
                  <button
                    key={airport.id}
                    onClick={() => handleToggleAirport(airport)}
                    disabled={saving === airport.id}
                    className="border-2 border-gray-200 bg-white rounded-lg p-4 hover:border-primary hover:bg-blue-50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FaTimes className="text-gray-400" />
                          <h3 className="font-bold text-textPrimary">{airport.name}</h3>
                        </div>
                        <p className="text-sm text-textSecondary">
                          {airport.code} • {airport.city}
                        </p>
                        <p className="text-xs text-textSecondary mt-1">{airport.country}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OwnerAirportsPage;
