import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCar } from 'react-icons/fa6';
import { carsApi } from '../../services/api/carsApi';
import type { Car } from '../../types/car.types';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';
import { formatMAD } from '../../utils/currencyUtils';

const MyCarsPage: React.FC = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await carsApi.getOwnerCars();
      console.log('Owner cars:', data);
      setCars(data);
    } catch (error) {
      console.error('Error loading cars:', error);
      toast.error('Erreur lors du chargement des voitures');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette voiture?')) {
      return;
    }

    try {
      await carsApi.deleteCar(carId);
      toast.success('Voiture supprimée avec succès');
      loadCars();
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Erreur lors de la suppression');
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-textPrimary mb-2">Mes voitures</h1>
            <p className="text-textSecondary">Gérez votre flotte de véhicules</p>
          </div>
          <button
            onClick={() => navigate('/owner/cars/add')}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            <span>+</span>
            <span>Ajouter une voiture</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Total voitures</p>
                <p className="text-3xl font-black text-textPrimary">{cars.length}</p>
              </div>
              <div className="p-4 rounded-full" style={{ backgroundColor: `${FlitCarColors.primary}20` }}>
                <FaCar className="text-2xl" style={{ color: FlitCarColors.primary }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Disponibles</p>
                <p className="text-3xl font-black text-textPrimary">
                  {cars.filter((car) => car.availability?.isAvailable || car.availability?.is_available).length}
                </p>
              </div>
              <div className="p-4 rounded-full" style={{ backgroundColor: `${FlitCarColors.success}20` }}>
                <FaCar className="text-2xl" style={{ color: FlitCarColors.success }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary mb-1">Prix moyen/jour</p>
                <p className="text-3xl font-black text-textPrimary">
                  {cars.length > 0
                    ? Math.round(
                        cars.reduce((sum, car) => sum + (car.pricePerDay || car.price_per_day || 0), 0) /
                          cars.length
                      )
                    : 0}{' '}
                  DH
                </p>
              </div>
              <div className="p-4 rounded-full" style={{ backgroundColor: `${FlitCarColors.secondary}20` }}>
                <FaCar className="text-2xl" style={{ color: FlitCarColors.secondary }} />
              </div>
            </div>
          </div>
        </div>

        {/* Cars Grid */}
        {cars.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FaCar className="text-6xl text-textSecondary mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-textPrimary mb-2">Aucune voiture</h3>
            <p className="text-textSecondary mb-6">Commencez par ajouter votre première voiture</p>
            <button
              onClick={() => navigate('/owner/cars/add')}
              className="px-6 py-3 rounded-lg font-bold text-white"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              Ajouter une voiture
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Car Image */}
                <div className="relative h-48 bg-gray-100">
                  {(car.images && car.images.length > 0) || (car.image_urls && car.image_urls.length > 0) ? (
                    <img
                      src={(car.images && car.images[0]) || (car.image_urls && car.image_urls[0]) || ''}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaCar className="text-6xl text-textSecondary" />
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
                      car.availability?.isAvailable || car.availability?.is_available
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {car.availability?.isAvailable || car.availability?.is_available
                      ? 'Disponible'
                      : 'Indisponible'}
                  </div>
                </div>

                {/* Car Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-textPrimary mb-2">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-textSecondary mb-4">{car.year}</p>

                  {/* Price */}
                  <div className="flex items-baseline space-x-2 mb-6">
                    <span className="text-2xl font-black" style={{ color: FlitCarColors.primary }}>
                      {formatMAD(car.pricePerDay || car.price_per_day || 0)}
                    </span>
                    <span className="text-textSecondary">/jour</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/cars/${car.id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-textPrimary rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      <span>👁️</span>
                      <span>Voir</span>
                    </button>
                    <button
                      onClick={() => navigate(`/owner/cars/edit/${car.id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: FlitCarColors.primary }}
                    >
                      <span>✏️</span>
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCar(car.id)}
                      className="px-4 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: FlitCarColors.error }}
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCarsPage;
