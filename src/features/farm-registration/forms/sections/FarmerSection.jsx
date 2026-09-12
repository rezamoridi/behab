// src/features/farm-registration/forms/sections/FarmerSection.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertCircle, User, CreditCard, Phone } from 'lucide-react';

export const FarmerSection = ({ isSubmitting }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      {/* نام کشاورز */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          نام و نام خانوادگی کشاورز <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            {...register('farmerName')}
            type="text"
            placeholder="نام کامل"
            disabled={isSubmitting}
            className="w-full pr-9 pl-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
          />
        </div>
        {errors.farmerName && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.farmerName.message}
          </p>
        )}
      </div>

      {/* کد ملی و شماره تماس */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            کد ملی <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CreditCard
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register('nationalId')}
              type="text"
              maxLength={10}
              inputMode="numeric"
              placeholder="۱۰ رقم"
              disabled={isSubmitting}
              className="w-full pr-9 pl-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              style={{ direction: 'ltr', textAlign: 'right' }}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              {...register('phone')}
              type="tel"
              maxLength={11}
              inputMode="numeric"
              placeholder="۰۹xxxxxxxxx"
              disabled={isSubmitting}
              className="w-full pr-9 pl-3 py-2 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};