/**
 * Login Page - Apple Style
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { login, clearError } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/routes';
import { FlitCarColors } from '../../constants/colors';
import type { LoginCredentials } from '../../types/auth.types';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [blockedMessage, setBlockedMessage] = React.useState<string | null>(null);

  const loginSchema = Yup.object().shape({
    email: Yup.string().email(t('auth.login.emailInvalid')).required(t('auth.login.emailRequired')),
    password: Yup.string().min(6, t('auth.login.passwordMin')).required(t('auth.login.passwordRequired')),
  });

  useEffect(() => {
    // Check for blocked account message
    const blockedReason = localStorage.getItem('blocked_reason');
    if (blockedReason) {
      setBlockedMessage(blockedReason);
      localStorage.removeItem('blocked_reason');
    }

    // Only cleanup errors, don't redirect here
    // Redirection is handled in handleSubmit after successful login
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (values: LoginCredentials) => {
    const result = await dispatch(login(values));

    // Check if login was successful
    if (login.fulfilled.match(result)) {
      // Get user role
      const user = result.payload.user;

      // Check for saved redirect data
      const savedRedirectData = localStorage.getItem('flitcar_redirect_data');

      if (savedRedirectData) {
        try {
          const redirectData = JSON.parse(savedRedirectData);
          localStorage.removeItem('flitcar_redirect_data');
          navigate(redirectData.returnUrl, { state: redirectData.state });
          return;
        } catch (error) {
          console.error('Error parsing redirect data:', error);
        }
      }

      // Default redirection based on role
      if (user.role === 'owner') {
        navigate('/dashboard');
      } else {
        navigate('/client/home');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 flex items-center justify-center mb-4">
            <img
              src="/gemini.png"
              alt="FlitCar Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-black text-textPrimary">{t('auth.login.title')}</h1>
          <p className="text-textSecondary mt-2">{t('auth.login.subtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {/* Blocked account message */}
          {blockedMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-500">
              <p className="text-red-700 text-sm font-bold mb-2">⚠️ {t('auth.login.accountBlocked')}</p>
              <p className="text-red-600 text-sm">{blockedMessage}</p>
              <p className="text-red-600 text-xs mt-2">{t('auth.login.contactAdmin')}</p>
            </div>
          )}

          {/* Login error message */}
          {error && !blockedMessage && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('auth.login.email')}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t('auth.login.emailPlaceholder')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-error" />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('auth.login.password')}
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-sm text-error" />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.gradientEnd})`,
                  }}
                >
                  {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
                </button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-textSecondary hover:text-primary transition-colors"
                  >
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
              </Form>
            )}
          </Formik>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-textSecondary text-sm">
              {t('auth.login.noAccount')}{' '}
              <Link to={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
                {t('auth.login.signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
