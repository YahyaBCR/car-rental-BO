/**
 * Register Page - Apple Style
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { register, clearError } from '../../store/slices/authSlice';
import { ROUTES } from '../../constants/routes';
import { FlitCarColors } from '../../constants/colors';
import type { RegisterData } from '../../types/auth.types';
import PhoneInput from '../../components/common/PhoneInput';
import CountrySelect from '../../components/common/CountrySelect';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const registerSchema = Yup.object().shape({
    firstName: Yup.string().required(t('auth.errors.firstNameRequired')),
    lastName: Yup.string().required(t('auth.errors.lastNameRequired')),
    email: Yup.string().email(t('auth.errors.invalidEmail')).required(t('auth.errors.emailRequired')),
    phone: Yup.string().required(t('auth.errors.phoneRequired')),
    country: Yup.string().required(t('auth.errors.countryRequired')),
    password: Yup.string().min(6, t('auth.errors.passwordMinLength')).required(t('auth.errors.passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('auth.errors.passwordMismatch'))
      .required(t('auth.errors.confirmPasswordRequired')),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (values: RegisterData) => {
    // Force role to client (owner registration is done via backoffice only)
    const registerData = { ...values, role: 'client' as 'client' | 'owner' };
    const result = await dispatch(register(registerData));

    // Check if registration was successful
    if (register.fulfilled.match(result)) {
      // Redirect to client home
      navigate('/client/home');
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
          <h1 className="text-3xl font-black text-textPrimary">{t('auth.signup.title')}</h1>
          <p className="text-textSecondary mt-2">{t('auth.signup.subtitle')}</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              country: '',
              password: '',
              confirmPassword: '',
              role: 'client' as const,
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue, errors, touched }) => (
              <Form className="space-y-4">{/* Role removed - Client only registration */}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('auth.signup.firstName')}
                    </label>
                    <Field
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder={t('auth.signup.placeholders.firstName')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <ErrorMessage name="firstName" component="p" className="mt-1 text-xs text-error" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('auth.signup.lastName')}
                    </label>
                    <Field
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder={t('auth.signup.placeholders.lastName')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <ErrorMessage name="lastName" component="p" className="mt-1 text-xs text-error" />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('auth.signup.email')}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t('auth.signup.placeholders.email')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1 text-xs text-error" />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('auth.signup.phone')}
                  </label>
                  <PhoneInput
                    value={values.phone}
                    onChange={(value) => setFieldValue('phone', value)}
                    placeholder={t('auth.signup.placeholders.phone')}
                    error={touched.phone && errors.phone ? errors.phone : undefined}
                  />
                </div>

                {/* Country Field */}
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('auth.signup.countryOfResidence')}
                  </label>
                  <CountrySelect
                    value={values.country}
                    onChange={(value) => setFieldValue('country', value)}
                    error={touched.country && errors.country ? errors.country : undefined}
                  />
                </div>

                {/* Password Fields */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('auth.signup.password')}
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      placeholder={t('auth.signup.placeholders.password')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-xs text-error" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('auth.signup.confirmPassword')}
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    <Field
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder={t('auth.signup.placeholders.password')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-xs text-error" />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  style={{
                    background: `linear-gradient(135deg, ${FlitCarColors.primary}, ${FlitCarColors.gradientEnd})`,
                  }}
                >
                  {isLoading ? t('auth.signup.signingUp') : t('auth.signup.signupButton')}
                </button>
              </Form>
            )}
          </Formik>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-textSecondary text-sm">
              {t('auth.signup.hasAccount')}{' '}
              <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
                {t('auth.signup.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
