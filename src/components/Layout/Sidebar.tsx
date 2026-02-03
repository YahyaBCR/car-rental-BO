import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaCar,
  FaCalendarCheck,
  FaDollarSign,
  FaStar,
  FaComments,
  FaPlane,
  FaCity,
  FaCog,
  FaChartLine,
  FaTicketAlt,
  FaFileAlt,
  FaUserShield,
  FaUser,
  FaShieldAlt
} from 'react-icons/fa';
import { FlitCarColors } from '../../utils/constants';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Utilisateurs', path: '/users', icon: <FaUsers /> },
    { name: 'Voitures', path: '/cars', icon: <FaCar /> },
    { name: 'Réservations', path: '/bookings', icon: <FaCalendarCheck /> },
    { name: 'Financier', path: '/financial', icon: <FaDollarSign /> },
    { name: 'Avis', path: '/reviews', icon: <FaStar /> },
    { name: 'Messagerie', path: '/messaging', icon: <FaComments /> },
    { name: 'Aéroports', path: '/airports', icon: <FaPlane /> },
    { name: 'Villes', path: '/cities', icon: <FaCity /> },
    { name: 'Analytics', path: '/analytics', icon: <FaChartLine /> },
    { name: 'Consentement', path: '/consent/config', icon: <FaShieldAlt /> },
    { name: 'Support', path: '/support', icon: <FaTicketAlt /> },
    { name: 'Logs', path: '/logs', icon: <FaFileAlt /> },
    { name: 'Administrateurs', path: '/admin-management', icon: <FaUserShield /> },
    { name: 'Param\u00e8tres', path: '/settings', icon: <FaCog /> },
  ];

  const isActive = (path: string) => location.pathname === path || (path.includes('/consent') && location.pathname.startsWith('/consent'));

  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl"
            style={{ backgroundColor: FlitCarColors.primary }}
          >
            F
          </div>
          <div>
            <h1 className="text-xl font-bold text-textPrimary">FlitCar</h1>
            <p className="text-xs text-textSecondary">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive(item.path)
                    ? 'text-white shadow-md'
                    : 'text-textSecondary hover:bg-gray-50 hover:text-textPrimary'
                  }
                `}
                style={isActive(item.path) ? { backgroundColor: FlitCarColors.primary } : {}}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <p className="text-xs text-center text-textSecondary">
          © 2025 FlitCar Admin
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
