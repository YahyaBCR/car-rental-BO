import React, { useState, useRef } from 'react';
import { FaUser, FaEnvelope, FaLock, FaPencil, FaFloppyDisk, FaXmark, FaCamera } from 'react-icons/fa6';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { FlitCarColors } from '../../constants/colors';
import { toast } from 'react-toastify';
import { authApi } from '../../services/api/authApi';
import { setUser } from '../../store/slices/authSlice';
import PhoneInput from '../../components/common/PhoneInput';
import { imageUploadService } from '../../services/imageUpload';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = imageUploadService.validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      setUploadingPhoto(true);
      toast.info(t('profile.photo.uploading'));

      // Upload to ImgBB
      const imageUrl = await imageUploadService.uploadImage(file);

      // Update profile picture in backend
      const updatedUser = await authApi.uploadProfilePicture(imageUrl);

      // Update Redux state
      dispatch(setUser(updatedUser));

      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success(t('profile.photo.uploadSuccess'));
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(error.message || t('profile.photo.uploadError'));
    } finally {
      setUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName) {
      toast.error(t('profile.fillRequired'));
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await authApi.updateProfile({
        firstName,
        lastName,
        phone: phone || undefined
      });

      // Update Redux state with new user data
      dispatch(setUser(updatedUser));

      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success(t('profile.updateSuccess'));
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('profile.fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('profile.password.mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('profile.password.minLength'));
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({
        currentPassword,
        newPassword
      });

      toast.success(t('profile.password.changeSuccess'));
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || t('profile.updateError');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-textPrimary mb-2">{t('profile.title')}</h1>
          <p className="text-textSecondary">{t('profile.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Profile Picture Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-5xl text-gray-400" />
                  )}
                </div>
                <button
                  onClick={handlePhotoClick}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  style={{ backgroundColor: FlitCarColors.primary }}
                  title={t('profile.photo.change')}
                >
                  <FaCamera className="text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <h3 className="mt-4 text-xl font-bold text-textPrimary">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-textSecondary">{user?.email}</p>
              {uploadingPhoto && (
                <p className="mt-2 text-sm" style={{ color: FlitCarColors.primary }}>
                  {t('profile.photo.uploading')}
                </p>
              )}
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-textPrimary">{t('profile.personalInfo.title')}</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  <FaPencil />
                  <span>{t('common.edit')}</span>
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('profile.personalInfo.firstName')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('profile.personalInfo.lastName')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('profile.personalInfo.email')} *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-textPrimary mb-2">
                    {t('profile.personalInfo.phone')}
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    disabled={!isEditing}
                    placeholder="6XX XXX XXX"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-bold text-white disabled:opacity-50"
                    style={{ backgroundColor: FlitCarColors.success }}
                  >
                    <FaFloppyDisk />
                    <span>{loading ? t('profile.saving') : t('common.save')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-bold border-2 border-gray-300 text-textPrimary hover:bg-gray-50 transition-colors"
                  >
                    <FaXmark />
                    <span>{t('common.cancel')}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-textPrimary">{t('profile.password.title')}</h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: FlitCarColors.primary }}
                >
                  <FaLock />
                  <span>{t('profile.password.change')}</span>
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('profile.password.current')} *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('profile.password.new')} *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-2">
                      {t('profile.password.confirm')} *
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-bold text-white disabled:opacity-50"
                    style={{ backgroundColor: FlitCarColors.success }}
                  >
                    <FaFloppyDisk />
                    <span>{loading ? t('profile.saving') : t('profile.password.change')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-bold border-2 border-gray-300 text-textPrimary hover:bg-gray-50 transition-colors"
                  >
                    <FaXmark />
                    <span>{t('common.cancel')}</span>
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-textSecondary">
                {t('profile.password.securityTip')}
              </p>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-textPrimary mb-6">{t('profile.accountInfo.title')}</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-textSecondary">{t('profile.accountInfo.accountType')}</span>
                <span className="font-semibold text-textPrimary capitalize">
                  {user?.role || 'Client'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-textSecondary">{t('profile.accountInfo.memberSince')}</span>
                <span className="font-semibold text-textPrimary">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-textSecondary">{t('profile.accountInfo.accountStatus')}</span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: FlitCarColors.success }}
                >
                  {t('profile.accountInfo.active')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
