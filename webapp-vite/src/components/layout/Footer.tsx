/**
 * Footer Component - Apple Style (Compact)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../constants/routes';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-4">
          <img
            src="/gemini.png"
            alt="KeyGo Logo"
            className="h-36 w-auto object-contain"
          />
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-textSecondary mb-4">
          <Link to={ROUTES.SEARCH} className="hover:text-primary transition-colors">
            {t('footer.search')}
          </Link>
          <span>•</span>
          <Link to={ROUTES.OWNER_DASHBOARD} className="hover:text-primary transition-colors">
            {t('footer.becomeOwner')}
          </Link>
          <span>•</span>
          <Link to={ROUTES.ABOUT} className="hover:text-primary transition-colors">
            {t('footer.about')}
          </Link>
          <span>•</span>
          <Link to={ROUTES.HOME} className="hover:text-primary transition-colors">
            {t('footer.contact')}
          </Link>
          <span>•</span>
          <Link to={ROUTES.CGU} className="hover:text-primary transition-colors">
            {t('footer.terms')}
          </Link>
          <span>•</span>
          <Link to={ROUTES.PRIVACY} className="hover:text-primary transition-colors">
            {t('footer.privacy')}
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center space-x-4 mb-4">
          <a
            href="#"
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary flex items-center justify-center transition-all group"
            aria-label="Facebook"
          >
            <FaFacebookF className="text-textSecondary group-hover:text-white text-sm" />
          </a>
          <a
            href="#"
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary flex items-center justify-center transition-all group"
            aria-label="Twitter"
          >
            <FaTwitter className="text-textSecondary group-hover:text-white text-sm" />
          </a>
          <a
            href="#"
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary flex items-center justify-center transition-all group"
            aria-label="Instagram"
          >
            <FaInstagram className="text-textSecondary group-hover:text-white text-sm" />
          </a>
          <a
            href="#"
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-primary flex items-center justify-center transition-all group"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn className="text-textSecondary group-hover:text-white text-sm" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-sm text-textSecondary">
          © {currentYear} KeyGo. {t('footer.tagline')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
