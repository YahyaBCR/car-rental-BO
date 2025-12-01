import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { FlitCarColors } from '../../utils/constants';
import toast from 'react-hot-toast';
import { getInitials } from '../../utils/formatters';

const Header: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - Breadcrumb will go here in future */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-textPrimary">
            Bienvenue, {user?.first_name}!
          </h2>
        </div>

        {/* Right - User Profile */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: FlitCarColors.primary }}
            >
              {user && getInitials(user.first_name, user.last_name)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-textPrimary">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-textSecondary">{user?.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: FlitCarColors.error }}
          >
            <FaSignOutAlt />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
