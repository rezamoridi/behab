// src/features/farm-registration/forms/sections/FarmerSection.jsx
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  AlertCircle,
  User,
  CreditCard,
  Phone,
  Loader2,
  UserPlus,
  UserCheck,
  XCircle,
} from 'lucide-react';

import { farmerApi } from '../../../../services/api/farmerApi';
import {
  NATIONAL_ID_REGEX,
  PHONE_REGEX,
} from '../../schemas/farmSchema';
import {
  toPersianDigits,
  toEnglishDigits,
  onlyDigits,
} from '../../../../shared/utils/persianNumbers';

const DEBOUNCE_MS = 500;

// ============================================================
// توابع کمکی — نمایش فارسی، ذخیره انگلیسی
// ============================================================
const isNationalIdValid = (value) =>
  NATIONAL_ID_REGEX.test(String(value || ''));
const isPhoneValid = (value) => PHONE_REGEX.test(String(value || ''));

// ============================================================
// مؤلفه بنر وضعیت
// ============================================================
const StatusBanner = ({ status, message }) => {
  if (!status || !message) return null;

  const config = {
    new: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      iconColor: 'text-emerald-600',
      Icon: UserPlus,
    },
    existing_match: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-800',
      iconColor: 'text-sky-600',
      Icon: UserCheck,
    },
    conflict: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600',
      Icon: XCircle,
    },
    error: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      iconColor: 'text-amber-600',
      Icon: AlertCircle,
    },
  }[status];

  if (!config) return null;

  const { Icon } = config;

  return (
    <div
      className={`
        flex items-start gap-2 p-3 rounded-lg border
        ${config.bg} ${config.border} ${config.text}
        text-xs
      `}
      role="status"
    >
      <Icon
        size={14}
        strokeWidth={2.4}
        className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}
      />
      <span className="flex-1 leading-relaxed">{message}</span>
    </div>
  );
};

// ============================================================
// Component اصلی
// ============================================================
export const FarmerSection = ({ isSubmitting }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const nationalId = watch('nationalId'); // ← انگلیسی ذخیره می‌شود
  const phone = watch('phone'); // ← انگلیسی ذخیره می‌شود

  // ── State چک تکراری ──
  const [dupState, setDupState] = useState({
    status: null,
    message: '',
    checking: false,
  });

  // ── برای debounce و جلوگیری از race ──
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================
  // چک تکراری (با debounce) — روی مقدار انگلیسی فرم
  // ============================================================
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const nid = String(nationalId || '').trim();
    const ph = String(phone || '').trim();

    const isInputValid =
      nid && ph && isNationalIdValid(nid) && isPhoneValid(ph);

    // ── حالت ۱: ورودی نامعتبر → پاک کن ──
    if (!isInputValid) {
      const clearTimer = setTimeout(() => {
        if (!isMountedRef.current) return;
        setDupState({ status: null, message: '', checking: false });
      }, 0);

      return () => clearTimeout(clearTimer);
    }

    // ── حالت ۲: ورودی معتبر → debounce ──
    const checkingTimer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setDupState((prev) => ({ ...prev, checking: true }));
    }, 0);

    debounceRef.current = setTimeout(async () => {
      const currentReqId = ++requestIdRef.current;

      try {
        const result = await farmerApi.checkDuplicate({
          nationalId: nid,
          phoneNumber: ph,
        });

        if (currentReqId !== requestIdRef.current) return;
        if (!isMountedRef.current) return;

        setDupState({
          status: result.status,
          message: result.message || '',
          checking: false,
        });
      } catch (err) {
        if (currentReqId !== requestIdRef.current) return;
        if (!isMountedRef.current) return;

        console.error('checkDuplicate error:', err);
        setDupState({
          status: 'error',
          message: 'خطا در بررسی اطلاعات کشاورز',
          checking: false,
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearTimeout(checkingTimer);
    };
  }, [nationalId, phone]);

  // ============================================================
  // وضعیت‌های مشتق‌شده
  // ============================================================
  const isExistingMatch = dupState.status === 'existing_match';
  const isConflict = dupState.status === 'conflict';

  // ============================================================
  // هندلر onChange کد ملی:
  //   - ورودی را از فارسی/عربی به انگلیسی تبدیل می‌کند
  //   - فقط ارقام را نگه می‌دارد
  //   - حداکثر ۱۰ رقم
  //   - در form state ذخیره می‌کند (انگلیسی)
  // ============================================================
  const handleNationalIdChange = (e) => {
    const raw = e.target.value;
    const normalized = onlyDigits(raw).slice(0, 10);
    setValue('nationalId', normalized, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // ============================================================
  // هندلر onChange تلفن:
  //   - تبدیل به انگلیسی
  //   - فقط ارقام
  //   - حداکثر ۱۱ رقم
  // ============================================================
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const normalized = onlyDigits(raw).slice(0, 11);
    setValue('phone', normalized, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* ─── نام و نام خانوادگی ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              {...register('firstName')}
              type="text"
              placeholder="مثال: علی"
              disabled={isSubmitting || isExistingMatch}
              className={`
                w-full pr-9 pl-3 py-2 rounded-lg border shadow-sm text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${
                  isExistingMatch
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
                    : errors.firstName
                      ? 'border-red-500'
                      : 'border-gray-300'
                }
              `}
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام خانوادگی <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              {...register('lastName')}
              type="text"
              placeholder="مثال: محمدی"
              disabled={isSubmitting || isExistingMatch}
              className={`
                w-full pr-9 pl-3 py-2 rounded-lg border shadow-sm text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${
                  isExistingMatch
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
                    : errors.lastName
                      ? 'border-red-500'
                      : 'border-gray-300'
                }
              `}
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* ─── کد ملی و تلفن ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            کد ملی <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CreditCard
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="۱۰ رقم"
              disabled={isSubmitting}
              value={toPersianDigits(nationalId || '')}
              onChange={handleNationalIdChange}
              className={`
                w-full pr-9 pl-3 py-2 rounded-lg border shadow-sm text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${errors.nationalId ? 'border-red-500' : 'border-gray-300'}
              `}
              style={{ direction: 'rtl', textAlign: 'right' }}
            />
          </div>
          {errors.nationalId && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.nationalId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            شماره تماس <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="۰۹xxxxxxxxx"
              disabled={isSubmitting || isExistingMatch}
              value={toPersianDigits(phone || '')}
              onChange={handlePhoneChange}
              className={`
                w-full pr-9 pl-3 py-2 rounded-lg border shadow-sm text-sm
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all
                ${
                  isExistingMatch
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
                    : errors.phone
                      ? 'border-red-500'
                      : 'border-gray-300'
                }
              `}
              style={{ direction: 'rtl', textAlign: 'right' }}
            />
          </div>
          {errors.phone && !isExistingMatch && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* ─── بنر وضعیت ─── */}
      {dupState.checking && (
        <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500">
          <Loader2 size={12} className="animate-spin text-gray-400" />
          <span>در حال بررسی کشاورز...</span>
        </div>
      )}

      {!dupState.checking && (
        <StatusBanner status={dupState.status} message={dupState.message} />
      )}

      {/* ─── راهنمای conflict ─── */}
      {isConflict && (
        <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-md px-2 py-1.5 leading-relaxed">
          💡 لطفاً مطمئن شوید کد ملی و شماره تلفن با یک کشاورز مطابقت دارند.
        </div>
      )}
    </div>
  );
};