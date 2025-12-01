/**
 * Admin Form Page
 * Formulaire pour créer ou modifier un administrateur
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import AdminLayout from '../../components/Layout/AdminLayout';
import { FaUserShield, FaSave, FaTimes, FaKey, FaCheck } from 'react-icons/fa';
import { FlitCarColors } from '../../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
}

interface GroupedPermissions {
  [category: string]: Permission[];
}

const AdminFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [allPermissions, setAllPermissions] = useState<GroupedPermissions>({});

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPermissions();
    if (isEditMode) {
      loadAdmin();
    }
  }, [id]);

  const loadPermissions = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllPermissions(response.data.grouped);
    } catch (error: any) {
      console.error('Error loading permissions:', error);
      toast.error('Erreur lors du chargement des permissions');
    }
  };

  const loadAdmin = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/admin/manage-admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const admin = response.data.admin;
      setFormData({
        email: admin.email,
        password: '',
        confirmPassword: '',
        first_name: admin.first_name,
        last_name: admin.last_name,
        phone: admin.phone || '',
      });

      setSelectedPermissions(admin.permissions.map((p: Permission) => p.id));
    } catch (error: any) {
      console.error('Error loading admin:', error);
      toast.error('Erreur lors du chargement de l\'administrateur');
      navigate('/admin-management');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleCategory = (category: string) => {
    const categoryPermissions = allPermissions[category].map(p => p.id);
    const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissions.includes(id)));
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermissions])]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!isEditMode || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    if (!formData.first_name) {
      newErrors.first_name = 'Le prénom est requis';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Le nom est requis';
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'Vous devez sélectionner au moins une permission';
      toast.error('Vous devez sélectionner au moins une permission');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('admin_token');

      const payload: any = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        permissions: selectedPermissions,
      };

      if (!isEditMode || formData.password) {
        payload.password = formData.password;
      }

      if (isEditMode) {
        await axios.put(
          `${API_URL}/admin/manage-admins/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Administrateur modifié avec succès');
      } else {
        await axios.post(
          `${API_URL}/admin/manage-admins`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Administrateur créé avec succès');
      }

      navigate('/admin-management');
    } catch (error: any) {
      console.error('Error saving admin:', error);
      const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
      toast.error(message);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.param] = err.msg;
        });
        setErrors(backendErrors);
      }
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary flex items-center">
              <FaUserShield className="mr-3" style={{ color: FlitCarColors.primary }} />
              {isEditMode ? 'Modifier' : 'Nouvel'} Administrateur
            </h1>
            <p className="text-textSecondary mt-1">
              {isEditMode ? 'Modifiez les informations et permissions' : 'Créez un nouvel administrateur avec des permissions spécifiques'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin-management')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaTimes />
            <span>Annuler</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-textPrimary mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jean"
                />
                {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Dupont"
                />
                {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="jean.dupont@flitcar.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                  placeholder="+212 6 00 00 00 00"
                />
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-textPrimary mb-4">
              {isEditMode ? 'Changer le mot de passe (optionnel)' : 'Mot de passe'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEditMode ? 'Nouveau mot de passe' : 'Mot de passe'} {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 caractères, dont une majuscule, une minuscule et un chiffre
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-textPrimary flex items-center">
                  <FaKey className="mr-2" />
                  Permissions <span className="text-red-500 ml-1">*</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedPermissions.length} permission{selectedPermissions.length > 1 ? 's' : ''} sélectionnée{selectedPermissions.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(allPermissions).map(([category, permissions]) => {
                const categoryPermissions = permissions.map(p => p.id);
                const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id));
                const someSelected = categoryPermissions.some(id => selectedPermissions.includes(id));

                return (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={allSelected}
                        onChange={() => toggleCategory(category)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        style={allSelected ? { accentColor: FlitCarColors.primary } : {}}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="ml-3 text-base font-semibold text-gray-900 cursor-pointer"
                      >
                        {getCategoryLabel(category)}
                        {someSelected && !allSelected && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({categoryPermissions.filter(id => selectedPermissions.includes(id)).length}/{categoryPermissions.length})
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start">
                          <input
                            type="checkbox"
                            id={`perm-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            style={selectedPermissions.includes(permission.id) ? { accentColor: FlitCarColors.primary } : {}}
                          />
                          <label
                            htmlFor={`perm-${permission.id}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            <span className="font-medium text-gray-700">{permission.name}</span>
                            {permission.description && (
                              <span className="block text-xs text-gray-500">{permission.description}</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin-management')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>{isEditMode ? 'Mettre à jour' : 'Créer l\'administrateur'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminFormPage;
