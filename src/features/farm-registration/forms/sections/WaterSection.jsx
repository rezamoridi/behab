// src/features/farm-registration/forms/sections/WaterSection.jsx
import { useFormContext } from 'react-hook-form';
import { MapPinned, Droplet, Layers } from 'lucide-react';
import {
  getStudyAreas,
  getCoverageStatuses,
} from '../../constants/farmOptions';

export const WaterSection = ({
  isSubmitting,
  totalArea,
  geojson,
  getPolygonArea,
  waterRequirement = 5000,
}) => {
  const { register, watch } = useFormContext();

  const irrigationType = watch('irrigationType');
  const selectedCrop = watch('crop');

  const studyAreas = getStudyAreas();
  const coverageStatuses = getCoverageStatuses();

  // ✅ محاسبه بر اساس نرخ محصول
  const waterVolume = totalArea > 0 ? totalArea * waterRequirement : 0;
  const isDim = irrigationType === 'dim';

  // ✅ محاسبه تعداد قطعات
  const polygonCount = Array.isArray(geojson)
    ? geojson.length
    : geojson
      ? 1
      : 0;

  // ✅ ساخت لیست قطعات با مساحت
  const polygonsList = Array.isArray(geojson)
    ? geojson
    : geojson
      ? [geojson]
      : [];

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

      {/* ✅ نمایش محاسبه آب بر اساس محصول */}
      {selectedCrop && totalArea > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Droplet size={14} className="text-sky-600" strokeWidth={2.4} />
            <span className="text-xs font-semibold text-sky-800">
              محاسبه آب بر اساس نرخ محصول
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-gray-500 mb-0.5">محصول</div>
              <div className="font-semibold text-gray-800">
                {selectedCrop}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-0.5">نرخ آب</div>
              <div
                className="font-semibold text-sky-700"
                style={{ direction: 'ltr' }}
              >
                {Number(waterRequirement).toLocaleString('fa-IR')} m³/ha
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-0.5">آب مورد نیاز</div>
              <div
                className="font-semibold text-primary-700"
                style={{ direction: 'ltr' }}
              >
                {waterVolume.toLocaleString('fa-IR')} m³
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* ✅ اطلاعات قطعات — با نمایش تعداد */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPinned size={16} className="text-gray-600" />
            اطلاعات قطعات
          </label>

          {/* ✅ Badge تعداد قطعات */}
          {polygonCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold">
              <Layers size={12} strokeWidth={2.4} />
              <span>{polygonCount.toLocaleString('fa-IR')}</span>
              <span className="text-[10px] font-normal text-primary-600">
                قطعه
              </span>
            </span>
          )}
        </div>

        {/* ─── حالت ۱: قطعه‌ها موجود ─── */}
        {polygonsList.length > 0 ? (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {polygonsList.map((poly, index) => {
              const polyArea = getPolygonArea?.(poly) || 0;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm py-2 px-2 rounded-md hover:bg-white transition-colors border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {/* شماره قطعه */}
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white border border-gray-200 text-[11px] font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-xs">
                      قطعه {(index + 1).toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <span className="text-primary-700 font-medium text-sm" dir="ltr">
                    {polyArea > 0
                      ? polyArea.toLocaleString('fa-IR', {
                          maximumFractionDigits: 2,
                        })
                      : '۰'}
                    <span className="text-[10px] text-gray-400 mr-1">
                      ha
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── حالت ۲: هنوز چیزی رسم نشده ─── */
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mb-2">
              <MapPinned size={16} />
            </div>
            <p className="text-xs text-gray-400">
              هیچ قطعه‌ای رسم نشده است
            </p>
          </div>
        )}

        {/* ─── جمع کل ─── */}
        {totalArea > 0 && polygonCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">مساحت کل:</span>
            <div className="flex items-baseline gap-1" dir="ltr">
              <span className="font-bold text-primary-700 text-base">
                {totalArea.toLocaleString('fa-IR', {
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[10px] text-gray-400">ha</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};