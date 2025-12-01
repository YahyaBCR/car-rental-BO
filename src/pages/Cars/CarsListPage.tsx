import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import carsApi from '../../services/carsApi';
import { FlitCarColors } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const CarsListPage: React.FC = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadCars();
  }, [page, statusFilter]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await carsApi.getCars({
        page,
        limit: 20,
        search,
        status: statusFilter,
      });

      setCars(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Erreur lors du chargement des voitures');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCars();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Voitures</h1>
          <p className="text-textSecondary mt-1">Gérer toutes les voitures de la plateforme</p>
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
                  placeholder="Rechercher par marque, modèle ou plaque..."
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
              <option value="available">Disponible</option>
              <option value="unavailable">Non disponible</option>
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
          ) : cars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-textSecondary">Aucune voiture trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Voiture</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Propriétaire</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Prix/jour</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Réservations</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cars.map((car: any) => (
                      <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-textPrimary">
                              {car.brand} {car.model} ({car.year})
                            </p>
                            <p className="text-xs text-textSecondary">{car.plate_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          {car.owner_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-textPrimary">
                          {formatCurrency(car.price_per_day)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${car.is_available ? 'badge-success' : 'badge-gray'}`}>
                            {car.is_available ? 'Disponible' : 'Non disponible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          {car.total_bookings || 0} réservations
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/cars/${car.id}`}
                            className="text-primary hover:text-primaryDark inline-flex items-center gap-1"
                          >
                            <FaEye /> Voir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
    </AdminLayout>
  );
};

export default CarsListPage;
