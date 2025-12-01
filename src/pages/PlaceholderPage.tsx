import React from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import { FlitCarColors } from '../utils/constants';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: FlitCarColors.primary + '20' }}>
            <span className="text-4xl">🚧</span>
          </div>
          <h2 className="text-2xl font-bold text-textPrimary mb-2">{title}</h2>
          <p className="text-textSecondary mb-6">{description}</p>
          <p className="text-sm text-textSecondary">Cette fonctionnalité sera bientôt disponible.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlaceholderPage;
