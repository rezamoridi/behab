// src/features/settings/components/ProfileSettings.jsx
import { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../../../services/api/apiClient';
import { useToast } from '../../../shared/components/Toast/ToastProvider';

const ProfileSettings = ({
  profile,
  onUpdateProfile,
  onChangePassword,
  isLoading,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    username: '',
    phone_number: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // ── OTP state ──
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [isTogglingOtp, setIsTogglingOtp] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        fname: profile.fname || '',
        lname: profile.lname || '',
        username: profile.username || '',
        phone_number: profile.phone_number || '',
      });
      setOtpEnabled(profile.otp_enabled ?? false);
    }
  }, [profile]);

  // ============================================
  // Handlers
  // ============================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.fname.trim()) newErrors.fname = 'نام الزامی است';
    if (!formData.lname.trim())
      newErrors.lname = 'نام خانوادگی الزامی است';
    if (
      formData.phone_number &&
      !/^09\d{9}$/.test(formData.phone_number)
    ) {
      newErrors.phone_number = 'شماره تماس نامعتبر است';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.current_password)
      newErrors.current_password = 'رمز فعلی الزامی است';
    if (passwordData.new_password.length < 8)
      newErrors.new_password = 'رمز جدید باید حداقل ۸ کاراکتر باشد';
    if (passwordData.new_password !== passwordData.confirm_password)
      newErrors.confirm_password = 'رمزها مطابقت ندارند';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setIsSubmittingProfile(true);
    try {
      await onUpdateProfile(formData);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsSubmittingPassword(true);
    try {
      const { current_password, new_password } = passwordData;
      await onChangePassword({ current_password, new_password });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // ============================================
  // ✅ Toggle OTP
  // ============================================
  const handleToggleOtp = async () => {
    // چک شماره تلفن قبل از فعال‌سازی
    if (!otpEnabled && !formData.phone_number) {
      toast.warning(
        'برای فعال‌سازی OTP، ابتدا شماره تلفن خود را ثبت کنید',
        'توجه',
      );
      return;
    }

    if (!otpEnabled && !/^09\d{9}$/.test(formData.phone_number)) {
      toast.warning(
        'شماره تلفن معتبر نیست. ابتدا شماره را اصلاح کنید.',
        'توجه',
      );
      return;
    }

    // تأیید کاربر
    const action = otpEnabled ? 'غیرفعال' : 'فعال';
    const ok = window.confirm(
      `آیا از ${action} کردن تایید دو مرحله‌ای اطمینان دارید؟\n\n` +
        (otpEnabled
          ? 'در این حالت، ورود شما فقط با رمز عبور خواهد بود.'
          : `در این حالت، کد تایید به شماره ${formData.phone_number} ارسال می‌شود.`),
    );
    if (!ok) return;

    setIsTogglingOtp(true);
    try {
      const response = await apiClient.put('/users/me/otp', {
        enabled: !otpEnabled,
      });
      setOtpEnabled(response.data.otp_enabled);
      toast.success(
        `تایید دو مرحله‌ای ${action} شد`,
        'ذخیره شد',
      );
    } catch (err) {
      toast.error(
        err.response?.data?.detail || 'خطا در تغییر تنظیمات',
        'خطا',
      );
    } finally {
      setIsTogglingOtp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Profile Form */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <User size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            اطلاعات حساب کاربری
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              نام
            </label>
            <input
              type="text"
              name="fname"
              value={formData.fname}
              onChange={handleProfileChange}
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${errors.fname ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.fname && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.fname}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              نام خانوادگی
            </label>
            <input
              type="text"
              name="lname"
              value={formData.lname}
              onChange={handleProfileChange}
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${errors.lname ? 'border-red-500' : 'border-gray-300'}
              `}
            />
            {errors.lname && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.lname}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            نام کاربری
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            نام کاربری قابل تغییر نیست
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            شماره تماس
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleProfileChange}
            placeholder="09..."
            className={`
              w-full px-3.5 py-2.5 rounded-lg border text-sm
              focus:border-primary-500 focus:ring-2 focus:ring-primary-200
              outline-none transition-all
              ${errors.phone_number ? 'border-red-500' : 'border-gray-300'}
            `}
            style={{ direction: 'ltr', textAlign: 'right' }}
          />
          {errors.phone_number && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.phone_number}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmittingProfile}
          className="
            px-6 py-2.5 bg-primary-600 text-white rounded-lg
            text-sm font-semibold
            hover:bg-primary-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmittingProfile ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
      </form>

      {/* ✅ OTP Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Shield size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            امنیت حساب
          </h3>
        </div>

        <div
          className={`
            flex items-start justify-between gap-4 p-4 rounded-lg border-2 transition-colors
            ${
              otpEnabled
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-gray-50 border-gray-200'
            }
          `}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${otpEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}
              `}
            >
              {otpEnabled ? (
                <CheckCircle2 size={18} strokeWidth={2.4} />
              ) : (
                <Shield size={18} strokeWidth={2.4} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">
                تایید دو مرحله‌ای (OTP)
              </div>
              <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                {otpEnabled
                  ? 'در هر ورود، کد تایید به شماره موبایل شما ارسال می‌شود.'
                  : 'با فعال‌سازی، امنیت حساب شما به میزان قابل توجهی افزایش می‌یابد.'}
              </div>
              {!otpEnabled && !formData.phone_number && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
                  ⚠️ ابتدا شماره تلفن خود را ثبت کنید
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleOtp}
            disabled={isTogglingOtp}
            className={`
              relative inline-flex items-center h-6 w-11 rounded-full
              transition-colors duration-200 flex-shrink-0
              disabled:opacity-50 disabled:cursor-wait
              ${otpEnabled ? 'bg-emerald-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block w-5 h-5 bg-white rounded-full shadow
                transform transition-transform duration-200
                ${otpEnabled ? '-translate-x-5' : '-translate-x-0.5'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Password Form */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Lock size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            تغییر رمز عبور
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            رمز عبور فعلی
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              className={`
                w-full px-3.5 py-2.5 pl-10 rounded-lg border text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${errors.current_password ? 'border-red-500' : 'border-gray-300'}
              `}
              style={{ direction: 'ltr' }}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.current_password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.current_password}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رمز عبور جدید
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className={`
                  w-full px-3.5 py-2.5 pl-10 rounded-lg border text-sm
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                  outline-none transition-all
                  ${errors.new_password ? 'border-red-500' : 'border-gray-300'}
                `}
                style={{ direction: 'ltr' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.new_password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              تکرار رمز عبور جدید
            </label>
            <input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'}
              `}
              style={{ direction: 'ltr' }}
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirm_password}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmittingPassword}
          className="
            px-6 py-2.5 bg-blue-600 text-white rounded-lg
            text-sm font-semibold
            hover:bg-blue-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmittingPassword ? 'در حال تغییر...' : 'تغییر رمز عبور'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;