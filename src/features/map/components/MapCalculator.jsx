// src/features/map/components/MapCalculator.jsx
import React from 'react';
import { Ruler, Droplet } from 'lucide-react';

const MapCalculator = ({
  polygonCount = 0,
  areaHa = 0,
  waterVolume = 0,
  showWater = true,
}) => {
  if (polygonCount === 0) return null;

  const formattedArea = areaHa.toLocaleString('fa-IR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const formattedWater = waterVolume.toLocaleString('fa-IR');

  return (
    <div
      className="
        absolute bottom-20 left-3 z-[1000]
        min-w-[200px] px-6 py-3
        bg-white/85 backdrop-blur-md
        rounded-2xl
        shadow-lg border border-white/30
        flex flex-col items-center gap-1
        pointer-events-none select-none
        font-vazir
      "
      dir="rtl"
      role="status"
    >
      <div className="flex items-center gap-2">
        <Ruler size={18} className="text-primary-600" strokeWidth={2} />
        <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
          <span className="text-primary-700 font-bold text-lg">
            {polygonCount}
          </span>
          <span className="text-gray-500 text-xs">قطعه</span>
          <span className="text-gray-300 mx-1.5">|</span>
          <span
            className="text-blue-600 font-semibold text-lg"
            style={{ direction: 'ltr' }}
          >
            {formattedArea}
          </span>
          <span className="text-gray-400 text-xs">هکتار</span>
        </div>
      </div>

      {showWater && waterVolume > 0 && (
        <>
          <div className="w-4/5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-0.5" />
          <div className="flex items-center gap-2">
            <Droplet size={16} className="text-blue-600" strokeWidth={2} />
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-500 text-xs">آب مورد نیاز:</span>
              <span
                className="text-blue-700 font-semibold"
                style={{ direction: 'ltr' }}
              >
                {formattedWater}
              </span>
              <span className="text-gray-400 text-xs">m³</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(MapCalculator);