// src/features/farm-registration/forms/sections/LandSection.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Sprout,
  Leaf,
  Droplets,
  CloudRain,
  AlertCircle,
  Check,
  Layers,
} from 'lucide-react';
import {
  getLandTypes,
  getCrops,
  getIrrigationTypes,
  getWaterSources,
  getIrrigationSystems,
} from '../../constants/farmOptions';

export const LandSection = ({ isSubmitting }) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const irrigationType = watch('irrigationType');
  const selectedWaterSources = watch('waterSources') || [];
  const selectedIrrigationSystems = watch('irrigationSystems') || [];

  const landTypes = getLandTypes();
  const crops = getCrops();
  const irrigationTypes = getIrrigationTypes();
  const waterSources = getWaterSources();
  const irrigationSystems = getIrrigationSystems();

  // آیکون بر اساس نوع آبیاری
  const irrigationIcons = {
    aabi: Droplets,
    dim: CloudRain,
  };

  const handleCheckboxChange = (fieldName, itemName) => {
    const currentList = watch(fieldName) || [];
    const updatedList = currentList.includes(itemName)
      ? currentList.filter((x) => x !== itemName)
      : [...currentList, itemName];
    setValue(fieldName, updatedList, { shouldDirty: true });
  };

  const isAabi = irrigationType === 'aabi';
  const isDim = irrigationType === 'dim';

  return (
    <div className="space-y-4">
      {/* کاربری و محصول */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            کاربری زمین
          </label>
          <select
            {...register('landType')}
            disabled={isSubmitting}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
          >
            <option value="">انتخاب کنید...</option>
            {landTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع محصول
          </label>
          <div className="relative">
            <Sprout
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              {...register('crop')}
              disabled={isSubmitting}
              className="w-full pr-9 pl-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">انتخاب کنید...</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.name}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* نوع آبیاری */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نوع آبیاری
        </label>
        <div className="grid grid-cols-2 gap-3">
          {irrigationTypes.map((type) => {
            const Icon = irrigationIcons[type.id] || Leaf;
            const isActive = irrigationType === type.id;

            return (
              <label
                key={type.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                  ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
                `}
              >
                <input
                  {...register('irrigationType')}
                  type="radio"
                  value={type.id}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <Icon
                  size={20}
                  className={
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }
                />
                <span className="text-sm font-medium">{type.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ✅ بخش منبع آب و سیستم آبیاری - فقط در حالت آبی */}
      {isAabi && (
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-4">
          {/* سرتیتر */}
          <div className="flex items-center gap-2 pb-2 border-b border-blue-200">
            <Droplets size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              اطلاعات آبیاری
            </span>
          </div>

          {/* منبع تأمین آب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              منبع تأمین آب <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {waterSources.map((source) => {
                const isChecked = selectedWaterSources.includes(source.name);
                return (
                  <label
                    key={source.id}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg border cursor-pointer
                      transition-all duration-200 text-sm
                      ${
                        isChecked
                          ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                      ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        handleCheckboxChange('waterSources', source.name)
                      }
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                    <span
                      className={`
                        flex-shrink-0 w-4 h-4 rounded flex items-center justify-center
                        ${
                          isChecked
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300'
                        }
                      `}
                    >
                      {isChecked && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span className="truncate">{source.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.waterSources && (
              <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.waterSources.message}
              </p>
            )}
          </div>

          {/* سیستم آبیاری */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Layers size={14} className="text-blue-600" />
              سیستم آبیاری
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {irrigationSystems.map((system) => {
                const isChecked = selectedIrrigationSystems.includes(
                  system.name
                );
                return (
                  <label
                    key={system.id}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg border cursor-pointer
                      transition-all duration-200 text-sm
                      ${
                        isChecked
                          ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                      ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        handleCheckboxChange(
                          'irrigationSystems',
                          system.name
                        )
                      }
                      disabled={isSubmitting}
                      className="sr-only"
                    />
                    <span
                      className={`
                        flex-shrink-0 w-4 h-4 rounded flex items-center justify-center
                        ${
                          isChecked
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300'
                        }
                      `}
                    >
                      {isChecked && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span className="truncate">{system.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* پیام برای حالت دیم */}
      {isDim && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <CloudRain
            size={16}
            className="text-amber-600 flex-shrink-0 mt-0.5"
          />
          <div className="text-xs text-amber-800">
            <div className="font-medium mb-0.5">زمین دیم</div>
            <div>
              زمین دیم نیازی به منبع تأمین آب و سیستم آبیاری ندارد.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};