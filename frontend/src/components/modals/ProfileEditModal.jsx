import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, GraduationCap, Loader } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { toast } from 'sonner';
import api from '../../api/axios';
import logger from '../../utils/logger';

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    examType: ''
  });

  // Exam types
  const examTypes = [
    { value: 'LGS', label: 'LGS' },
    { value: 'TYT', label: 'TYT' },
    { value: 'AYT', label: 'AYT' },
    { value: 'YKS_SAYISAL', label: 'YKS Sayısal' },
    { value: 'YKS_ESIT_AGIRLIK', label: 'YKS Eşit Ağırlık' },
    { value: 'YKS_SOZEL', label: 'YKS Sözel' }
  ];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        examType: user.examType || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email) {
      toast.error('Ad ve email gereklidir');
      return;
    }

    // Password validation if changing password
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        toast.error('Şifre değiştirmek için mevcut şifrenizi girin');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Yeni şifreler eşleşmiyor');
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error('Yeni şifre en az 6 karakter olmalı');
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare update payload
      const updatePayload = {
        fullName: formData.fullName,
        email: formData.email,
        examType: formData.examType
      };

      // Add password fields if changing password
      if (formData.newPassword && formData.currentPassword) {
        updatePayload.currentPassword = formData.currentPassword;
        updatePayload.newPassword = formData.newPassword;
      }

      // Call API to update profile
      const response = await api.put('/auth/profile', updatePayload);

      // Update local user data
      const updatedUser = response.data.user;
      updateUser(updatedUser);

      toast.success('Profil güncellendi', {
        description: 'Bilgileriniz başarıyla kaydedildi'
      });

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      onClose();
    } catch (error) {
      // Axios interceptor will show the error toast
      logger.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              Profili Düzenle
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Ad Soyad
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Sınav Türü
              </label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seçiniz</option>
                {examTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                <Lock className="w-4 h-4 inline mr-2" />
                Şifre Değiştir (İsteğe Bağlı)
              </p>

              {/* Current Password */}
              <div className="mb-3">
                <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Şifre değiştirmek için girin"
                />
              </div>

              {/* New Password */}
              <div className="mb-3">
                <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Yeni şifre (en az 6 karakter)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Yeni şifre tekrar"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileEditModal;
