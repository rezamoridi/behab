// src/features/farm-registration/forms/FarmFormContainer.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  CheckCircle2,
  Droplet,
  Loader2,
  MapPin,
  User,
  Layers,
  Waves,
  Save,
  X,
} from 'lucide-react';

import { farmSchema, farmUpdateSchema } from '../schemas/farmSchema';
import {
  DEFAULT_FARM_FORM_VALUES,
  apiToForm,
  formToFarmPayload,
  formToRegisterPayload,
} from '../constants/defaultValues';
import { FARM_FORM_TABS } from '../constants/farmOptions';
import {
  useFarmMutation,
  useRegisterWithFarmsMutation,
} from '../hooks/useFarmMutation';
import {
  extractGeometry,
  calculateTotalArea,
  getPolygonArea,
} from '../utils/geometryUtils';

import { useActiveCrops } from '../../settings/hooks/useActiveCrops';
import { useToast } from '../../../shared/components/Toast/ToastProvider';

import { LocationSection } from './sections/LocationSection';
import { FarmerSection } from './sections/FarmerSection';
import { LandSection } from './sections/LandSection';
import { WaterSection } from './sections/WaterSection';

const SECTION_MAP = {
  location: LocationSection,
  farmer: FarmerSection,
  land: LandSection,
  water: WaterSection,
};

// ✅ تب‌ها با رنگ مشخص
const TAB_META = {
  location: {
    icon: MapPin,
    label: 'موقعیت',
    activeClass: 'bg-blue-500/25 text-blue-800 ring-1 ring-blue-500/40',
    barClass: 'bg-blue-500',
  },
  farmer: {
    icon: User,
    label: 'کشاورز',
    activeClass: 'bg-emerald-500/25 text-emerald-800 ring-1 ring-emerald-500/40',
    barClass: 'bg-emerald-500',
  },
  land: {
    icon: Layers,
    label: 'زمین',
    activeClass: 'bg-amber-500/25 text-amber-800 ring-1 ring-amber-500/40',
    barClass: 'bg-amber-500',
  },
  water: {
    icon: Waves,
    label: 'شبکه',
    activeClass: 'bg-sky-500/25 text-sky-800 ring-1 ring-sky-500/40',
    barClass: 'bg-sky-500',
  },
};

const DEFAULT_WATER_REQUIREMENT = 5000;

export const FarmFormContainer = ({
  initialData = null,
  areaHa = 0,
  geojson = null,
  locationData = null,
  isEditing = false,
  editingFarmId = null,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState('location');
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const toast = useToast();

  const { updateFarm, isLoading: isUpdatingFarm } = useFarmMutation();
  const registerMutation = useRegisterWithFarmsMutation();

  const isMutating = isUpdatingFarm || registerMutation.isPending;

  const { crops: activeCrops, getRequirement } = useActiveCrops();

  const defaultValues = useMemo(() => {
    if (isEditing && initialData) return apiToForm(initialData);
    return { ...DEFAULT_FARM_FORM_VALUES };
  }, [isEditing, initialData]);

  const schema = useMemo(
    () => (isEditing ? farmUpdateSchema : farmSchema),
    [isEditing],
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { isValid, errors },
  } = methods;

  const selectedCrop = useWatch({ control, name: 'crop' });

  const activeRequirement = useMemo(() => {
    if (!selectedCrop) return DEFAULT_WATER_REQUIREMENT;
    const req = getRequirement(selectedCrop);
    return req ?? DEFAULT_WATER_REQUIREMENT;
  }, [selectedCrop, getRequirement]);

  const hasRealRequirement = useMemo(() => {
    if (!selectedCrop) return false;
    return getRequirement(selectedCrop) !== null;
  }, [selectedCrop, getRequirement]);

  useEffect(() => {
    if (isEditing && initialData) {
      reset(apiToForm(initialData));
    } else if (!isEditing) {
      reset({ ...DEFAULT_FARM_FORM_VALUES });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, initialData]);

  const polygonCount = useMemo(() => {
    if (!geojson) return 0;
    if (Array.isArray(geojson)) return geojson.length;
    return 1;
  }, [geojson]);

  const computedTotalArea = useMemo(() => {
    if (areaHa > 0) return areaHa;
    return calculateTotalArea(geojson);
  }, [areaHa, geojson]);

  const waterVolume = useMemo(() => {
    if (computedTotalArea <= 0) return 0;
    return computedTotalArea * activeRequirement;
  }, [computedTotalArea, activeRequirement]);

  const onSubmit = useCallback(
    async (formData) => {
      setSubmitError(null);
      setSubmitSuccess(null);
      try {
        const geometry = extractGeometry(geojson);
        if (!geometry) {
          setSubmitError(
            'هندسه زمین معتبر نیست. لطفاً محدوده را روی نقشه رسم کنید.',
          );
          return;
        }
        const selectedCropObj = activeCrops.find(
          (c) => c.name === formData.crop,
        );
        const cropId = selectedCropObj?.id ?? null;

        if (isEditing && editingFarmId) {
          const payload = formToFarmPayload({
            formData,
            areaHa: computedTotalArea,
            polygonCount,
            geometry,
            cropId,
            farmerId: initialData?.farmer_id ?? null,
          });
          delete payload.farmer_id;
          const result = await updateFarm({
            farmId: editingFarmId,
            payload,
          });
          setSubmitSuccess('تغییرات با موفقیت ذخیره شد.');
          toast.success('تغییرات ذخیره شد.', 'مزرعه به‌روزرسانی شد');
          onSuccess?.(result);
          setTimeout(() => setSubmitSuccess(null), 4000);
          return;
        }

        const payload = formToRegisterPayload({
          formData,
          areaHa: computedTotalArea,
          polygonCount,
          geometry,
          cropId,
        });
        const result = await registerMutation.mutateAsync(payload);
        const { action, message } = result;
        if (action === 'created') {
          toast.success(
            'کشاورز جدید ثبت شد و پیامک دعوت ارسال گردید.',
            'ثبت موفق',
          );
          setSubmitSuccess(
            'کشاورز جدید ثبت شد. پیامک دعوت برایش ارسال می‌شود.',
          );
        } else if (action === 'updated') {
          toast.info(
            'زمین جدید به پرونده کشاورز موجود اضافه شد.',
            'زمین اضافه شد',
          );
          setSubmitSuccess(
            'زمین جدید به پرونده کشاورز موجود اضافه شد.',
          );
        } else {
          setSubmitSuccess(message || 'ثبت با موفقیت انجام شد.');
        }
        onSuccess?.(result);
        setTimeout(() => setSubmitSuccess(null), 5000);
      } catch (err) {
        const rawDetail =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message;
        let finalMessage = 'خطا در ذخیره اطلاعات مزرعه';
        if (typeof rawDetail === 'string') finalMessage = rawDetail;
        else if (rawDetail && typeof rawDetail === 'object') {
          finalMessage =
            rawDetail.message || rawDetail.detail || finalMessage;
        }
        setSubmitError(finalMessage);
        toast.error(finalMessage, 'خطا در ثبت');
      }
    },
    [
      geojson,
      computedTotalArea,
      polygonCount,
      isEditing,
      editingFarmId,
      updateFarm,
      registerMutation,
      onSuccess,
      activeCrops,
      initialData,
      toast,
    ],
  );

  const ActiveSection = SECTION_MAP[activeTab] || LocationSection;
  const activeMeta = TAB_META[activeTab] || TAB_META.location;

  const sectionProps = {
    isSubmitting: isMutating,
    totalArea: computedTotalArea,
    polygonCount,
    geojson,
    locationData,
    getPolygonArea,
    waterRequirement: activeRequirement,
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex flex-col h-full"
        dir="rtl"
      >
        {/* Alerts — شفافیت بیشتر */}
        {submitSuccess && (
          <div className="flex-shrink-0 mx-4 mt-3 p-2.5 bg-green-500/25 backdrop-blur-md rounded-xl flex items-start gap-2 text-xs ring-1 ring-green-500/30">
            <CheckCircle2
              size={14}
              className="text-green-700 flex-shrink-0 mt-0.5"
            />
            <span className="text-green-900 flex-1 leading-relaxed font-medium">
              {submitSuccess}
            </span>
            <button
              type="button"
              onClick={() => setSubmitSuccess(null)}
              className="text-green-700 hover:text-green-900 text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}
        {submitError && (
          <div className="flex-shrink-0 mx-4 mt-3 p-2.5 bg-red-500/25 backdrop-blur-md rounded-xl flex items-start gap-2 text-xs ring-1 ring-red-500/30">
            <AlertCircle
              size={14}
              className="text-red-700 flex-shrink-0 mt-0.5"
            />
            <span className="text-red-900 flex-1 leading-relaxed font-medium">
              {submitError}
            </span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-red-700 hover:text-red-900 text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex min-h-0">
          {/* ─── Sidebar — ~30% مات ─── */}
          <aside
            className="
              flex-shrink-0 w-[72px]
              flex flex-col items-center
              py-3 gap-1
              border-l border-white/40
            "
            style={{
              // ✅ از 0.15 به 0.30
              background: 'rgba(255, 255, 255, 0.30)',
            }}
          >
            {FARM_FORM_TABS.map((tab) => {
              const meta = TAB_META[tab.id] || TAB_META.location;
              const Icon = meta.icon;
              const isActive = activeTab === tab.id;
              const tabErrors = errors?.[tab.id];

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={meta.label}
                  aria-label={meta.label}
                  className={`
                    group relative
                    w-[60px] py-2.5
                    flex flex-col items-center gap-0.5
                    rounded-2xl
                    transition-all duration-200
                    cursor-pointer
                    ${
                      isActive
                        ? `${meta.activeClass} shadow-sm`
                        : 'text-slate-700 hover:bg-white/50 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon
                    size={isActive ? 20 : 18}
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                  <span
                    className={`text-[10px] font-bold leading-tight ${
                      isActive ? '' : 'opacity-80'
                    }`}
                  >
                    {meta.label}
                  </span>

                  {tabErrors && (
                    <span
                      className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white"
                      aria-label="خطا"
                    />
                  )}

                  {isActive && (
                    <span
                      className={`
                        absolute -right-2 top-1/2 -translate-y-1/2
                        w-1 h-7 rounded-l-full
                        ${meta.barClass}
                      `}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </aside>

          {/* ─── Content ─── */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Title بالای فرم */}
            <div className="flex-shrink-0 px-5 pt-4 pb-3">
              <h4 className="text-base font-bold text-slate-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                {activeMeta.label}
              </h4>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
              <ActiveSection {...sectionProps} />
            </div>
          </div>
        </div>

        {/* ─── Footer — ~35% مات ─── */}
        <div
          className="flex-shrink-0 border-t border-white/40"
          style={{
            // ✅ از 0.18 به 0.35
            background: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div className="px-4 py-2.5 flex items-center justify-between gap-3">
            {/* Water info */}
            <div className="flex items-center gap-2 min-w-0">
              <Droplet
                size={14}
                className="text-sky-600 flex-shrink-0 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]"
              />
              <div className="flex items-baseline gap-1 min-w-0" dir="ltr">
                <span className="text-sm font-bold text-sky-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
                  {waterVolume.toLocaleString('fa-IR')}
                </span>
                <span className="text-[10px] text-sky-700 font-medium">
                  m³
                </span>
                {selectedCrop && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      hasRealRequirement
                        ? 'bg-sky-500/25 text-sky-800'
                        : 'bg-amber-500/25 text-amber-800'
                    }`}
                  >
                    {Number(activeRequirement).toLocaleString('fa-IR')} m³/ha
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onCancel}
                disabled={isMutating}
                className="
                  inline-flex items-center justify-center
                  w-9 h-9 rounded-xl
                  text-slate-700 hover:bg-white/60 hover:text-slate-900
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                aria-label="انصراف"
                title="انصراف"
              >
                <X size={16} strokeWidth={2.2} />
              </button>

              <button
                type="submit"
                disabled={!isValid || isMutating}
                className="
                  inline-flex items-center gap-1.5
                  px-4 py-2 rounded-xl
                  bg-gradient-to-br from-primary-500 to-primary-700
                  hover:from-primary-600 hover:to-primary-800
                  text-white text-sm font-bold
                  transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_4px_14px_rgba(46,125,50,0.3)]
                "
              >
                {isMutating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} strokeWidth={2.2} />
                    <span>{isEditing ? 'ذخیره' : 'ثبت'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default FarmFormContainer;