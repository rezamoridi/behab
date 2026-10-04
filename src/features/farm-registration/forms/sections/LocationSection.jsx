// src/features/farm-registration/forms/sections/LocationSection.jsx
import { useMemo, useId } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  CheckCircle2,
  AlertCircle,
  Wand2,
  MapPin,
} from 'lucide-react';
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
// ✅ ComboBox — مینیمال با استایل شیشه‌ای
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
}) => {
  const listId = useId();
  const hasError = !!errors[name];

  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
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
            w-full px-3 py-2.5 rounded-xl text-sm font-medium
            bg-white/40 backdrop-blur-md
            ring-1 transition-all
            outline-none
            placeholder:text-slate-400 placeholder:text-xs
            ${
              disabled
                ? 'bg-white/20 text-slate-400 cursor-not-allowed ring-white/30'
                : hasError
                  ? 'ring-red-400 focus:ring-red-500 focus:bg-white/60'
                  : 'ring-white/50 hover:ring-white/70 focus:ring-primary-500 focus:bg-white/70 focus:shadow-[0_0_0_3px_rgba(46,125,50,0.1)]'
            }
            text-slate-800
          `}
          dir="rtl"
        />

        <datalist id={listId}>
          {options.map((opt) => (
            <option key={opt.id || opt.name} value={opt.name} />
          ))}
        </datalist>
      </div>

      {hasError && (
        <p className="mt-1 text-[10px] text-red-600 flex items-center gap-1">
          <AlertCircle size={10} />
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

// ============================================
// Component اصلی
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
  const village = watch('village');

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
    () => mergeOptions(baseVillages, village),
    [baseVillages, village]
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

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-4">
      {/* ─── نوار عملیات بالای فرم ─── */}
      <button
        type="button"
        onClick={handleFillFromSearch}
        disabled={!locationData || isSubmitting}
        className={`
          w-full py-2.5 px-3 text-xs font-semibold rounded-xl
          transition-all duration-200
          flex items-center justify-center gap-2
          ${
            isFilled
              ? 'bg-green-500/20 text-green-700 ring-1 ring-green-500/30'
              : locationData
                ? 'bg-blue-500/20 text-blue-700 ring-1 ring-blue-500/30 hover:bg-blue-500/30'
                : 'bg-white/20 text-slate-400 ring-1 ring-white/40'
          }
          ${!locationData || isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isFilled ? (
          <>
            <CheckCircle2 size={14} />
            <span>موقعیت اعمال شد</span>
          </>
        ) : (
          <>
            <Wand2 size={14} />
            <span>
              {locationData ? 'اعمال از جستجو' : 'ابتدا مکان را جستجو کنید'}
            </span>
          </>
        )}
      </button>

      {/* ─── کارت اطلاعات جستجو ─── */}
      {locationData && (
        <div className="rounded-xl bg-white/20 backdrop-blur-md ring-1 ring-white/40 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin size={11} className="text-blue-600" strokeWidth={2.4} />
            <span className="text-[10px] font-bold text-slate-700">
              از جستجو
            </span>
          </div>
          <div className="text-[11px] text-slate-700 leading-relaxed">
            {[
              locationData.province,
              locationData.county || locationData.city,
              locationData.bakhsh || locationData.district,
            ]
              .filter(Boolean)
              .join(' • ')}
            {(locationData.village || locationData.name) && (
              <div className="text-slate-500 mt-0.5 text-[10px]">
                {locationData.village || locationData.name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── گروه ۱: استان / شهرستان ─── */}
      <div className="grid grid-cols-2 gap-3">
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

      {/* ─── گروه ۲: بخش / دهستان ─── */}
      <div className="grid grid-cols-2 gap-3">
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

      {/* ─── گروه ۳: روستا / مساحت ─── */}
      <div className="grid grid-cols-2 gap-3">
        <ComboBox
          label="روستا"
          name="village"
          register={register}
          errors={errors}
          disabled={isSubmitting}
          options={villages}
          placeholder="مثال: هوکی"
        />

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
            مساحت کل
            <span className="text-slate-400 font-normal mr-1">(هکتار)</span>
          </label>
          <div
            className={`
              w-full px-3 py-2.5 rounded-xl text-sm font-bold text-center
              ring-1 backdrop-blur-md
              ${
                totalArea > 0
                  ? 'bg-green-500/15 text-green-700 ring-green-500/30'
                  : 'bg-amber-500/15 text-amber-700 ring-amber-500/30'
              }
            `}
            dir="ltr"
          >
            {totalArea > 0
              ? totalArea.toLocaleString('fa-IR', {
                  maximumFractionDigits: 2,
                })
              : '۰'}
          </div>
        </div>
      </div>

      {/* ─── پیام راهنما ─── */}
      {polygonCount === 0 && (
        <div className="flex items-start gap-2 p-2.5 bg-amber-500/15 rounded-xl text-[11px] text-amber-800 leading-relaxed">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          <span>
            برای محاسبه مساحت، ابتدا محدوده را روی نقشه رسم کنید
          </span>
        </div>
      )}
    </div>
  );
};