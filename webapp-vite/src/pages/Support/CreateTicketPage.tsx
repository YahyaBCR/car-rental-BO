/**
 * Create Support Ticket Page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { supportApi, type SupportCategory } from '../../services/api/supportApi';
import { FlitCarColors } from '../../constants/colors';

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<SupportCategory[]>([]);

  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    bookingId: ''
  });

  const [errors, setErrors] = useState({
    category: '',
    subject: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await supportApi.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      category: '',
      subject: '',
      description: ''
    };

    if (!formData.category) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Le sujet doit contenir au moins 5 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await supportApi.createTicket({
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        bookingId: formData.bookingId || undefined
      });

      toast.success('Ticket créé avec succès');
      navigate(`/support/tickets/${response.ticket.id}`);
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création du ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/support/tickets')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Retour aux tickets</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouveau ticket de support</h1>
          <p className="text-gray-600">Décrivez votre problème ou votre question</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleChange('category', cat.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.category === cat.value
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={formData.category === cat.value ? { borderColor: FlitCarColors.primary } : {}}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="font-semibold text-sm">{cat.label}</div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Résumez votre problème en quelques mots"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subject && (
              <p className="mt-2 text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Décrivez votre problème en détail. Plus vous fournissez d'informations, plus nous pourrons vous aider rapidement."
              rows={8}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex items-center justify-between mt-2">
              {errors.description ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.description.length} caractères (minimum 20)
                </p>
              )}
            </div>
          </div>

          {/* Booking ID (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de réservation (optionnel)
            </label>
            <input
              type="text"
              value={formData.bookingId}
              onChange={(e) => handleChange('bookingId', e.target.value)}
              placeholder="Si votre demande concerne une réservation spécifique"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-500">
              Le numéro de réservation nous aidera à traiter votre demande plus rapidement
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/support/tickets')}
              className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              {loading ? 'Création...' : 'Créer le ticket'}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Conseils pour une réponse rapide</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Choisissez la catégorie la plus appropriée</li>
            <li>• Décrivez votre problème de manière claire et détaillée</li>
            <li>• Incluez le numéro de réservation si applicable</li>
            <li>• Mentionnez les étapes que vous avez déjà tentées</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
