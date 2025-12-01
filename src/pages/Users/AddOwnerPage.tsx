import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import AdminLayout from '../../components/Layout/AdminLayout';
import usersApi from '../../services/usersApi';
import { FlitCarColors } from '../../utils/constants';
import toast from 'react-hot-toast';

const MOROCCAN_CITIES = [
  'Agadir',
  'Al Hoceima',
  'Béni Mellal',
  'Casablanca',
  'Dakhla',
  'Essaouira',
  'Fès',
  'Guelmim',
  'Laâyoune',
  'Oujda/Nador',
  'Rabat/Salé',
  'Tanger',
  'Tétouan',
  'Zagora',
];

const AddOwnerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    ice: '',
    rc: '',
    companyAddress: '',
    companyCity: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
    if (!formData.email.trim()) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.phone.trim()) newErrors.phone = 'Téléphone requis';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) newErrors.password = 'Au moins 6 caractères';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.ice.trim()) newErrors.ice = 'ICE requis';
    if (!formData.rc.trim()) newErrors.rc = 'RC requis';
    if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Adresse requise';
    if (!formData.companyCity) newErrors.companyCity = 'Ville requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      setLoading(true);

      const ownerData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'owner',
        ice: formData.ice,
        rc: formData.rc,
        company_address: formData.companyAddress,
        company_city: formData.companyCity,
      };

      await usersApi.createOwner(ownerData);
      toast.success('Propriétaire créé avec succès');
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error creating owner:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du propriétaire');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/admin/users')}
            className="text-textSecondary hover:text-primary mb-4"
          >
            ← Retour à la liste
          </button>
          <h1 className="text-3xl font-bold text-textPrimary">Ajouter un propriétaire</h1>
          <p className="text-textSecondary mt-1">Créer un nouveau compte propriétaire</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="card">
            <h2 className="text-xl font-bold text-textPrimary mb-4 flex items-center">
              <FaUser className="mr-2" /> Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Mohammed"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Alami"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  <FaEnvelope className="inline mr-2" />Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@exemple.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  <FaPhone className="inline mr-2" />Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+212 6XX XXX XXX"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  <FaLock className="inline mr-2" />Mot de passe *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  <FaLock className="inline mr-2" />Confirmer mot de passe *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Informations société */}
          <div className="card">
            <h2 className="text-xl font-bold text-textPrimary mb-4 flex items-center">
              <FaBuilding className="mr-2" /> Informations société
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  ICE (Identifiant Commun de l'Entreprise) *
                </label>
                <input
                  type="text"
                  name="ice"
                  value={formData.ice}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.ice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 001234567000012"
                />
                {errors.ice && <p className="mt-1 text-sm text-red-500">{errors.ice}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  RC (Registre de Commerce) *
                </label>
                <input
                  type="text"
                  name="rc"
                  value={formData.rc}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.rc ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 123456"
                />
                {errors.rc && <p className="mt-1 text-sm text-red-500">{errors.rc}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />Adresse de la société *
                </label>
                <textarea
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.companyAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 123 Avenue Mohammed V, Quartier des Affaires"
                />
                {errors.companyAddress && <p className="mt-1 text-sm text-red-500">{errors.companyAddress}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Ville de la société *
                </label>
                <select
                  name="companyCity"
                  value={formData.companyCity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent ${
                    errors.companyCity ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une ville</option>
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.companyCity && <p className="mt-1 text-sm text-red-500">{errors.companyCity}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-textPrimary hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              {loading ? 'Création...' : 'Créer le propriétaire'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddOwnerPage;
