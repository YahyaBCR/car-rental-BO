import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { carsApi } from '../../services/api/carsApi';
import { featuresApi, type Feature, type FeatureCategory } from '../../services/api/featuresApi';
import type { CreateCarData } from '../../types/car.types';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../constants/apiConstants';

const CarFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Features/Equipment
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [featureCategories, setFeatureCategories] = useState<FeatureCategory[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Basic car info
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [color, setColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [pricePerDay, setPricePerDay] = useState(0);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('');  // Vehicle type
  const [fuelType, setFuelType] = useState<string>('gasoline');
  const [transmission, setTransmission] = useState<string>('automatic');
  const [seats, setSeats] = useState(5);

  // Booking settings
  const [depositAmount, setDepositAmount] = useState(0);
  const [minRentalDays, setMinRentalDays] = useState(1);
  const [isBookable, setIsBookable] = useState(true);

  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadFeatures();
    if (isEditMode && id) {
      loadCar(id);
    }
  }, [id, i18n.language]); // Reload when language changes

  const loadFeatures = async () => {
    try {
      // Normalize language to 2-letter code (ar-MA -> ar, en-US -> en)
      const currentLang = i18n.language.split('-')[0];
      console.log('🌍 Loading features with language:', currentLang);
      const [features, categories] = await Promise.all([
        featuresApi.getAllFeatures(currentLang),
        featuresApi.getCategories()
      ]);
      setAllFeatures(features);
      setFeatureCategories(categories);
    } catch (error) {
      console.error('Error loading features:', error);
      toast.error('Erreur lors du chargement des équipements');
    }
  };

  const loadCar = async (carId: string) => {
    try {
      setLoading(true);
      const car = await carsApi.getCarDetails(carId);

      // Fill form with car data
      setBrand(car.brand || '');
      setModel(car.model || '');
      setYear(parseInt(car.year?.toString() || '') || new Date().getFullYear());
      setColor(car.color || '');
      setPlateNumber(car.plateNumber || car.plate_number || '');
      setPricePerDay(parseFloat((car.pricePerDay || car.price_per_day)?.toString() || '0') || 0);
      setDescription(car.description || '');
      setType(car.type || '');
      setFuelType(car.fuelType || car.fuel_type || 'gasoline');
      setTransmission(car.transmission || 'automatic');
      setSeats(parseInt(car.seats?.toString() || '5') || 5);
      setDepositAmount(parseFloat((car.depositAmount || car.deposit_amount)?.toString() || '0') || 0);
      setMinRentalDays(parseInt((car.minRentalDays || car.min_rental_days)?.toString() || '1') || 1);
      setIsBookable(car.isBookable ?? car.is_bookable ?? true);

      // Load existing images
      if (car.image_urls) {
        setExistingImages(car.image_urls);
      }

      // Load car features
      const carFeatures = await featuresApi.getCarFeatures(carId);
      setSelectedFeatures(carFeatures.map(f => f.id));
    } catch (error) {
      console.error('Error loading car:', error);
      toast.error('Erreur lors du chargement de la voiture');
      navigate('/owner/cars');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (!brand || !model || !color || !plateNumber) {
      toast.error('Veuillez remplir tous les champs obligatoires (marque, modèle, couleur, plaque)');
      return;
    }

    // Validation des nombres
    if (isNaN(pricePerDay) || pricePerDay <= 0) {
      toast.error('Le prix par jour doit être un nombre valide supérieur à 0');
      return;
    }

    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      toast.error('L\'année doit être valide');
      return;
    }

    if (isNaN(seats) || seats < 1) {
      toast.error('Le nombre de places doit être valide');
      return;
    }

    try {
      setSubmitting(true);

      const carData: CreateCarData = {
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year.toString()) || new Date().getFullYear(),
        color: color.trim(),
        plateNumber: plateNumber.trim(),
        pricePerDay: parseFloat(pricePerDay.toString()) || 0,
        description: description?.trim() || '',
        type: type?.trim() || '',
        fuelType: fuelType || 'gasoline',
        transmission: transmission || 'automatic',
        seats: parseInt(seats.toString()) || 5,
        isAvailable: true,
        imageUrls: existingImages, // Include images for creation
      };

      let carId: string;

      if (isEditMode && id) {
        // Update existing car
        const updated = await carsApi.updateCar(id, carData);
        carId = updated.id;
        toast.success('Voiture modifiée avec succès');
      } else {
        // Create new car
        const created = await carsApi.createCar(carData);
        carId = created.id;
        toast.success('Voiture ajoutée avec succès');
      }

      // Note: Booking settings (deposit, minRentalDays) are managed via car creation/update
      // Airport management is now handled by admin in the backoffice

      // Update car features/equipment
      try {
        await featuresApi.updateCarFeatures(carId, selectedFeatures);
      } catch (featuresError: any) {
        console.error('Error updating features:', featuresError);
        // Don't block the whole operation if features update fails
        toast.warning('Voiture enregistrée, mais erreur lors de la mise à jour des équipements');
      }

      toast.success('Voiture enregistrée avec succès');
      navigate('/owner/cars');
    } catch (error: any) {
      console.error('Error saving car:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  const uploadToImgbb = async (file: File): Promise<string> => {
    // Upload directly to imgbb from frontend
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      'https://api.imgbb.com/1/upload?key=b7955243b3a176d16f44333c03391271',
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validate file size (32MB max for imgbb)
    if (file.size > 32 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 32 MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Seules les images sont autorisées');
      return;
    }

    try {
      setUploadingImage(true);

      // Upload to imgbb
      const imageUrl = await uploadToImgbb(file);

      // For edit mode: also save to backend
      if (isEditMode && id) {
        // Save the image URL to the database
        await fetch(`${API_BASE_URL}/api/cars/${id}/images/url`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ imageUrl }),
        });
      }

      // Add to local state
      setExistingImages(prev => [...prev, imageUrl]);
      toast.success('Image ajoutée avec succès');

      // Reset file input
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      // If in edit mode, delete from backend
      if (isEditMode && id) {
        await carsApi.deleteCarImage(id, imageUrl);
      }

      // Remove image from local state
      setExistingImages(prev => prev.filter(url => url !== imageUrl));
      toast.success('Image supprimée avec succès');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'image');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/owner/cars')}
              className="text-textSecondary hover:text-primary mb-4"
            >
              ← Retour à mes voitures
            </button>
            <h1 className="text-3xl font-black text-textPrimary mb-2">
              {isEditMode ? 'Modifier la voiture' : 'Ajouter une voiture'}
            </h1>
            <p className="text-textSecondary">
              {isEditMode ? 'Modifiez les informations de votre voiture' : 'Ajoutez une nouvelle voiture à votre flotte'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-textPrimary mb-6">Informations de base</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Marque *
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ex: Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ex: Camry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Année *
                  </label>
                  <input
                    type="number"
                    value={year || new Date().getFullYear()}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    required
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Couleur *
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ex: Blanc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Plaque d'immatriculation *
                  </label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="ex: ABC-123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Prix par jour (DH) *
                  </label>
                  <input
                    type="number"
                    value={pricePerDay}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPricePerDay(val === '' ? 0 : parseFloat(val) || 0);
                    }}
                    required
                    min={0}
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Type de véhicule
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="berline">Berline</option>
                    <option value="suv">SUV</option>
                    <option value="compact">Compact</option>
                    <option value="luxe">Luxe</option>
                    <option value="utilitaire">Utilitaire</option>
                    <option value="citadine">Citadine</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Type de carburant
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="gasoline">Essence</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Électrique</option>
                    <option value="hybrid">Hybride</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Transmission
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="manual">Manuelle</option>
                    <option value="automatic">Automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Nombre de places
                  </label>
                  <input
                    type="number"
                    value={seats || 5}
                    onChange={(e) => setSeats(parseInt(e.target.value) || 5)}
                    min={1}
                    max={9}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-textPrimary mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Décrivez votre voiture..."
                />
              </div>
            </div>

            {/* Image Management */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-textPrimary mb-2">Photos de la voiture</h2>
              <p className="text-sm text-textSecondary mb-6">
                {isEditMode
                  ? 'Ajoutez ou supprimez des photos de votre voiture'
                  : 'Enregistrez d\'abord la voiture pour ajouter des photos'}
              </p>

              {/* Existing Images Grid */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-textPrimary mb-3">
                    Images existantes ({existingImages.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={imageUrl}
                            alt={`Voiture ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageDelete(imageUrl)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Supprimer cette image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Image */}
              <div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      uploadingImage
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-primary bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => !uploadingImage && document.getElementById('image-upload')?.click()}
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-primary mb-3"></div>
                        <p className="text-textSecondary font-semibold">Téléchargement en cours...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-textPrimary font-semibold mb-1">Ajouter une photo</p>
                        <p className="text-sm text-textSecondary">
                          Cliquez pour sélectionner une image (max 32 MB)
                        </p>
                        {!isEditMode && (
                          <p className="text-xs text-textSecondary mt-2">
                            💡 Vous pouvez ajouter des photos avant de sauvegarder
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Booking Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-textPrimary mb-6">Paramètres de réservation</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Caution (DH)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDepositAmount(val === '' ? 0 : parseFloat(val) || 0);
                    }}
                    min={0}
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    Location minimum (jours)
                  </label>
                  <input
                    type="number"
                    value={minRentalDays || 1}
                    onChange={(e) => setMinRentalDays(parseInt(e.target.value) || 1)}
                    min={1}
                    max={365}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBookable}
                      onChange={(e) => setIsBookable(e.target.checked)}
                      className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-semibold text-textPrimary">
                      Réservable en ligne
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Equipment/Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-textPrimary mb-2">Équipements et options</h2>
              <p className="text-sm text-textSecondary mb-6">
                Sélectionnez les équipements et options disponibles dans ce véhicule
              </p>

              {featureCategories.length > 0 ? (
                <div className="space-y-6">
                  {featureCategories.map(category => {
                    const categoryFeatures = allFeatures.filter(f => f.categoryId === category.id);
                    if (categoryFeatures.length === 0) return null;

                    return (
                      <div key={category.id}>
                        <h3 className="text-lg font-bold text-textPrimary mb-4 flex items-center">
                          {category.icon && (
                            <span className="material-icons mr-2" style={{ color: FlitCarColors.primary }}>
                              {category.icon}
                            </span>
                          )}
                          {category.name}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryFeatures.map(feature => (
                            <label
                              key={feature.id}
                              className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                selectedFeatures.includes(feature.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature.id)}
                                onChange={() => handleFeatureToggle(feature.id)}
                                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary mt-0.5"
                              />
                              <div className="ml-3 flex-1 min-w-0">
                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                  {feature.icon && (
                                    <span
                                      className="material-icons text-base"
                                      style={{ color: FlitCarColors.primary }}
                                    >
                                      {feature.icon}
                                    </span>
                                  )}
                                  <span className="font-semibold text-sm text-textPrimary">{feature.name}</span>
                                  {feature.isPremium && (
                                    <span className="px-2 py-0.5 bg-warning/20 text-warning text-xs font-bold rounded">
                                      Premium
                                    </span>
                                  )}
                                </div>
                                {feature.description && (
                                  <p className="text-xs text-textSecondary leading-relaxed">{feature.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-textSecondary text-center py-8">Chargement des équipements...</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/owner/cars')}
                className="px-6 py-3 bg-gray-100 text-textPrimary rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: FlitCarColors.primary }}
              >
                {submitting ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Ajouter la voiture'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CarFormPage;
