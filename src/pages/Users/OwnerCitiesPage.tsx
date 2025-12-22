import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCity, FaSave, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import apiClient from '../../services/apiClient';
import { FlitCarColors } from '../../utils/constants';
import toast from 'react-hot-toast';

interface City {
  id: string;
  name: string;
  region: string;
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

const OwnerCitiesPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadOwnerCities();
  }, [userId]);

  const loadOwnerCities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/cities/owner/${userId}`);
      setOwner(response.data.data.owner);
      setCities(response.data.data.cities);
    } catch (error) {
      console.error('Error loading owner cities:', error);
      toast.error('Erreur lors du chargement des villes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCity = async (city: City) => {
    if (!city.is_configured) {
      // Add city with default delivery fee
      const deliveryFee = prompt(`Prix de livraison pour ${city.name} (DH):`, '0');
      if (deliveryFee === null) return;

      const fee = parseFloat(deliveryFee);
      if (isNaN(fee) || fee < 0) {
        toast.error('Prix invalide');
        return;
      }

      await saveCityConfig(city.id, fee, true);
    } else {
      // Remove city
      if (!confirm(`Retirer ${city.name} de la liste des villes de ce propriétaire ?`)) {
        return;
      }
      await removeCityConfig(city.id);
    }
  };

  const handleUpdateDeliveryFee = async (city: City) => {
    const currentFee = city.delivery_fee || 0;
    const newFee = prompt(`Nouveau prix de livraison pour ${city.name} (DH):`, currentFee.toString());

    if (newFee === null) return;

    const fee = parseFloat(newFee);
    if (isNaN(fee) || fee < 0) {
      toast.error('Prix invalide');
      return;
    }

    await saveCityConfig(city.id, fee, city.is_available ?? true);
  };

  const saveCityConfig = async (cityId: string, deliveryFee: number, isAvailable: boolean) => {
    try {
      setSaving(cityId);
      await apiClient.post(`/admin/cities/owner/${userId}`, {
        cityId,
        deliveryFee,
        isAvailable,
      });
      toast.success('Configuration enregistrée');
      await loadOwnerCities();
    } catch (error) {
      console.error('Error saving city config:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(null);
    }
  };

  const removeCityConfig = async (cityId: string) => {
    try {
      setSaving(cityId);
      await apiClient.delete(`/admin/cities/owner/${userId}/${cityId}`);
      toast.success('Ville retirée');
      await loadOwnerCities();
    } catch (error) {
      console.error('Error removing city config:', error);
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
  };

  if (!owner) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-textSecondary">Propriétaire non trouvé</p>
        </div>
      </AdminLayout>
    );
  }

  const configuredCities = cities.filter((c) => c.is_configured);
  const availableCities = cities.filter((c) => !c.is_configured);

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
              <h1 className="text-3xl font-bold text-textPrimary">Gestion des villes</h1>
              <p className="text-textSecondary mt-1">
                {owner.first_name} {owner.last_name} ({owner.email})
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl" style={{ backgroundColor: FlitCarColors.primary }}>
                <FaCity />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-textPrimary">
                  {configuredCities.length} ville{configuredCities.length > 1 ? 's' : ''} configurée{configuredCities.length > 1 ? 's' : ''}
                </h3>
                <p className="text-textSecondary mt-1">
                  Ce propriétaire peut livrer des voitures à {configuredCities.length} ville{configuredCities.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configured Cities */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-textPrimary">Villes configurées</h2>
            <p className="text-textSecondary mt-1">
              Villes où ce propriétaire peut livrer des voitures avec le prix de livraison associé
            </p>
          </div>
          <div className="p-6">
            {configuredCities.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FaCity className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-textSecondary">Aucune ville configurée pour ce propriétaire</p>
                <p className="text-sm text-textSecondary mt-2">Ajoutez des villes ci-dessous</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {configuredCities.map((city) => (
                  <div
                    key={city.id}
                    className="border-2 border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCheck className="text-green-600" />
                          <h3 className="font-bold text-textPrimary">{city.name}</h3>
                        </div>
                        <p className="text-sm text-textSecondary mb-1">
                          Région: {city.region} • {city.country}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-textSecondary mb-1">Prix de livraison</p>
                            <p className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                              {city.delivery_fee?.toLocaleString('fr-FR')} DH
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleUpdateDeliveryFee(city)}
                          disabled={saving === city.id}
                          className="btn-primary text-sm px-3 py-1 flex items-center gap-1"
                          title="Modifier le prix"
                        >
                          <FaSave className="text-xs" /> Modifier
                        </button>
                        <button
                          onClick={() => handleToggleCity(city)}
                          disabled={saving === city.id}
                          className="btn-secondary text-sm px-3 py-1 flex items-center gap-1 text-red-600 hover:bg-red-50"
                          title="Retirer la ville"
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

        {/* Available Cities to Add */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-textPrimary">Villes disponibles</h2>
            <p className="text-textSecondary mt-1">Cliquez sur une ville pour l'ajouter</p>
          </div>
          <div className="p-6">
            {availableCities.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-textSecondary">Toutes les villes sont déjà configurées</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleToggleCity(city)}
                    disabled={saving === city.id}
                    className="border-2 border-gray-200 bg-white rounded-lg p-4 hover:border-primary hover:bg-green-50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FaTimes className="text-gray-400" />
                          <h3 className="font-bold text-textPrimary">{city.name}</h3>
                        </div>
                        <p className="text-sm text-textSecondary">
                          {city.region}
                        </p>
                        <p className="text-xs text-textSecondary mt-1">{city.country}</p>
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

export default OwnerCitiesPage;
