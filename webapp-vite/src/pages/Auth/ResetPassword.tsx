/**
 * Reset Password Page
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaCircleCheck } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../services/api/authApi';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error(t('auth.errors.fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('auth.errors.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('auth.errors.passwordMinLength'));
      return;
    }

    if (!token) {
      toast.error(t('auth.errors.tokenMissing'));
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.resetPassword(token, newPassword);
      toast.success(response.message);
      setResetSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || t('auth.errors.resetPasswordError'));
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${FlitCarColors.success}20` }}
          >
            <FaCircleCheck
              className="text-3xl"
              style={{ color: FlitCarColors.success }}
            />
          </div>
          <h1 className="text-2xl font-black text-textPrimary mb-2">
            {t('auth.resetPassword.success.title')}
          </h1>
          <p className="text-textSecondary mb-6">
            {t('auth.resetPassword.success.message')}
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-md"
            style={{
              background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.primary}DD)`,
            }}
          >
            {t('auth.resetPassword.success.loginNow')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-textPrimary mb-2">
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-textSecondary">
            {t('auth.resetPassword.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              {t('auth.resetPassword.newPassword')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('auth.resetPassword.placeholders.newPassword')}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              {t('auth.resetPassword.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.resetPassword.placeholders.confirmPassword')}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-textPrimary mb-2">
              {t('auth.resetPassword.requirements.title')}
            </p>
            <ul className="text-xs text-textSecondary space-y-1">
              <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                • {t('auth.resetPassword.requirements.minLength')}
              </li>
              <li className={newPassword === confirmPassword && newPassword ? 'text-green-600' : ''}>
                • {t('auth.resetPassword.requirements.matching')}
              </li>
            </ul>
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
            {loading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.resetButton')}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-textSecondary hover:text-primary transition-colors font-medium text-sm"
            >
              {t('auth.resetPassword.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
