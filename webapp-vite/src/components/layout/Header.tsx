/**
 * Header Component - Responsive with Mobile Menu
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaUser, FaRightFromBracket, FaBars, FaXmark, FaMagnifyingGlass, FaCalendarCheck, FaGear, FaCircleQuestion, FaFileLines, FaChevronRight } from 'react-icons/fa6';
import { FaHeart, FaBell } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/routes';
import { FlitCarColors } from '../../constants/colors';
import { CurrencySelector } from '../currency/CurrencySelector';
import LanguageSwitcher from '../LanguageSwitcher';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate(ROUTES.HOME);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="flex items-center space-x-2 group">
              <img
                src="/gemini.png"
                alt="KeyGo Logo"
                className="h-36 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to={ROUTES.SEARCH}
                className="text-textSecondary hover:text-primary font-medium transition-colors"
              >
                {t('nav.search')}
              </Link>
              {isAuthenticated && user?.role === 'owner' && (
                <Link
                  to={ROUTES.OWNER_DASHBOARD}
                  className="text-textSecondary hover:text-primary font-medium transition-colors"
                >
                  {t('nav.myCars')}
                </Link>
              )}
              {isAuthenticated && user?.role === 'client' && (
                <Link
                  to={ROUTES.CLIENT_BOOKINGS}
                  className="text-textSecondary hover:text-primary font-medium transition-colors"
                >
                  {t('nav.myBookings')}
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/favorites"
                  className="text-textSecondary hover:text-primary font-medium transition-colors"
                >
                  {t('nav.favorites')}
                </Link>
              )}
            </nav>

            {/* Desktop User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Currency Selector */}
              <CurrencySelector />

              {isAuthenticated ? (
                <>
                  {/* Notifications Icon */}
                  <button
                    onClick={() => navigate('/notifications')}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={t('nav.notifications')}
                  >
                    <FaBell className="text-xl text-textSecondary" />
                    {/* Notification badge - can be dynamic later */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  <Link
                    to={ROUTES.PROFILE}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaUser className="text-primary text-sm" />
                      </div>
                    )}
                    <span className="font-medium text-textPrimary">
                      {user?.firstName}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={t('nav.logout')}
                  >
                    <FaRightFromBracket className="text-textSecondary hover:text-error" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={ROUTES.LOGIN}
                    className="px-4 py-2 text-textPrimary font-medium hover:text-primary transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="px-6 py-2 rounded-xl font-semibold text-white transition-all hover:shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.gradientEnd})`,
                    }}
                  >
                    {t('nav.signup')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <FaXmark className="text-2xl text-gray-700" />
              ) : (
                <FaBars className="text-2xl text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-full bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header - Compact */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{t('nav.menu')}</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaXmark className="text-lg text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section - Compact & Clickable */}
          {isAuthenticated && user && (
            <button
              onClick={() => handleNavigate(ROUTES.PROFILE)}
              className="w-full px-4 py-4 border-b border-gray-200 flex items-center hover:bg-gray-50 transition-colors text-left"
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${FlitCarColors.primary}15` }}
                >
                  <FaUser style={{ color: FlitCarColors.primary }} className="text-lg" />
                </div>
              )}
              <div className="ml-3 flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-gray-500 truncate">{user.email}</div>
              </div>
              <FaChevronRight className="text-gray-400 flex-shrink-0" />
            </button>
          )}

          {/* Section: ACTIVITÉ */}
          <div className="pt-4">
            <div className="px-4 pb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.sections.activity')}</span>
            </div>
            <nav className="space-y-1 px-2">
              <button
                onClick={() => handleNavigate(ROUTES.SEARCH)}
                className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                >
                  <FaMagnifyingGlass style={{ color: FlitCarColors.primary }} className="text-sm" />
                </div>
                <span className="ml-3 font-medium text-gray-900">{t('nav.searchCar')}</span>
              </button>

              {isAuthenticated && user?.role === 'owner' && (
                <button
                  onClick={() => handleNavigate(ROUTES.OWNER_DASHBOARD)}
                  className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                  >
                    <FaCar style={{ color: FlitCarColors.primary }} className="text-sm" />
                  </div>
                  <span className="ml-3 font-medium text-gray-900">{t('nav.myCars')}</span>
                </button>
              )}

              {isAuthenticated && user?.role === 'client' && (
                <button
                  onClick={() => handleNavigate(ROUTES.CLIENT_BOOKINGS)}
                  className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                  >
                    <FaCalendarCheck style={{ color: FlitCarColors.primary }} className="text-sm" />
                  </div>
                  <span className="ml-3 font-medium text-gray-900">{t('nav.myBookings')}</span>
                </button>
              )}

              {isAuthenticated && (
                <>
                  <button
                    onClick={() => handleNavigate('/favorites')}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                    >
                      <FaHeart style={{ color: FlitCarColors.primary }} className="text-sm" />
                    </div>
                    <span className="ml-3 font-medium text-gray-900">{t('nav.myFavorites')}</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('/notifications')}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                      style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                    >
                      <FaBell style={{ color: FlitCarColors.primary }} className="text-sm" />
                    </div>
                    <span className="ml-3 font-medium text-gray-900 flex-1">{t('nav.notifications')}</span>
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Section: PARAMÈTRES */}
          <div className="pt-4 border-t border-gray-100 mt-4">
            <div className="px-4 pb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.sections.settings')}</span>
            </div>
            <nav className="space-y-1 px-2">
              <button
                onClick={() => handleNavigate('/settings')}
                className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                >
                  <FaGear style={{ color: FlitCarColors.primary }} className="text-sm" />
                </div>
                <span className="ml-3 font-medium text-gray-900 flex-1">{t('nav.settings')}</span>
                <FaChevronRight className="text-gray-400 text-xs" />
              </button>
            </nav>
          </div>

          {/* Section: AIDE */}
          <div className="pt-4 border-t border-gray-100 mt-4">
            <div className="px-4 pb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.sections.help')}</span>
            </div>
            <nav className="space-y-1 px-2">
              <button
                onClick={() => handleNavigate('/support/tickets')}
                className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                >
                  <FaCircleQuestion style={{ color: FlitCarColors.primary }} className="text-sm" />
                </div>
                <span className="ml-3 font-medium text-gray-900">{t('nav.support')}</span>
              </button>

              <button
                onClick={() => handleNavigate(ROUTES.CGU)}
                className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${FlitCarColors.primary}10` }}
                >
                  <FaFileLines style={{ color: FlitCarColors.primary }} className="text-sm" />
                </div>
                <span className="ml-3 font-medium text-gray-900">{t('nav.terms')}</span>
              </button>
            </nav>
          </div>

          {/* Spacer for non-authenticated users */}
          {!isAuthenticated && <div className="h-4"></div>}
        </div>

        {/* Bottom Section - Fixed */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-4">
          {isAuthenticated ? (
            <>
              <div className="px-2 pb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('nav.sections.account')}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
                  <FaRightFromBracket className="text-red-500 text-sm" />
                </div>
                <span className="ml-3 font-medium text-red-600">{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => handleNavigate(ROUTES.LOGIN)}
                className="w-full py-2.5 px-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-900 font-medium text-sm"
              >
                {t('nav.login')}
              </button>
              <button
                onClick={() => handleNavigate(ROUTES.REGISTER)}
                className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-all hover:shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.gradientEnd})`,
                }}
              >
                {t('nav.signup')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
