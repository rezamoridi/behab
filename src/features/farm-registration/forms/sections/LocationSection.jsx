// src/features/farm-registration/forms/sections/LocationSection.jsx
import React, { useMemo, useEffect, useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { CheckCircle2, AlertCircle, Wand2 } from 'lucide-react';
import {
  getProvinces,
  getCounties,
  getBakhshs,
  getDehestans,
  getVillages,
} from '../../constants/locations';

// ============================================
// Helper: نرمال‌سازی نام
// ============================================
const normalizeName = (name) => {
  if (!name) return '';
  return String(name)
    .replace(/^استان\s+/g, '')
    .replace(/^شهرستان\s+/g, '')
    .replace(/^بخش\s+/g, '')
    .replace(/^دهستان\s+/g, '')
    .replace(/^روستای\s+/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ۀ/g, 'ه')
    .replace(/ة/g, 'ه')
    .replace(/[آأإا]/g, 'ا')
    .replace(/\u200c/g, '')
    .replace(/\s+/g, '')
    .trim();
};

// ============================================
// Helper: پیدا کردن گزینه match در لیست
// ============================================
const findMatchingName = (value, options) => {
  if (!value || !options || options.length === 0) return null;

  const normalizedValue = normalizeName(value);
  if (!normalizedValue) return null;

  for (const opt of options) {
    if (normalizeName(opt.name) === normalizedValue) return opt.name;
  }

  for (const opt of options) {
    const optNorm = normalizeName(opt.name);
    if (optNorm.includes(normalizedValue) || normalizedValue.includes(optNorm)) {
      return opt.name;
    }
  }

  const words = normalizedValue.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    for (const opt of options) {
      const optNorm = normalizeName(opt.name);
      if (words.some((w) => w.length > 2 && optNorm.includes(w))) {
        return opt.name;
      }
    }
  }

  return null;
};

// ============================================
// ✅ ComboBox - Input با Datalist
// ============================================
const ComboBox = ({
  label,
  name,
  register,
  errors,
  disabled,
  options = [],
  placeholder = 'تایپ کنید یا انتخاب کنید...',
  required = false,
  hint,
  showBadge = false,
}) => {
  const listId = useId();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      <div className="relative">
        <input
          {...register(name)}
          type="text"
          list={listId}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className={`
            w-full px-3 py-2 rounded-lg border shadow-sm text-sm
            focus:border-primary-500 focus:ring-2 focus:ring-primary-200
            outline-none transition-all
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
            ${errors[name] ? 'border-red-500' : 'border-gray-300'}
          `}
          dir="rtl"
        />

        <datalist id={listId}>
          {options.map((opt) => (
            <option key={opt.id || opt.name} value={opt.name} />
          ))}
        </datalist>
      </div>

      {hint && !errors[name] && (
        <p className="mt-1 text-[11px] text-gray-500">{hint}</p>
      )}

      {errors[name] && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} />
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

// ============================================
// Component
// ============================================
export const LocationSection = ({
  locationData,
  isSubmitting,
  totalArea,
  polygonCount,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const province = watch('province');
  const county = watch('county');
  const bakhsh = watch('bakhsh');
  const dehestan = watch('dehestan');

  // ============================================
  // Base options از JSON
  // ============================================
  const baseProvinces = useMemo(() => getProvinces(), []);
  const baseCounties = useMemo(() => getCounties(province), [province]);
  const baseBakhshs = useMemo(
    () => getBakhshs(province, county),
    [province, county]
  );
  const baseDehestans = useMemo(
    () => getDehestans(province, county, bakhsh),
    [province, county, bakhsh]
  );
  const baseVillages = useMemo(
    () => getVillages(province, county, bakhsh, dehestan),
    [province, county, bakhsh, dehestan]
  );

  // ============================================
  // Merge: اگر مقدار فعلی در لیست نیست، آن را اضافه کن
  // ============================================
  const mergeOptions = (options, currentValue) => {
    if (!currentValue) return options;
    const exists = options.some(
      (opt) => normalizeName(opt.name) === normalizeName(currentValue)
    );
    if (exists) return options;
    return [
      ...options,
      { id: `__custom__${currentValue}`, name: currentValue, isCustom: true },
    ];
  };

  const provinces = useMemo(
    () => mergeOptions(baseProvinces, province),
    [baseProvinces, province]
  );
  const counties = useMemo(
    () => mergeOptions(baseCounties, county),
    [baseCounties, county]
  );
  const bakhshs = useMemo(
    () => mergeOptions(baseBakhshs, bakhsh),
    [baseBakhshs, bakhsh]
  );
  const dehestans = useMemo(
    () => mergeOptions(baseDehestans, dehestan),
    [baseDehestans, dehestan]
  );
  const villages = useMemo(
    () => mergeOptions(baseVillages, watch('village')),
    [baseVillages, watch('village')]
  );

  const isFilled = !!(province && county);

  // ============================================
  // پر کردن از جستجو
  // ============================================
  const handleFillFromSearch = () => {
    if (!locationData) {
      alert('لطفاً ابتدا یک مکان را جستجو کنید.');
      return;
    }

    const rawProvince = locationData.province || locationData.state || '';
    const rawCounty =
      locationData.county || locationData.city || locationData.town || '';
    const rawBakhsh =
      locationData.bakhsh ||
      locationData.district ||
      locationData.municipality ||
      '';
    const rawDehestan =
      locationData.dehestan ||
      locationData.suburb ||
      locationData.neighbourhood ||
      '';
    const rawVillage =
      locationData.village || locationData.hamlet || locationData.name || '';

    const matchOrRaw = (rawValue, jsonOptions) => {
      if (!rawValue) return '';
      const matched = findMatchingName(rawValue, jsonOptions);
      return matched || rawValue;
    };

    const finalProvince = matchOrRaw(rawProvince, baseProvinces);
    if (!finalProvince) {
      alert('استان در اطلاعات جستجو یافت نشد.');
      return;
    }

    setValue('province', finalProvince, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    const availableCounties = getCounties(finalProvince);
    const finalCounty = matchOrRaw(rawCounty, availableCounties);

    if (finalCounty) {
      setValue('county', finalCounty, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    const availableBakhshs = getBakhshs(finalProvince, finalCounty);
    const finalBakhsh = matchOrRaw(rawBakhsh, availableBakhshs);

    if (finalBakhsh) {
      setValue('bakhsh', finalBakhsh, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    const availableDehestans = getDehestans(
      finalProvince,
      finalCounty,
      finalBakhsh
    );
    const finalDehestan = matchOrRaw(rawDehestan, availableDehestans);

    if (finalDehestan) {
      setValue('dehestan', finalDehestan, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    const availableVillages = getVillages(
      finalProvince,
      finalCounty,
      finalBakhsh,
      finalDehestan
    );
    const finalVillage = matchOrRaw(rawVillage, availableVillages);

    if (finalVillage) {
      setValue('village', finalVillage, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* دکمه پر کردن از جستجو */}
      <button
        type="button"
        onClick={handleFillFromSearch}
        disabled={!locationData || isSubmitting}
        className={`
          w-full py-2.5 px-4 text-sm font-medium rounded-lg
          border-2 transition-all duration-200
          flex items-center justify-center gap-2
          ${
            isFilled
              ? 'bg-green-50 border-green-500 text-green-700'
              : locationData
                ? 'bg-blue-50 border-blue-400 text-blue-600 hover:bg-blue-100'
                : 'bg-gray-50 border-gray-300 text-gray-400'
          }
          ${
            !locationData || isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }
        `}
      >
        {isFilled ? (
          <>
            <CheckCircle2 size={16} />
            <span>پر شد</span>
          </>
        ) : (
          <>
            <Wand2 size={16} />
            <span>
              {locationData
                ? 'پر کردن اطلاعات از جستجو'
                : 'ابتدا یک مکان جستجو کنید'}
            </span>
          </>
        )}
      </button>

      {/* Debug Box */}
      {locationData && (
        <div className="text-xs bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-1">
          <div className="font-medium text-blue-700 mb-2">
            📍 اطلاعات مکان جستجو شده:
          </div>
          <div className="grid grid-cols-2 gap-1 text-gray-700">
            <div>
              <span className="text-gray-500">استان:</span>{' '}
              {locationData.province || '—'}
            </div>
            <div>
              <span className="text-gray-500">شهرستان:</span>{' '}
              {locationData.county || locationData.city || '—'}
            </div>
            <div>
              <span className="text-gray-500">بخش:</span>{' '}
              {locationData.bakhsh || locationData.district || '—'}
            </div>
            <div>
              <span className="text-gray-500">دهستان:</span>{' '}
              {locationData.dehestan || locationData.suburb || '—'}
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">روستا/مکان:</span>{' '}
              {locationData.village || locationData.name || '—'}
            </div>
          </div>
        </div>
      )}

      {/* استان و شهرستان */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComboBox
          label="استان"
          name="province"
          register={register}
          errors={errors}
          disabled={isSubmitting}
          options={provinces}
          placeholder="مثال: لرستان"
          required
        />

        <ComboBox
          label="شهرستان"
          name="county"
          register={register}
          errors={errors}
          disabled={isSubmitting}
          options={counties}
          placeholder="مثال: خرم‌آباد"
          required
        />
      </div>

      {/* بخش و دهستان */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComboBox
          label="بخش"
          name="bakhsh"
          register={register}
          errors={errors}
          disabled={isSubmitting}
          options={bakhshs}
          placeholder="مثال: مرکزی"
        />

        <ComboBox
          label="دهستان"
          name="dehestan"
          register={register}
          errors={errors}
          disabled={isSubmitting}
          options={dehestans}
          placeholder="مثال: رباط"
        />
      </div>

      {/* روستا و مساحت */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComboBox
          label="روستا"
          name="village"
          register={register}
          errors={errors}
          disabled={isSubmitting}
          options={villages}
          placeholder="مثال: هوکی"
          hint="می‌توانید نام جدید تایپ کنید"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            مساحت کل زمین (هکتار)
          </label>
          <input
            type="text"
            value={totalArea > 0 ? totalArea.toFixed(2) : '۰'}
            readOnly
            className={`
              w-full px-3 py-2 rounded-lg shadow-sm text-sm font-medium
              ${
                totalArea > 0
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-orange-50 border-orange-300 text-orange-700'
              }
            `}
          />
          {polygonCount > 0 ? (
            <p className="mt-1 text-xs text-green-600">
              ✓ {polygonCount} قطعه - مساحت کل محاسبه شد
            </p>
          ) : (
            <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
              <AlertCircle size={12} />
              لطفاً حداقل یک محدوده را روی نقشه رسم کنید
            </p>
          )}
        </div>
      </div>
    </div>
  );
};