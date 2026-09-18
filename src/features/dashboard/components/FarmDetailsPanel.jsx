// src/features/dashboard/components/FarmDetailsPanel.jsx
import React from 'react';
import {
  X,
  User,
  MapPin,
  Wheat,
  Droplet,
  Ruler,
  Phone,
  CreditCard,
  Layers,
} from 'lucide-react';
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from '../../settings/constants/cropColors';

// ============================================================
// InfoRow — بیرون از کامپوننت اصلی (جلوگیری از خطای React)
// ============================================================
const InfoRow = ({ icon: Icon, label, value, valueClass = '' }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
    <span className="flex items-center gap-2 text-xs text-gray-500">
      <Icon size={13} />
      {label}
    </span>
    <span className={`text-sm font-medium text-gray-800 ${valueClass}`}>
      {value || '—'}
    </span>
  </div>
);

// ============================================================
// SectionHeader
// ============================================================
const SectionHeader = ({ children }) => (
  <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1 mt-3">
    {children}
  </h4>
);

// ============================================================
// FarmDetailsPanel — پنل جزئیات مزرعه
// ============================================================
const FarmDetailsPanel = ({ farm, onClose }) => {
  if (!farm) return null;

  const cropColor = normalizeHex(farm.crop_color) || DEFAULT_FARM_COLOR;
  const area = Number(farm.area_ha) || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-primary-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {farm.farmer_name || 'بدون نام'}
            </h3>
            <p
              className="text-[10px] text-gray-400 font-mono truncate"
              dir="ltr"
            >
              {farm.farm_id}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"
          aria-label="بستن پنل"
        >
          <X size={16} />
        </button>
      </div>

      {/* ─── Body ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* مساحت */}
        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
          <span className="text-xs text-primary-700 flex items-center gap-1.5">
            <Ruler size={13} />
            مساحت کل
          </span>
          <span
            className="text-base font-bold text-primary-700"
            dir="ltr"
          >
            {area.toLocaleString('fa-IR', { maximumFractionDigits: 2 })}
            <span className="text-xs font-normal mr-1">ha</span>
          </span>
        </div>

        {/* محصول */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-600 flex items-center gap-1.5">
            <Wheat size={13} />
            محصول
          </span>
          <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <span
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: cropColor }}
            />
            {farm.crop || '—'}
          </span>
        </div>

        {/* اطلاعات کشاورز */}
        <div>
          <SectionHeader>اطلاعات کشاورز</SectionHeader>
          <InfoRow icon={User} label="نام" value={farm.farmer_name} />
          <InfoRow
            icon={CreditCard}
            label="کد ملی"
            value={farm.national_id}
            valueClass="font-mono"
          />
          <InfoRow
            icon={Phone}
            label="تلفن"
            value={farm.phone_number}
            valueClass="font-mono"
          />
        </div>

        {/* موقعیت */}
        <div>
          <SectionHeader>موقعیت</SectionHeader>
          <InfoRow icon={MapPin} label="استان" value={farm.province} />
          <InfoRow icon={MapPin} label="شهرستان" value={farm.county} />
          <InfoRow icon={MapPin} label="بخش" value={farm.bakhsh} />
          <InfoRow icon={MapPin} label="دهستان" value={farm.dehestan} />
          <InfoRow icon={MapPin} label="روستا" value={farm.village} />
        </div>

        {/* زمین و آب */}
        <div>
          <SectionHeader>زمین و آب</SectionHeader>
          <InfoRow icon={Layers} label="کاربری" value={farm.land_type} />
          <InfoRow
            icon={Droplet}
            label="نوع آبیاری"
            value={farm.irrigation_type}
          />
          <InfoRow
            icon={Droplet}
            label="منبع آب"
            value={farm.water_source}
          />
          <InfoRow
            icon={Droplet}
            label="سیستم آبیاری"
            value={farm.irrigation_system}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(FarmDetailsPanel);