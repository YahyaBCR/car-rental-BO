import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaPlane, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import airportsApi, { Airport, CreateAirportData, UpdateAirportData } from '../../services/airportsApi';
import { FlitCarColors } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AirportsPage: React.FC = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    country: '',
    isActive: true,
  });

  useEffect(() => {
    loadAirports();
  }, [page, statusFilter]);

  // Clear selection when airports change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [airports]);

  const loadAirports = async () => {
    try {
      setLoading(true);
      const response = await airportsApi.getAirports({
        page,
        limit: 20,
        search,
        status: statusFilter,
      });

      setAirports(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading airports:', error);
      toast.error('Erreur lors du chargement des aéroports');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAirports();
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === airports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(airports.map(a => a.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkActivate = async () => {
    if (selectedIds.size === 0) return;

    try {
      setBulkLoading(true);
      await airportsApi.bulkUpdateStatus(Array.from(selectedIds), true);
      toast.success(`${selectedIds.size} aéroport(s) activé(s)`);
      loadAirports();
    } catch (error: any) {
      console.error('Error activating airports:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'activation');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) return;

    try {
      setBulkLoading(true);
      await airportsApi.bulkUpdateStatus(Array.from(selectedIds), false);
      toast.success(`${selectedIds.size} aéroport(s) désactivé(s)`);
      loadAirports();
    } catch (error: any) {
      console.error('Error deactivating airports:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la désactivation');
    } finally {
      setBulkLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      code: '',
      city: '',
      country: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (airport: Airport) => {
    setModalMode('edit');
    setEditingAirport(airport);
    setFormData({
      name: airport.name,
      code: airport.code,
      city: airport.city,
      country: airport.country,
      isActive: airport.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAirport(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await airportsApi.createAirport(formData as CreateAirportData);
        toast.success('Aéroport créé avec succès');
      } else {
        await airportsApi.updateAirport(editingAirport!.id, formData as UpdateAirportData);
        toast.success('Aéroport mis à jour avec succès');
      }
      closeModal();
      loadAirports();
    } catch (error: any) {
      console.error('Error saving airport:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (airport: Airport) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'aéroport ${airport.name} ?`)) {
      return;
    }

    try {
      await airportsApi.deleteAirport(airport.id);
      toast.success('Aéroport supprimé avec succès');
      loadAirports();
    } catch (error: any) {
      console.error('Error deleting airport:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const isAllSelected = airports.length > 0 && selectedIds.size === airports.length;
  const isSomeSelected = selectedIds.size > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">Aéroports</h1>
            <p className="text-textSecondary mt-1">Gérer les aéroports et leurs frais</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Ajouter un aéroport
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
                  placeholder="Rechercher par nom, code, ville..."
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
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
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

        {/* Bulk Actions Bar */}
        {isSomeSelected && (
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedIds.size} aéroport(s) sélectionné(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkActivate}
                  disabled={bulkLoading}
                  className="btn-primary flex items-center gap-2 text-sm py-2"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <FaToggleOn /> Activer
                </button>
                <button
                  onClick={handleBulkDeactivate}
                  disabled={bulkLoading}
                  className="btn-primary flex items-center gap-2 text-sm py-2"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <FaToggleOff /> Désactiver
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="btn-secondary text-sm py-2"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
              <p className="text-textSecondary">Chargement...</p>
            </div>
          ) : airports.length === 0 ? (
            <div className="text-center py-12">
              <FaPlane className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-textSecondary">Aucun aéroport trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Aéroport
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                        Utilisation
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
                    {airports.map((airport) => (
                      <tr
                        key={airport.id}
                        className={`hover:bg-gray-50 transition-colors ${selectedIds.has(airport.id) ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(airport.id)}
                            onChange={() => toggleSelect(airport.id)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: FlitCarColors.primary }}
                            >
                              <FaPlane />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-textPrimary">{airport.name}</p>
                              <p className="text-xs text-textSecondary">Créé le {formatDate(airport.created_at)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            {airport.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          <p>{airport.city}</p>
                          <p className="text-xs">{airport.country}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          <p>{airport.pickup_count || 0} prises en charge</p>
                          <p>{airport.dropoff_count || 0} retours</p>
                          <p className="text-xs">{airport.cars_count || 0} voitures</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {airport.is_active ? (
                            <span className="badge badge-success flex items-center gap-1 w-fit">
                              <FaCheckCircle /> Actif
                            </span>
                          ) : (
                            <span className="badge badge-error flex items-center gap-1 w-fit">
                              <FaTimesCircle /> Inactif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(airport)}
                              className="text-blue-600 hover:text-blue-800 p-2"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(airport)}
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
                {modalMode === 'create' ? 'Nouvel aéroport' : 'Modifier l\'aéroport'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Nom de l'aéroport <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Aéroport Mohammed V"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Code IATA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input w-full"
                  placeholder="CMN"
                  maxLength={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input w-full"
                  placeholder="Casablanca"
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-textPrimary">
                  Aéroport actif
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

export default AirportsPage;
