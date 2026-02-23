import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPhone, FaCalendar, FaUser, FaCar, FaShoppingCart, FaPlane, FaCity, FaBan, FaLock, FaUnlock, FaEdit, FaBuilding, FaMapMarkerAlt, FaGlobe, FaIdCard, FaFileAlt } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import usersApi from '../../services/usersApi';
import { UpdateUserData } from '../../services/usersApi';
import { FlitCarColors } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface UserDetails {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: string;
    ice?: string;
    rc?: string;
    company_address?: string;
    company_city?: string;
    country?: string;
    is_blocked?: boolean;
    blocked_reason?: string;
    blocked_at?: string;
    created_at: string;
    updated_at: string;
  };
  bookings: any[];
  cars: any[];
}

const BLOCKING_REASONS = [
  'Non-respect des conditions',
  'Fraude',
  'Véhicules non conformes',
  'Comportement inapproprié',
  'Autres',
];

const UserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<UpdateUserData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getUserDetails(userId!);
      setUserDetails(data);
    } catch (error) {
      console.error('Error loading user details:', error);
      toast.error('Erreur lors du chargement des détails utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockOwner = async () => {
    if (!selectedReason) {
      toast.error('Veuillez sélectionner un motif de blocage');
      return;
    }

    try {
      setBlocking(true);
      await usersApi.blockOwner(userId!, selectedReason);
      toast.success('Propriétaire bloqué avec succès');
      setShowBlockModal(false);
      setSelectedReason('');
      await loadUserDetails();
    } catch (error) {
      console.error('Error blocking owner:', error);
      toast.error('Erreur lors du blocage');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockOwner = async () => {
    if (!confirm('Êtes-vous sûr de vouloir débloquer ce propriétaire ?')) {
      return;
    }

    try {
      setBlocking(true);
      await usersApi.unblockOwner(userId!);
      toast.success('Propriétaire débloqué avec succès');
      await loadUserDetails();
    } catch (error) {
      console.error('Error unblocking owner:', error);
      toast.error('Erreur lors du déblocage');
    } finally {
      setBlocking(false);
    }
  };

  const openEditModal = () => {
    if (!userDetails) return;
    const { user } = userDetails;
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      ice: user.ice || '',
      rc: user.rc || '',
      company_address: user.company_address || '',
      company_city: user.company_city || '',
      country: user.country || '',
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);
      await usersApi.updateUser(userId!, editForm);
      toast.success('Utilisateur mis à jour avec succès');
      setShowEditModal(false);
      await loadUserDetails();
    } catch (error: any) {
      console.error('Error updating user:', error);
      const message = error?.response?.data?.message || 'Erreur lors de la mise à jour';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'client':
        return 'badge-primary';
      case 'owner':
        return 'badge-success';
      case 'admin':
        return 'badge-warning';
      default:
        return 'badge-gray';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client':
        return 'Client';
      case 'owner':
        return 'Propriétaire';
      case 'admin':
        return 'Administrateur';
      default:
        return role;
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

  if (!userDetails) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-textSecondary">Utilisateur non trouvé</p>
        </div>
      </AdminLayout>
    );
  }

  const { user, bookings, cars } = userDetails;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/users')}
              className="btn-secondary flex items-center gap-2"
            >
              <FaArrowLeft /> Retour
            </button>
            <div>
              <h1 className="text-3xl font-bold text-textPrimary">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-textSecondary mt-1">Détails de l'utilisateur</p>
            </div>
          </div>

          {/* Owner-specific actions */}
          {user.role === 'owner' && (
            <div className="flex items-center gap-3">
              <button
                onClick={openEditModal}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                <FaEdit /> Modifier
              </button>

              <button
                onClick={() => navigate(`/users/${user.id}/airports`)}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                <FaPlane /> Gérer les aéroports
              </button>

              <button
                onClick={() => navigate(`/users/${user.id}/cities`)}
                className="px-6 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                <FaCity /> Gérer les villes
              </button>

              {user.is_blocked ? (
                <button
                  onClick={handleUnblockOwner}
                  disabled={blocking}
                  className="px-6 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FaUnlock /> Débloquer
                </button>
              ) : (
                <button
                  onClick={() => setShowBlockModal(true)}
                  disabled={blocking}
                  className="px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FaBan /> Bloquer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Blocked Alert */}
        {user.role === 'owner' && user.is_blocked && (
          <div className="card bg-red-50 border-2 border-red-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                  <FaLock className="text-red-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Compte bloqué</h3>
                  <p className="text-red-700 mb-1">
                    <strong>Motif:</strong> {user.blocked_reason}
                  </p>
                  {user.blocked_at && (
                    <p className="text-sm text-red-600">
                      Bloqué le: {formatDate(user.blocked_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Info Card */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary">
                    {user.first_name} {user.last_name}
                  </h2>
                  <span className={`badge ${getRoleBadgeClass(user.role)} mt-2`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <FaEnvelope className="text-textSecondary" />
                </div>
                <div>
                  <p className="text-xs text-textSecondary">Email</p>
                  <p className="text-sm font-medium text-textPrimary">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <FaPhone className="text-textSecondary" />
                </div>
                <div>
                  <p className="text-xs text-textSecondary">Téléphone</p>
                  <p className="text-sm font-medium text-textPrimary">{user.phone || 'Non renseigné'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <FaCalendar className="text-textSecondary" />
                </div>
                <div>
                  <p className="text-xs text-textSecondary">Membre depuis</p>
                  <p className="text-sm font-medium text-textPrimary">{formatDate(user.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                  <FaUser className="text-textSecondary" />
                </div>
                <div>
                  <p className="text-xs text-textSecondary">ID Utilisateur</p>
                  <p className="text-sm font-medium text-textPrimary">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info for Owners */}
        {user.role === 'owner' && (
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaBuilding className="text-xl" style={{ color: FlitCarColors.primary }} />
                <h2 className="text-xl font-bold text-textPrimary">Informations société</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                    <FaIdCard className="text-textSecondary" />
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary">ICE</p>
                    <p className="text-sm font-medium text-textPrimary">{user.ice || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                    <FaFileAlt className="text-textSecondary" />
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary">RC</p>
                    <p className="text-sm font-medium text-textPrimary">{user.rc || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                    <FaMapMarkerAlt className="text-textSecondary" />
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary">Adresse société</p>
                    <p className="text-sm font-medium text-textPrimary">{user.company_address || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                    <FaCity className="text-textSecondary" />
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary">Ville société</p>
                    <p className="text-sm font-medium text-textPrimary">{user.company_city || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                    <FaGlobe className="text-textSecondary" />
                  </div>
                  <div>
                    <p className="text-xs text-textSecondary">Pays</p>
                    <p className="text-sm font-medium text-textPrimary">{user.country || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Bookings */}
        {user.role === 'client' && (
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaShoppingCart className="text-xl" style={{ color: FlitCarColors.primary }} />
                <h2 className="text-xl font-bold text-textPrimary">Réservations ({bookings.length})</h2>
              </div>
            </div>
            <div className="p-6">
              {bookings.length === 0 ? (
                <p className="text-center text-textSecondary py-8">Aucune réservation</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Voiture</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Dates</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Montant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Créée le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-textPrimary">
                              {booking.brand} {booking.model}
                            </p>
                            <p className="text-xs text-textSecondary">{booking.year}</p>
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
                          <td className="px-4 py-3 text-sm text-textSecondary">
                            {formatDate(booking.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Owner Cars */}
        {user.role === 'owner' && (
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FaCar className="text-xl" style={{ color: FlitCarColors.primary }} />
                <h2 className="text-xl font-bold text-textPrimary">Voitures ({cars.length})</h2>
              </div>
            </div>
            <div className="p-6">
              {cars.length === 0 ? (
                <p className="text-center text-textSecondary py-8">Aucune voiture</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Voiture</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Immatriculation</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Prix/Jour</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Disponibilité</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase">Ajoutée le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cars.map((car) => (
                        <tr key={car.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-textPrimary">
                              {car.brand} {car.model}
                            </p>
                            <p className="text-xs text-textSecondary">{car.year}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-textSecondary">
                            {car.plate_number}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-textPrimary">
                            {formatCurrency(car.price_per_day)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={car.is_available ? 'badge-success' : 'badge-error'}>
                              {car.is_available ? 'Disponible' : 'Indisponible'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-textSecondary">
                            {formatDate(car.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blocking Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-3">
                  <FaBan className="text-red-600" />
                  Bloquer le propriétaire
                </h2>
              </div>

              <div className="p-6">
                <p className="text-textSecondary mb-4">
                  Sélectionnez le motif du blocage de <strong>{user.first_name} {user.last_name}</strong>:
                </p>

                <div className="space-y-2">
                  {BLOCKING_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedReason === reason
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="blocking-reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-4 h-4"
                        style={{ accentColor: FlitCarColors.primary }}
                      />
                      <span className="text-sm font-medium text-textPrimary">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setSelectedReason('');
                  }}
                  disabled={blocking}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBlockOwner}
                  disabled={!selectedReason || blocking}
                  className="px-6 py-2 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {blocking ? 'Blocage...' : 'Bloquer'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-3">
                  <FaEdit style={{ color: FlitCarColors.primary }} />
                  Modifier l'utilisateur
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Prénom</label>
                    <input
                      type="text"
                      value={editForm.first_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Nom</label>
                    <input
                      type="text"
                      value={editForm.last_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {user.role === 'owner' && (
                  <>
                    <hr className="my-4 border-gray-200" />
                    <h3 className="text-lg font-semibold text-textPrimary flex items-center gap-2">
                      <FaBuilding style={{ color: FlitCarColors.primary }} />
                      Informations société
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">ICE</label>
                        <input
                          type="text"
                          value={editForm.ice || ''}
                          onChange={(e) => setEditForm({ ...editForm, ice: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">RC</label>
                        <input
                          type="text"
                          value={editForm.rc || ''}
                          onChange={(e) => setEditForm({ ...editForm, rc: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1">Adresse société</label>
                      <input
                        type="text"
                        value={editForm.company_address || ''}
                        onChange={(e) => setEditForm({ ...editForm, company_address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">Ville société</label>
                        <input
                          type="text"
                          value={editForm.company_city || ''}
                          onChange={(e) => setEditForm({ ...editForm, company_city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">Pays (code ISO : MA, FR…)</label>
                        <input
                          type="text"
                          value={editForm.country || ''}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value.toUpperCase().slice(0, 2) })}
                          maxLength={2}
                          placeholder="MA"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="px-6 py-2 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserDetailsPage;
