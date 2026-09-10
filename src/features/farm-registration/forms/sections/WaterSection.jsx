// src/features/farm-registration/forms/sections/WaterSection.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MapPinned } from 'lucide-react';
import {
  getStudyAreas,
  getCoverageStatuses,
  getWaterRequirementPerHa,
} from '../../constants/farmOptions';

export const WaterSection = ({
  isSubmitting,
  totalArea,
  geojson,
  getPolygonArea,
}) => {
  const { register, watch } = useFormContext();

  const irrigationType = watch('irrigationType');

  const studyAreas = getStudyAreas();
  const coverageStatuses = getCoverageStatuses();
  const waterPerHa = getWaterRequirementPerHa();

  const waterVolume = totalArea > 0 ? totalArea * waterPerHa : 0;
  const isDim = irrigationType === 'dim';

  return (
    <div className="space-y-4">
      {/* محدوده مطالعاتی و پوشش */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            محدوده مطالعاتی
          </label>
          <select
            {...register('studyArea')}
            disabled={isSubmitting}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
          >
            <option value="">انتخاب کنید...</option>
            {studyAreas.map((area) => (
              <option key={area.id} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            وضعیت پوشش شبکه
          </label>
          <select
            {...register('coverageStatus')}
            disabled={isSubmitting}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
          >
            {coverageStatuses.map((status) => (
              <option key={status.id} value={status.name}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* پیام برای زمین دیم */}
      {isDim && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-600 text-base flex-shrink-0">ℹ️</span>
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-0.5">
              زمین دیم - بدون نیاز به منابع آب
            </div>
            <div>
              برای زمین دیم، نیازی به انتخاب منبع تأمین آب و سیستم آبیاری
              نیست. تنظیمات مربوطه در تب «زمین» انجام شده است.
            </div>
          </div>
        </div>
      )}

      {/* اطلاعات قطعات */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <MapPinned size={16} className="text-gray-600" />
          اطلاعات قطعات
        </label>

        <div className="space-y-1 max-h-32 overflow-y-auto">
          {Array.isArray(geojson) && geojson.length > 0 ? (
            geojson.map((poly, index) => {
              const polyArea = getPolygonArea?.(poly) || 0;
              return (
                <div
                  key={index}
                  className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0"
                >
                  <span className="text-gray-700">قطعه {index + 1}</span>
                  <span className="text-primary-700 font-medium">
                    {polyArea > 0 ? polyArea.toFixed(2) : '۰'} هکتار
                  </span>
                </div>
              );
            })
          ) : geojson ? (
            <div className="flex justify-between text-sm py-1">
              <span className="text-gray-700">قطعه ۱</span>
              <span className="text-primary-700 font-medium">
                {totalArea > 0 ? totalArea.toFixed(2) : '۰'} هکتار
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              هیچ قطعه‌ای رسم نشده است
            </p>
          )}
        </div>

        {totalArea > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-sm font-medium text-primary-700">
            <span>مساحت کل:</span>
            <span>{totalArea.toFixed(2)} هکتار</span>
          </div>
        )}
      </div>
    </div>
  );
};