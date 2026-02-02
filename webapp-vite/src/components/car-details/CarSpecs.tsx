import React from 'react';
import { FaUsers, FaGasPump, FaGear, FaCalendar, FaPalette, FaCar } from 'react-icons/fa6';
import type { Car } from '../../types/car.types';
import { FlitCarColors } from '../../constants/colors';

interface CarSpecsProps {
  car: Car;
}

const CarSpecs: React.FC<CarSpecsProps> = ({ car }) => {
  const specs = [
    {
      icon: <FaCar className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Marque',
      value: car.brand,
    },
    {
      icon: <FaCar className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Modèle',
      value: car.model,
    },
    {
      icon: <FaCalendar className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Année',
      value: car.year.toString(),
    },
    {
      icon: <FaGear className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Transmission',
      value: car.transmission || 'N/A',
    },
    {
      icon: <FaGasPump className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Carburant',
      value: car.fuelType || car.fuel_type || 'N/A',
    },
    {
      icon: <FaUsers className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Places',
      value: car.seats ? `${car.seats} places` : 'N/A',
    },
    {
      icon: <FaPalette className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Couleur',
      value: car.color || 'N/A',
    },
    {
      icon: <FaCar className="text-2xl" style={{ color: FlitCarColors.primary }} />,
      label: 'Type',
      value: car.type || 'N/A',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-textPrimary mb-6">Caractéristiques</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {specs.map((spec, index) => (
          <div key={index} className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-gray-50 rounded-xl">{spec.icon}</div>
            <div>
              <p className="text-xs text-textSecondary uppercase tracking-wide">{spec.label}</p>
              <p className="text-sm font-semibold text-textPrimary capitalize">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarSpecs;
