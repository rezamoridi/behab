// src/features/farm-registration/forms/FarmFormContainer.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Droplet, Loader2 } from 'lucide-react';

import { farmSchema, farmUpdateSchema } from '../schemas/farmSchema';
import {
  DEFAULT_FARM_FORM_VALUES,
  apiToForm,
  formToApi,
} from '../constants/defaultValues';
import { FARM_FORM_TABS } from '../constants/farmOptions';
import { useFarmMutation } from '../hooks/useFarmMutation';
import {
  extractGeometry,
  calculateTotalArea,
  getPolygonArea,
} from '../utils/geometryUtils';

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

  const { createFarm, updateFarm, isLoading: isMutating } =
    useFarmMutation();

  // ============================================
  // Default Values
  // ============================================
  const defaultValues = useMemo(() => {
    if (isEditing && initialData) {
      return apiToForm(initialData);
    }
    return { ...DEFAULT_FARM_FORM_VALUES };
  }, [isEditing, initialData]);

  // ============================================
  // Schema
  // ============================================
  const schema = useMemo(
    () => (isEditing ? farmUpdateSchema : farmSchema),
    [isEditing]
  );

  // ============================================
  // Form Methods
  // ============================================
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = methods;

  // Reset form when initialData changes
  useEffect(() => {
    if (isEditing && initialData) {
      reset(apiToForm(initialData));
    } else if (!isEditing) {
      reset({ ...DEFAULT_FARM_FORM_VALUES });
    }
  }, [isEditing, initialData, reset]);

  // ============================================
  // Compute Areas
  // ============================================
  const polygonCount = useMemo(() => {
    if (!geojson) return 0;
    if (Array.isArray(geojson)) return geojson.length;
    return 1;
  }, [geojson]);

  const computedTotalArea = useMemo(() => {
    if (areaHa > 0) return areaHa;
    return calculateTotalArea(geojson);
  }, [areaHa, geojson]);

  // ============================================
  // Submit Handler
  // ============================================
  const onSubmit = useCallback(
    async (formData) => {
      setSubmitError(null);

      try {
        const geometry = extractGeometry(geojson);

        if (!geometry) {
          setSubmitError(
            'هندسه زمین معتبر نیست. لطفاً محدوده را روی نقشه رسم کنید.'
          );
          return;
        }

        const payload = formToApi({
          formData,
          areaHa: computedTotalArea,
          polygonCount,
          geometry,
        });

        let result;
        if (isEditing && editingFarmId) {
          result = await updateFarm({
            farmId: editingFarmId,
            payload,
          });
        } else {
          result = await createFarm(payload);
        }

        onSuccess?.(result);
      } catch (err) {
        console.error('Form submission error:', err);
        const errorMessage =
          err?.response?.data?.detail ||
          err?.message ||
          'خطا در ذخیره اطلاعات مزرعه';
        setSubmitError(errorMessage);
      }
    },
    [
      geojson,
      computedTotalArea,
      polygonCount,
      isEditing,
      editingFarmId,
      updateFarm,
      createFarm,
      onSuccess,
    ]
  );

  // ============================================
  // Active Section
  // ============================================
  const ActiveSection = SECTION_MAP[activeTab] || LocationSection;

  const sectionProps = {
    isSubmitting: isMutating,
    totalArea: computedTotalArea,
    polygonCount,
    geojson,
    locationData,
    getPolygonArea,
  };

  const waterVolume = computedTotalArea * 5000;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full"
        dir="rtl"
      >
        {/* Error Banner */}
        {submitError && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle
              size={18}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <span className="text-sm text-red-700 flex-1">
              {submitError}
            </span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-red-500 hover:text-red-700 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4 bg-gray-50 flex-shrink-0">
          {FARM_FORM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-5 py-3 text-sm font-medium transition-colors
                border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body - Fixed height with internal scroll */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[380px] max-h-[420px]">
          <ActiveSection {...sectionProps} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <Droplet size={16} className="text-primary-600" />
            <span className="text-gray-600">آب مورد نیاز:</span>
            <strong className="text-primary-700" dir="ltr">
              {waterVolume.toLocaleString('fa-IR')} m³
            </strong>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isMutating}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!isValid || isMutating}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isMutating && <Loader2 size={14} className="animate-spin" />}
              {isMutating
                ? 'در حال ثبت...'
                : isEditing
                  ? 'ذخیره تغییرات'
                  : 'ثبت نهایی مزرعه'}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};