// src/features/dashboard/components/AquiferKpiCard.jsx
import React from 'react';

// ============================================================
// AquiferKpiCard — کارت KPI تک
// ============================================================
const AquiferKpiCard = ({
  icon: Icon,
  label,
  value,
  unit,
  color = 'text-gray-700 bg-gray-100',
  subtitle,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium text-gray-500 mb-1.5">
            {label}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-xl font-bold text-gray-900"
              dir="ltr"
            >
              {value}
            </span>
            {unit && (
              <span className="text-[10px] text-gray-400 font-normal">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-[10px] text-gray-400 mt-1">
              {subtitle}
            </div>
          )}
        </div>

        <div
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${color}
          `}
        >
          {Icon && <Icon size={18} strokeWidth={2.2} />}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AquiferKpiCard);