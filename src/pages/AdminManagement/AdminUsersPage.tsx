/**
 * Admin Users Management Page
 * Liste et gestion des utilisateurs administrateurs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import AdminLayout from '../../components/Layout/AdminLayout';
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaKey, FaCheck, FaTimes } from 'react-icons/fa';
import { FlitCarColors } from '../../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Permission {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface Admin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
  is_blocked: boolean;
  blocked_reason: string;
  permissions: Permission[];
}

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/manage-admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data.admins);
    } catch (error: any) {
      console.error('Error loading admins:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des administrateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API_URL}/admin/manage-admins/${selectedAdmin.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Administrateur supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getPermissionsByCategory = (permissions: Permission[]) => {
    const categories = permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);

    return categories;
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      users: 'Utilisateurs',
      cars: 'Voitures',
      bookings: 'Réservations',
      payments: 'Paiements',
      financial: 'Finances',
      reviews: 'Avis',
      settings: 'Paramètres',
      airports: 'Aéroports',
      analytics: 'Analytics',
      admins: 'Admins'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: FlitCarColors.primary }}></div>
            <p className="text-textSecondary">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary flex items-center">
              <FaUserShield className="mr-3" style={{ color: FlitCarColors.primary }} />
              Gestion des Administrateurs
            </h1>
            <p className="text-textSecondary mt-1">
              {admins.length} administrateur{admins.length > 1 ? 's' : ''} enregistré{admins.length > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin-management/add')}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-lg font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            <FaPlus />
            <span>Nouvel Administrateur</span>
          </button>
        </div>

        {/* Admins List */}
        <div className="grid grid-cols-1 gap-4">
          {admins.map((admin) => {
            const permissionsByCategory = getPermissionsByCategory(admin.permissions);
            const categoriesCount = Object.keys(permissionsByCategory).length;

            return (
              <div
                key={admin.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Info principale */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-textPrimary">
                          {admin.first_name} {admin.last_name}
                        </h3>
                        <p className="text-sm text-textSecondary">{admin.email}</p>
                        {admin.phone && (
                          <p className="text-sm text-textSecondary">{admin.phone}</p>
                        )}
                      </div>
                      {admin.is_blocked && (
                        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Bloqué
                        </span>
                      )}
                    </div>

                    {/* Permissions résumé */}
                    <div className="mt-4">
                      <div className="flex items-center mb-2">
                        <FaKey className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {admin.permissions.length} permission{admin.permissions.length > 1 ? 's' : ''} dans {categoriesCount} catégorie{categoriesCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(permissionsByCategory).slice(0, 5).map(([category, perms]) => (
                          <span
                            key={category}
                            className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
                          >
                            {getCategoryLabel(category)} ({perms.length})
                          </span>
                        ))}
                        {categoriesCount > 5 && (
                          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            +{categoriesCount - 5} autres
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-3 text-xs text-gray-500">
                      <p>Créé le {new Date(admin.created_at).toLocaleDateString('fr-FR')}</p>
                      {admin.updated_at !== admin.created_at && (
                        <p>Modifié le {new Date(admin.updated_at).toLocaleDateString('fr-FR')}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => navigate(`/admin-management/edit/${admin.id}`)}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 border-2 rounded-lg font-medium transition-colors hover:bg-gray-50"
                      style={{ borderColor: FlitCarColors.primary, color: FlitCarColors.primary }}
                    >
                      <FaEdit />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium transition-colors hover:bg-red-50"
                    >
                      <FaTrash />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {admins.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="text-center text-gray-500">
                <FaUserShield className="mx-auto text-6xl mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Aucun administrateur trouvé</p>
                <p className="text-sm">Commencez par ajouter un nouvel administrateur</p>
                <button
                  onClick={() => navigate('/admin-management/add')}
                  className="mt-4 px-6 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  Ajouter un administrateur
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ À propos des permissions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chaque administrateur peut avoir des permissions granulaires</li>
            <li>• Les permissions sont organisées par catégorie (Utilisateurs, Voitures, etc.)</li>
            <li>• Vous ne pouvez pas supprimer votre propre compte</li>
            <li>• Les modifications de permissions prennent effet immédiatement</li>
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-textPrimary mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-textSecondary mb-6">
              Êtes-vous sûr de vouloir supprimer l'administrateur <strong>{selectedAdmin.first_name} {selectedAdmin.last_name}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAdmin(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
