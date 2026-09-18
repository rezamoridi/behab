// src/features/dashboard/components/FarmsStatsBar.jsx
import React, { useMemo } from 'react';
import { MapPin, Ruler, Home } from 'lucide-react';

const formatNumber = (value, decimals = 0) => {
  const num = Number(value) || 0;
  return num.toLocaleString('fa-IR', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
};

// ============================================================
// StatPill — یک آمار کوچک
// ============================================================
const StatPill = ({ icon: Icon, label, value, unit, color }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
    <span
      className={`
        w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0
        ${color}
      `}
    >
      <Icon size={12} strokeWidth={2.4} />
    </span>
    <span className="flex items-baseline gap-1">
      <span className="text-sm font-bold text-gray-800" dir="ltr">
        {value}
      </span>
      {unit && (
        <span className="text-[10px] text-gray-400">{unit}</span>
      )}
      <span className="text-[10px] text-gray-400 mr-1">{label}</span>
    </span>
  </div>
);

// ============================================================
// FarmsStatsBar — نوار خلاصه بالای جدول
// ============================================================
const FarmsStatsBar = ({ farms = [] }) => {
  const stats = useMemo(() => {
    let totalArea = 0;
    const villages = new Set();

    farms.forEach((f) => {
      totalArea += Number(f.area_ha) || 0;
      if (f.village) villages.add(f.village);
    });

    return {
      count: farms.length,
      totalArea,
      villages: villages.size,
    };
  }, [farms]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <StatPill
        icon={MapPin}
        label="زمین"
        value={formatNumber(stats.count)}
        color="text-emerald-700 bg-emerald-50"
      />
      <StatPill
        icon={Ruler}
        label="هکتار"
        value={formatNumber(stats.totalArea, 2)}
        color="text-blue-700 bg-blue-50"
      />
      <StatPill
        icon={Home}
        label="روستا"
        value={formatNumber(stats.villages)}
        color="text-violet-700 bg-violet-50"
      />
    </div>
  );
};

export default React.memo(FarmsStatsBar);