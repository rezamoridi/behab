// src/features/map/components/MapCalculator.jsx
import React, { useState, useMemo } from "react";
import {
  Ruler,
  Droplet,
  Sprout,
  AlertCircle,
  ChevronDown,
  EyeOff,
  Calculator,
} from "lucide-react";
import { useActiveCrops } from "../../settings/hooks/useActiveCrops";

const MapCalculator = ({ polygonCount = 0, areaHa = 0, showWater = true }) => {
  // ✅ محصول انتخابی کاربر
  const [selectedCropName, setSelectedCropName] = useState("");

  // ✅ حالت hide/show
  const [isOpen, setIsOpen] = useState(true);

  // ✅ نرخ محصولات از DB
  const {
    crops: dbCrops,
    getRequirement,
    isLoading: cropsLoading,
  } = useActiveCrops();

  // ✅ نرخ بر اساس انتخاب کاربر (بدون default)
  const activeRequirement = useMemo(() => {
    if (!selectedCropName) return null;
    return getRequirement(selectedCropName);
  }, [selectedCropName, getRequirement]);

  // ✅ آیا نرخ واقعی از DB داریم؟
  const hasRealRequirement = activeRequirement !== null;

  // ✅ محاسبه آب — فقط وقتی محصول انتخاب شده و نرخ داره
  const waterVolume = useMemo(() => {
    if (areaHa <= 0) return 0;
    if (activeRequirement === null) return 0;
    return areaHa * activeRequirement;
  }, [areaHa, activeRequirement]);

  if (polygonCount === 0) return null;

  const formattedArea = areaHa.toLocaleString("fa-IR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const formattedWater = waterVolume.toLocaleString("fa-IR");

  // ============================================================
  // حالت بسته — فقط دکمه کوچک
  // ============================================================
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="
          absolute bottom-20 left-3 z-[1000]
          flex items-center gap-2 px-3 py-2
          bg-white/95 backdrop-blur-md
          rounded-xl shadow-lg border border-gray-200/60
          text-xs font-semibold text-gray-700 font-vazir
          hover:bg-white hover:shadow-xl hover:scale-105
          transition-all duration-200
        "
        title="نمایش ماشین‌حساب"
      >
        <Calculator size={14} className="text-primary-600" strokeWidth={2.4} />
        <span>ماشین‌حساب</span>
        <span className="text-[10px] text-gray-400">({polygonCount} قطعه)</span>
      </button>
    );
  }

  // ============================================================
  // حالت باز — کارت کامل
  // ============================================================
  return (
    <div
      className="
        absolute bottom-20 left-3 z-[1000]
        w-[250px] max-w-[300px] p-3.5
        bg-white/95 backdrop-blur-md
        rounded-2xl
        shadow-xl border border-gray-200/60
        flex flex-col gap-2.5
        font-vazir
      "
      dir="rtl"
      role="status"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ============================================ */}
      {/* Header — دکمه بستن */}
      {/* ============================================ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calculator
            size={13}
            className="text-primary-600"
            strokeWidth={2.4}
          />
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            ماشین‌حساب
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="
            p-1 rounded-md text-gray-400
            hover:bg-gray-100 hover:text-gray-700
            transition-colors
          "
          title="بستن"
          aria-label="بستن ماشین‌حساب"
        >
          <EyeOff size={13} strokeWidth={2.4} />
        </button>
      </div>

      {/* ============================================ */}
      {/* ردیف ۱: تعداد قطعات + مساحت */}
      {/* ============================================ */}
      <div className="flex items-center gap-1.5">
        <Ruler
          size={15}
          className="text-primary-600 flex-shrink-0"
          strokeWidth={2}
        />
        <div className="flex items-center gap-1 text-xs text-gray-700 font-medium">
          <span className="text-primary-700 font-bold text-base">
            {polygonCount}
          </span>
          <span className="text-gray-500 text-[10px]">قطعه</span>
          <span className="text-gray-300 mx-1">|</span>
          <span
            className="text-blue-600 font-semibold text-base"
            style={{ direction: "ltr" }}
          >
            {formattedArea}
          </span>
          <span className="text-gray-400 text-[10px]">هکتار</span>
        </div>
      </div>

      {/* ============================================ */}
      {/* انتخاب محصول */}
      {/* ============================================ */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1 text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
          <Sprout size={10} strokeWidth={2.4} className="text-emerald-600" />
          محاسبه بر اساس محصول
        </label>

        <div className="relative">
          <select
            value={selectedCropName}
            onChange={(e) => setSelectedCropName(e.target.value)}
            disabled={cropsLoading}
            className="
    w-full pr-2.5 pl-7 py-1.5 rounded-lg
    bg-white border border-gray-200
    text-xs font-vazir font-medium text-gray-800
    focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100
    outline-none transition-all
    cursor-pointer
    disabled:opacity-60 disabled:cursor-wait
    appearance-none
  "
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
              backgroundImage: "none",
            }}
          >
            <option value="">
              {cropsLoading ? "در حال بارگذاری..." : "انتخاب کنید..."}
            </option>
            {dbCrops.map((crop) => (
              <option key={crop.id} value={crop.name}>
                {crop.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* نمایش نرخ محصول انتخاب‌شده */}
        {selectedCropName && (
          <div className="flex items-center justify-between gap-2 text-[10px] px-2 py-0.5 rounded-md bg-emerald-50/60 border border-emerald-100">
            <span className="text-emerald-700 font-medium truncate">
              {selectedCropName}
            </span>
            {hasRealRequirement ? (
              <span
                className="font-semibold text-emerald-800 whitespace-nowrap"
                style={{ direction: "ltr" }}
              >
                {Number(activeRequirement).toLocaleString("fa-IR")} m³/ha
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 whitespace-nowrap">
                <AlertCircle size={9} strokeWidth={2.4} />
                نرخ تعریف نشده
              </span>
            )}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* آب مورد نیاز — فقط وقتی نرخ داریم */}
      {/* ============================================ */}
      {showWater && waterVolume > 0 && (
        <>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex-shrink-0">
                <Droplet size={12} strokeWidth={2.4} />
              </div>
              <span className="text-[10px] text-gray-500">آب مورد نیاز:</span>
            </div>
            <div
              className="flex items-baseline gap-1"
              style={{ direction: "ltr" }}
            >
              <span className="text-blue-700 font-bold text-sm">
                {formattedWater}
              </span>
              <span className="text-gray-400 text-[9px]">m³</span>
            </div>
          </div>
        </>
      )}

      {/* ============================================ */}
      {/* پیام راهنما — وقتی محصولی انتخاب نشده */}
      {/* ============================================ */}
      {!selectedCropName && (
        <>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 rounded-md px-2 py-1.5">
            <AlertCircle
              size={10}
              strokeWidth={2.4}
              className="text-gray-400"
            />
            <span>برای محاسبه، محصولی را انتخاب کنید</span>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(MapCalculator);
