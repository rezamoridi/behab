// src/features/dashboard/components/KpiCard.jsx
import React from 'react';

const COLOR_THEMES = {
  primary: {
    bg: 'from-primary-500/20 to-primary-700/5',
    icon: 'text-primary-600',
    border: 'border-primary-300/40',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-700/5',
    icon: 'text-blue-600',
    border: 'border-blue-300/40',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-700/5',
    icon: 'text-amber-600',
    border: 'border-amber-300/40',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-700/5',
    icon: 'text-purple-600',
    border: 'border-purple-300/40',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-700/5',
    icon: 'text-emerald-600',
    border: 'border-emerald-300/40',
  },
  rose: {
    bg: 'from-rose-500/20 to-rose-700/5',
    icon: 'text-rose-600',
    border: 'border-rose-300/40',
  },
};

const KpiCard = ({
  icon: Icon,
  label,
  value,
  unit = '',
  color = 'primary',
  trend = null,
  delayClass = '',
}) => {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.primary;

  return (
    <div
      className={`
        group relative
        flex flex-col gap-3
        p-4 md:p-5 rounded-2xl
        bg-white/60 backdrop-blur-xl
        border border-white/70
        shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
        hover:bg-white/85
        hover:shadow-[0_8px_32px_rgba(31,38,135,0.14),inset_0_1px_0_rgba(255,255,255,0.95)]
        card-hover-lift
        animate-fadeInUp
        ${delayClass}
      `}
      dir="rtl"
    >
      {/* آیکون */}
      <div
        className={`
          w-10 h-10 md:w-11 md:h-11 rounded-xl
          bg-gradient-to-br ${theme.bg}
          border ${theme.border}
          flex items-center justify-center
          shadow-sm
          transition-transform duration-200
          group-hover:scale-110
        `}
      >
        <Icon size={18} strokeWidth={2.2} className={theme.icon} />
      </div>

      {/* متن */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] md:text-xs text-slate-500 font-medium truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-[10px] md:text-xs text-slate-500 font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Trend */}
      {trend !== null && (
        <div
          className={`
            absolute top-3 left-3
            text-[10px] font-semibold
            px-1.5 py-0.5 rounded-md
            ${
              trend >= 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }
          `}
          dir="ltr"
        >
          {trend >= 0 ? '+' : ''}
          {trend}%
        </div>
      )}
    </div>
  );
};

export default React.memo(KpiCard);