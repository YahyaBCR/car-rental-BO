import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import bookingsApi from '../../services/bookingsApi';
import { FlitCarColors, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const BookingsListPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadBookings();
  }, [page, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsApi.getBookings({
        page,
        limit: 20,
        search,
        status: statusFilter,
      });

      setBookings(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBookings();
  };

  const getStatusBadgeClass = (status: string) => {
    const colorMap: Record<string, string> = {
      confirmed: 'badge-success',
      pending_owner: 'badge-warning',
      pending_payment: 'badge-warning',
      in_progress: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-error',
      rejected: 'badge-error',
      expired: 'badge-gray',
    };
    return `badge ${colorMap[status] || 'badge-gray'}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">Réservations</h1>
          <p className="text-textSecondary mt-1">Gérer toutes les réservations de la plateforme</p>
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
                  placeholder="Rechercher par voiture ou client..."
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
              className="input md:w-56"
            >
              <option value="">Tous les statuts</option>
              <option value="pending_owner">En attente propriétaire</option>
              <option value="pending_payment">En attente paiement</option>
              <option value="confirmed">Confirmée</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>

            <button onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }} className="btn-secondary">
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
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-textSecondary">Aucune réservation trouvée</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Voiture</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-textSecondary uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-textSecondary font-mono">
                          {booking.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-textPrimary">{booking.car_name}</p>
                            <p className="text-xs text-textSecondary">{booking.plate_number}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          {booking.client_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-textSecondary">
                          <div>
                            <p>{formatDate(booking.start_date)}</p>
                            <p className="text-xs">→ {formatDate(booking.end_date)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-textPrimary">
                          {formatCurrency(booking.total_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadgeClass(booking.status)}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/bookings/${booking.id}`}
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
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">
                    Précédent
                  </button>
                  <span className="text-sm text-textSecondary">Page {page} sur {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary disabled:opacity-50">
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

export default BookingsListPage;
