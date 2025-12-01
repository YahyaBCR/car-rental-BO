import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCar, FaUser, FaEnvelope, FaCalendar, FaMapMarkerAlt, FaGasPump, FaCog, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import carsApi from '../../services/carsApi';
import { FlitCarColors } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface CarDetails {
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    plate_number: string;
    price_per_day: number;
    is_available: boolean;
    fuel_type: string;
    transmission: string;
    seats: number;
    doors: number;
    mileage: number;
    color: string;
    description: string;
    location_city: string;
    owner_name: string;
    owner_email: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
  };
  bookings: any[];
}

const CarDetailsPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarDetails();
  }, [carId]);

  const loadCarDetails = async () => {
    try {
      setLoading(true);
      const data = await carsApi.getCarDetails(carId!);
      setCarDetails(data);
    } catch (error) {
      console.error('Error loading car details:', error);
      toast.error('Erreur lors du chargement des détails de la voiture');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const colorMap: Record<string, string> = {
      confirmed: 'badge-success',
      pending_owner: 'badge-warning',
      pending_payment: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-error',
      rejected: 'badge-error',
    };
    return `badge ${colorMap[status] || 'badge-gray'}`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_owner: 'En attente propriétaire',
      pending_payment: 'En attente paiement',
      confirmed: 'Confirmée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
      rejected: 'Refusée',
    };
    return labels[status] || status;
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

  if (!carDetails) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-textSecondary">Voiture non trouvée</p>
        </div>
      </AdminLayout>
    );
  }

  const { car, bookings } = carDetails;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cars')}
            className="btn-secondary flex items-center gap-2"
          >
            <FaArrowLeft /> Retour
          </button>
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">
              {car.brand} {car.model}
            </h1>
            <p className="text-textSecondary mt-1">Détails de la voiture</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Header */}
            <div className="card">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl"
                      style={{ backgroundColor: FlitCarColors.primary }}
                    >
                      <FaCar />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-textPrimary">
                        {car.brand} {car.model}
                      </h2>
                      <p className="text-textSecondary">{car.year} • {car.plate_number}</p>
                      <span className={`badge ${car.is_available ? 'badge-success' : 'badge-error'} mt-2`}>
                        {car.is_available ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: FlitCarColors.primary }}>
                      {formatCurrency(car.price_per_day)}
                    </p>
                    <p className="text-sm text-textSecondary">par jour</p>
                  </div>
                </div>

                {/* Car Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaGasPump className="text-xl text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Carburant</p>
                      <p className="text-sm font-medium text-textPrimary">{car.fuel_type || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaCog className="text-xl text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Transmission</p>
                      <p className="text-sm font-medium text-textPrimary">{car.transmission || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaUsers className="text-xl text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Places</p>
                      <p className="text-sm font-medium text-textPrimary">{car.seats || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaCar className="text-xl text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Portes</p>
                      <p className="text-sm font-medium text-textPrimary">{car.doors || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Localisation</p>
                      <p className="text-sm font-medium text-textPrimary">{car.location_city || 'Non spécifié'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCar className="text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Couleur</p>
                      <p className="text-sm font-medium text-textPrimary">{car.color || 'Non spécifié'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Kilométrage</p>
                      <p className="text-sm font-medium text-textPrimary">{car.mileage ? `${car.mileage.toLocaleString('fr-FR')} km` : 'Non spécifié'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-textSecondary" />
                    <div>
                      <p className="text-xs text-textSecondary">Ajoutée le</p>
                      <p className="text-sm font-medium text-textPrimary">{formatDate(car.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {car.description && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-textSecondary mb-2">Description</p>
                    <p className="text-sm text-textPrimary">{car.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bookings History */}
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-textPrimary">Historique des réservations ({bookings.length})</h2>
              </div>
              <div className="p-6">
                {bookings.length === 0 ? (
                  <p className="text-center text-textSecondary py-8">Aucune réservation</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Dates</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Montant</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-textPrimary">
                              {booking.client_name}
                            </td>
                            <td className="px-4 py-3 text-sm text-textSecondary">
                              {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-textPrimary">
                              {formatCurrency(booking.total_price)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={getStatusBadgeClass(booking.status)}>
                                {getStatusLabel(booking.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Owner Info */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-textPrimary">Propriétaire</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: FlitCarColors.secondary }}
                  >
                    {car.owner_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-textPrimary">{car.owner_name}</p>
                    <span className="badge badge-success text-xs">Propriétaire</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
                  <FaEnvelope className="text-textSecondary mt-1" />
                  <div>
                    <p className="text-xs text-textSecondary">Email</p>
                    <p className="text-sm text-textPrimary break-all">{car.owner_email}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/users/${car.owner_id}`)}
                  className="btn-primary w-full mt-4"
                >
                  Voir le profil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CarDetailsPage;
