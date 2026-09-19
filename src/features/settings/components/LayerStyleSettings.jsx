// src/features/settings/components/LayerStyleSettings.jsx
import { useState } from 'react';
import {
  Layers,
  Palette,
  RotateCcw,
  Eye,
  Sliders,
  Wand2,
  Paintbrush,
  Sparkles,
  Info,
  AlertTriangle,
} from 'lucide-react';

import {
  useLayerStyle,
  LINE_STYLE_OPTIONS,
  getDashArray,
} from '../hooks/useLayerStyle';

// ============================================================
// Slider Control
// ============================================================
const SliderControl = ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  icon: Icon,
  onChange,
  hint,
  format = (v) => v,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
          {Icon && <Icon size={14} className="text-gray-400" />}
          {label}
        </label>
        <span
          className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-lg tabular-nums"
          dir="ltr"
        >
          {format(value)}
          {unit && (
            <span className="text-[10px] text-primary-500 mr-0.5">
              {unit}
            </span>
          )}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
          accent-primary-600
        "
      />

      {hint && (
        <p className="text-[10px] text-gray-400 leading-relaxed">{hint}</p>
      )}
    </div>
  );
};

// ============================================================
// Color Swatch + Picker
// ============================================================
const ColorSwatch = ({ value, onChange, label = '' }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="relative cursor-pointer">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <div
          className="
            w-10 h-10 rounded-xl border-2 border-white shadow-md
            ring-1 ring-gray-200 cursor-pointer
            hover:ring-2 hover:ring-primary-300 transition-all
          "
          style={{ backgroundColor: value }}
          title={label || value}
        />
      </label>
      <span
        className="
          text-[11px] font-mono text-gray-600 bg-gray-50
          px-2 py-1 rounded-md border border-gray-100
        "
        dir="ltr"
      >
        {value.toUpperCase()}
      </span>
    </div>
  );
};

// ============================================================
// ✅ Stroke Color Control — Checkbox + Optional Color Picker
// ============================================================
const StrokeColorControl = ({
  customStroke,
  color,
  onCustomChange,
  onColorChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
          <Palette size={14} className="text-gray-400" />
          رنگ مرز
        </label>
        <span className="text-[10px] text-gray-400">
          رنگ داخل همیشه از محصول
        </span>
      </div>

      {/* Checkbox */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={customStroke}
          onChange={(e) => onCustomChange(e.target.checked)}
          className="
            w-4 h-4 rounded border-gray-300 text-primary-600
            focus:ring-2 focus:ring-primary-500/30
            cursor-pointer accent-primary-600
          "
        />
        <span className="text-xs text-gray-700">
          رنگ مرز را دستی تعیین کن
        </span>
      </label>

      {/* محتوا: ColorPicker یا پیام پیش‌فرض */}
      {customStroke ? (
        <div className="flex items-center justify-between pt-1 animate-fadeIn">
          <span className="text-[11px] text-gray-500">
            رنگ مرز انتخابی:
          </span>
          <ColorSwatch value={color} onChange={onColorChange} />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
          <Wand2 size={13} className="text-gray-400 flex-shrink-0" />
          <span className="text-[11px] text-gray-500 leading-relaxed">
            رنگ مرز = رنگ محصول (مثلاً گندم زرد، ذرت نارنجی)
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Line Style Selector
// ============================================================
const LineStyleControl = ({
  value,
  onChange,
  label = 'نوع خط',
  color = '#2E7D32',
}) => {
  const options = LINE_STYLE_OPTIONS;

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
        <Sliders size={14} className="text-gray-400" />
        {label}
      </label>

      <div className="grid grid-cols-5 gap-2">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                group relative flex flex-col items-center gap-2
                py-2.5 px-1.5 rounded-xl border-2
                transition-all duration-150
                ${
                  isActive
                    ? 'bg-primary-50 border-primary-400 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }
              `}
              title={opt.label}
              aria-pressed={isActive}
            >
              <svg
                width="100%"
                height="10"
                viewBox="0 0 40 10"
                className="overflow-visible"
              >
                <line
                  x1="2"
                  y1="5"
                  x2="38"
                  y2="5"
                  stroke={isActive ? color : '#9CA3AF'}
                  strokeWidth="2.5"
                  strokeDasharray={opt.dashArray || undefined}
                  strokeLinecap="round"
                />
              </svg>

              <span
                className={`
                  text-[9px] font-semibold leading-tight text-center
                  ${
                    isActive
                      ? 'text-primary-700'
                      : 'text-gray-500 group-hover:text-gray-700'
                  }
                `}
              >
                {opt.label}
              </span>

              {isActive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// Section Header
// ============================================================
const SectionHeader = ({ icon: Icon, title, subtitle, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="flex items-center gap-3 pb-4 mb-5 border-b border-gray-100">
      <div
        className={`
          w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
          ${colorClasses[color] || colorClasses.primary}
        `}
      >
        <Icon size={16} strokeWidth={2.4} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// FarmShapeSVG — overlay روی عکس ماهواره‌ای
// ============================================================
const FarmShapeSVG = ({
  fill,
  stroke,
  weight,
  dashArray,
  opacity = 1,
  idSuffix = 'default',
}) => {
  const shadowId = `preview-shadow-${idSuffix}`;

  const farmPoints = `
    60,40
    120,28
    160,42
    170,80
    150,110
    100,122
    55,112
    35,82
    40,55
  `;

  return (
    <svg
      viewBox="0 0 200 130"
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter
          id={shadowId}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dx="0" dy="1" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.4" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* سایه ملایم */}
      <polygon
        points={farmPoints}
        fill="none"
        stroke="#000"
        strokeWidth={weight + 2}
        strokeLinejoin="round"
        opacity="0.15"
        filter={`url(#${shadowId})`}
      />

      {/* پلی‌گون اصلی */}
      <polygon
        points={farmPoints}
        fill={fill}
        stroke={stroke}
        strokeWidth={weight}
        strokeDasharray={dashArray || undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={opacity}
      />

      {/* نقاط گوشه (حالت انتخاب) */}
      {weight >= 3 && (
        <g opacity={opacity}>
          {farmPoints
            .trim()
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((pair, i) => {
              const [x, y] = pair
                .split(',')
                .map((n) => Number(n.trim()));
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#fff"
                    stroke={stroke}
                    strokeWidth="1.5"
                  />
                  <circle cx={x} cy={y} r="1.5" fill={stroke} />
                </g>
              );
            })}
        </g>
      )}
    </svg>
  );
};

// ============================================================
// Preview Card
//
// عکس در public/images/farm-preview.webp قرار دارد.
// ============================================================
const PreviewCard = ({
  label,
  fill,
  stroke,
  weight,
  dashArray,
  opacity = 1,
  idSuffix,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-600">
          {label}
        </span>
      </div>

      <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 isolate">
        {/* 1. Fallback grid */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
            backgroundSize: '12px 12px',
            backgroundColor: '#F3F4F6',
          }}
        />

        {/* 2. عکس ماهواره‌ای — مسیر: /images/farm-preview.webp */}
        <img
          src="/images/farm-preview.webp"
          alt="پیش‌نمایش زمین"
          className="absolute inset-0 w-full h-full object-cover z-[1]"
          loading="lazy"
          onError={(e) => {
            console.warn(
              'farm-preview.webp not found at /images/'
            );
            e.target.style.display = 'none';
          }}
        />

        {/* 3. SVG overlay */}
        <FarmShapeSVG
          fill={fill}
          stroke={stroke}
          weight={weight}
          dashArray={dashArray}
          opacity={opacity}
          idSuffix={idSuffix}
        />

        {/* 4. Badge */}
        <div className="absolute top-2 right-2 z-[3] px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-medium rounded-md flex items-center gap-1">
          🛰 پیش‌نمایش
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LayerStyleSettings
// ============================================================
const LayerStyleSettings = () => {
  const { style, updateField, resetStyle } = useLayerStyle();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetStyle();
    setShowResetConfirm(false);
  };

  // رنگ مؤثر مرز برای Preview
  const effectiveStrokeColor = style.customStrokeColor
    ? style.strokeColor
    : '#4CAF50'; // رنگ محصول پیش‌فرض برای Preview

  return (
    <div className="space-y-5" dir="rtl">
      {/* ═══════════════════════════════════════════════ */}
      {/* Header Card                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-primary-100 flex items-center justify-center flex-shrink-0">
              <Sparkles
                size={20}
                className="text-primary-600"
                strokeWidth={2.2}
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">
                ظاهر لایه‌های مزرعه روی نقشه
              </h2>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md">
                شفافیت، رنگ مرز و نوع خط لایه‌ها را تنظیم کنید. رنگ
                داخل لایه همیشه از رنگ محصول گرفته می‌شود.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="
              flex items-center gap-2 px-4 py-2.5
              text-xs font-semibold text-gray-700
              bg-white hover:bg-gray-50
              border border-gray-200 hover:border-gray-300
              rounded-xl shadow-sm
              transition-all whitespace-nowrap
            "
            title="بازگشت به پیش‌فرض"
          >
            <RotateCcw size={14} strokeWidth={2.4} />
            بازنشانی
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* Main Grid                                      */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ─── حالت عادی ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader
            icon={Layers}
            title="حالت عادی"
            subtitle="ظاهر لایه‌ها وقتی انتخاب نشده‌اند"
          />

          <div className="space-y-6">
            <StrokeColorControl
              customStroke={style.customStrokeColor}
              color={style.strokeColor}
              onCustomChange={(v) => updateField('customStrokeColor', v)}
              onColorChange={(v) => updateField('strokeColor', v)}
            />

            <LineStyleControl
              value={style.strokeStyle}
              onChange={(v) => updateField('strokeStyle', v)}
              color={effectiveStrokeColor}
            />

            <div className="h-px bg-gray-100" />

            <SliderControl
              label="شفافیت داخل"
              value={style.fillOpacity}
              min={0}
              max={1}
              step={0.05}
              icon={Eye}
              onChange={(v) => updateField('fillOpacity', v)}
              format={(v) =>
                Number(v).toLocaleString('fa-IR', {
                  maximumFractionDigits: 2,
                })
              }
              hint="۰ = کاملاً شفاف، ۱ = کاملاً پر"
            />

            <SliderControl
              label="ضخامت خط مرزی"
              value={style.strokeWeight}
              min={0.5}
              max={8}
              step={0.5}
              unit="px"
              icon={Sliders}
              onChange={(v) => updateField('strokeWeight', v)}
              format={(v) =>
                Number(v).toLocaleString('fa-IR', {
                  maximumFractionDigits: 1,
                })
              }
            />

            <SliderControl
              label="شفافیت خط مرزی"
              value={style.strokeOpacity}
              min={0}
              max={1}
              step={0.05}
              icon={Sliders}
              onChange={(v) => updateField('strokeOpacity', v)}
              format={(v) =>
                Number(v).toLocaleString('fa-IR', {
                  maximumFractionDigits: 2,
                })
              }
            />
          </div>
        </div>

        {/* ─── حالت انتخاب‌شده ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <SectionHeader
            icon={Eye}
            title="حالت انتخاب‌شده"
            subtitle="ظاهر لایه وقتی روی آن کلیک می‌شود"
            color="amber"
          />

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
                <Palette size={14} className="text-gray-400" />
                رنگ خط انتخاب
              </label>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  رنگ خط قاب انتخاب‌شده:
                </span>
                <ColorSwatch
                  value={style.selectedStrokeColor}
                  onChange={(v) => updateField('selectedStrokeColor', v)}
                />
              </div>
            </div>

            <LineStyleControl
              value={style.selectedStrokeStyle}
              onChange={(v) => updateField('selectedStrokeStyle', v)}
              label="نوع خط انتخاب"
              color={style.selectedStrokeColor}
            />

            <div className="h-px bg-gray-100" />

            <SliderControl
              label="ضخامت خط انتخاب"
              value={style.selectedStrokeWeight}
              min={1}
              max={10}
              step={0.5}
              unit="px"
              icon={Sliders}
              onChange={(v) => updateField('selectedStrokeWeight', v)}
              format={(v) =>
                Number(v).toLocaleString('fa-IR', {
                  maximumFractionDigits: 1,
                })
              }
            />

            <SliderControl
              label="شفافیت داخل انتخاب"
              value={style.selectedFillOpacity}
              min={0}
              max={1}
              step={0.05}
              icon={Eye}
              onChange={(v) => updateField('selectedFillOpacity', v)}
              format={(v) =>
                Number(v).toLocaleString('fa-IR', {
                  maximumFractionDigits: 2,
                })
              }
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* Preview                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <SectionHeader
          icon={Layers}
          title="پیش‌نمایش"
          subtitle="چطور روی نقشه دیده می‌شود"
        />

        <div className="grid grid-cols-2 gap-5">
          <PreviewCard
            label="عادی"
            fill={`rgba(76, 175, 80, ${style.fillOpacity})`}
            stroke={effectiveStrokeColor}
            weight={style.strokeWeight}
            dashArray={getDashArray(style.strokeStyle)}
            opacity={style.strokeOpacity}
            idSuffix="normal"
          />

          <PreviewCard
            label="انتخاب‌شده"
            fill={`rgba(76, 175, 80, ${style.selectedFillOpacity})`}
            stroke={style.selectedStrokeColor}
            weight={style.selectedStrokeWeight}
            dashArray={getDashArray(style.selectedStrokeStyle)}
            idSuffix="selected"
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
          <Info
            size={14}
            className="text-blue-600 flex-shrink-0 mt-0.5"
            strokeWidth={2.4}
          />
          <p className="text-[11px] text-blue-800 leading-relaxed">
            رنگ داخل لایه همیشه از رنگ محصول گرفته می‌شود. اگر گزینه{' '}
            <strong>«رنگ مرز را دستی تعیین کن»</strong> را فعال کنی،
            مرزهای همه‌ی مزارع با همان رنگ انتخاب‌شده نمایش داده
            می‌شوند.
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* Reset Confirm Modal                            */}
      {/* ═══════════════════════════════════════════════ */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowResetConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 animate-scaleIn">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} strokeWidth={2.4} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  بازگشت به پیش‌فرض
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  همه تنظیمات ظاهری به حالت اول برمی‌گردد. این عمل
                  قابل بازگشت نیست.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
              >
                بازنشانی کن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerStyleSettings;