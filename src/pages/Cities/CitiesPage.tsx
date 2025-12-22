import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaCity } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import citiesApi, { City, CreateCityData, UpdateCityData } from '../../services/citiesApi';
import { FlitCarColors } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CitiesPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    country: 'Maroc',
    postalCode: '',
    isActive: true,
  });

  useEffect(() => {
    loadCities();
  }, [page, statusFilter]);

  const loadCities = async () => {
    try {
      setLoading(true);
      const response = await citiesApi.getCities({
        page,
        limit: 20,
        search,
        status: statusFilter,
      });

      setCities(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading cities:', error);
      toast.error('Erreur lors du chargement des villes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCities();
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      region: '',
      country: 'Maroc',
      postalCode: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (city: City) => {
    setModalMode('edit');
    setEditingCity(city);
    setFormData({
      name: city.name,
      region: city.region,
      country: city.country,
      postalCode: city.postal_code || '',
      isActive: city.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await citiesApi.createCity(formData as CreateCityData);
        toast.success('Ville créée avec succès');
      } else {
        await citiesApi.updateCity(editingCity!.id, formData as UpdateCityData);
        toast.success('Ville mise à jour avec succès');
      }
      closeModal();
      loadCities();
    } catch (error: any) {
      console.error('Error saving city:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (city: City) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la ville ${city.name} ?`)) {
      return;
    }

    try {
      await citiesApi.deleteCity(city.id);
      toast.success('Ville supprimée avec succès');
      loadCities();
    } catch (error: any) {
      console.error('Error deleting city:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">Villes</h1>
            <p className="text-textSecondary mt-1">Gérer les villes et leurs frais de livraison</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Ajouter une ville
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, région..."
                  className="input pl-10 w-full"
                />
              </div>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input md:w-48"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>

            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPage(1);
              }}
              className="btn-secondary"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
              <p className="text-textSecondary">Chargement...</p>
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-12">
              <FaCity className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-textSecondary">Aucune ville trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Ville
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Région
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Pays
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Propriétaires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cities.map((city) => (
                      <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: FlitCarColors.primary }}
                            >
                              <FaCity />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-textPrimary">{city.name}</p>
                              <p className="text-xs text-textSecondary">Créée le {formatDate(city.created_at)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          {city.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          {city.country}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            {city.owners_count || 0} propriétaires
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {city.is_active ? (
                            <span className="badge badge-success flex items-center gap-1 w-fit">
                              <FaCheckCircle /> Active
                            </span>
                          ) : (
                            <span className="badge badge-error flex items-center gap-1 w-fit">
                              <FaTimesCircle /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(city)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(city)}
                              className="text-red-600 hover:text-red-800 p-2"
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-textSecondary">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-textPrimary">
                {modalMode === 'create' ? 'Nouvelle ville' : 'Modifier la ville'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Nom de la ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Casablanca"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Région <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="input w-full"
                  placeholder="Casablanca-Settat"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Pays <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input w-full"
                  placeholder="Maroc"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="input w-full"
                  placeholder="20000"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-textPrimary">
                  Ville active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CitiesPage;
