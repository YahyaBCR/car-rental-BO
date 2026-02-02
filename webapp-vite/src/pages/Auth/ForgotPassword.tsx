/**
 * Forgot Password Page
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api/authApi';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t('auth.errors.enterEmail'));
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.forgotPassword(email);

      toast.success(response.message);
      setEmailSent(true);

      // In development, we get the token back
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || t('auth.errors.sendLinkError'));
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${FlitCarColors.success}20` }}
            >
              <FaEnvelope
                className="text-3xl"
                style={{ color: FlitCarColors.success }}
              />
            </div>
            <h1 className="text-2xl font-black text-textPrimary mb-2">
              {t('auth.forgotPassword.emailSent')}
            </h1>
            <p className="text-textSecondary">
              {t('auth.forgotPassword.emailSentMessage', { email: email })}
            </p>
          </div>

          {resetToken && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                {t('auth.forgotPassword.devMode.title')}
              </p>
              <p className="text-xs text-yellow-700 mb-2">
                {t('auth.forgotPassword.devMode.tokenLabel')}
              </p>
              <code className="block p-2 bg-white rounded text-xs break-all font-mono">
                {resetToken}
              </code>
              <Link
                to={`/reset-password/${resetToken}`}
                className="mt-2 block text-center text-sm font-semibold hover:underline"
                style={{ color: FlitCarColors.primary }}
              >
                {t('auth.forgotPassword.devMode.resetLink')}
              </Link>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 rounded-xl font-semibold text-white text-center transition-all hover:shadow-md"
              style={{
                background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primary}DD)`,
              }}
            >
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-textPrimary mb-2">
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="text-textSecondary">
            {t('auth.forgotPassword.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              {t('auth.forgotPassword.email')}
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primary}DD)`,
            }}
          >
            {loading ? t('auth.forgotPassword.sendingLink') : t('auth.forgotPassword.sendLink')}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center space-x-2 text-textSecondary hover:text-primary transition-colors font-medium"
          >
            <FaArrowLeft />
            <span>{t('auth.forgotPassword.backToLogin')}</span>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
