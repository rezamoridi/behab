// src/features/dashboard/components/KpiCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const COLOR_THEMES = {
  primary: {
    iconBg: 'bg-primary-500/15',
    iconColor: 'text-primary-600',
    accent: 'bg-primary-500',
  },
  blue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-600',
    accent: 'bg-blue-500',
  },
  amber: {
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-600',
    accent: 'bg-amber-500',
  },
  purple: {
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-600',
    accent: 'bg-purple-500',
  },
  emerald: {
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-600',
    accent: 'bg-emerald-500',
  },
  sky: {
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-600',
    accent: 'bg-sky-500',
  },
};

const KpiCard = ({
  icon: Icon,
  label,
  value,
  unit = '',
  color = 'primary',
  trend = null,
  subtitle = null,
  delayClass = '',
  onClick = null,
}) => {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.primary;

  // ─── Trend icon ───
  const TrendIcon =
    trend === null
      ? null
      : trend > 0
        ? TrendingUp
        : trend < 0
          ? TrendingDown
          : Minus;

  const trendColor =
    trend === null
      ? ''
      : trend > 0
        ? 'text-emerald-600 bg-emerald-500/15'
        : trend < 0
          ? 'text-rose-600 bg-rose-500/15'
          : 'text-slate-500 bg-slate-500/15';

  const Wrapper = onClick ? 'button' : 'div';
  const wrapperProps = onClick
    ? { type: 'button', onClick, className: 'text-right w-full' }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`
        group relative
        flex flex-col gap-3
        p-4 rounded-2xl
        bg-white/60 backdrop-blur-xl
        border border-white/70
        shadow-[0_4px_20px_rgba(31,38,135,0.06),inset_0_1px_0_rgba(255,255,255,0.95)]
        hover:bg-white/80 hover:shadow-[0_8px_24px_rgba(31,38,135,0.10)]
        transition-all duration-200
        ${onClick ? 'cursor-pointer card-hover-lift' : ''}
        animate-fadeInUp
        ${delayClass}
        ${wrapperProps.className || ''}
      `}
      dir="rtl"
    >
      {/* نوار رنگی کناری */}
      <div
        className={`
          absolute top-4 right-4 bottom-4 w-1 rounded-full
          ${theme.accent} opacity-0 group-hover:opacity-60
          transition-opacity
        `}
        aria-hidden="true"
      />

      {/* Header: icon + trend */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={`
            w-10 h-10 rounded-xl
            ${theme.iconBg}
            flex items-center justify-center
            transition-transform duration-200
            group-hover:scale-105
          `}
        >
          <Icon size={18} strokeWidth={2.2} className={theme.iconColor} />
        </div>

        {trend !== null && TrendIcon && (
          <div
            className={`
              flex items-center gap-1 px-2 py-1 rounded-lg
              text-[11px] font-bold
              ${trendColor}
            `}
            dir="ltr"
            title={`${trend > 0 ? '+' : ''}${trend}% نسبت به ماه قبل`}
          >
            <TrendIcon size={11} strokeWidth={2.5} />
            <span>
              {trend > 0 ? '+' : ''}
              {trend.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}%
            </span>
          </div>
        )}
      </div>

      {/* متن */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] text-slate-500 font-medium truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-xl font-bold text-slate-900 tabular-nums leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-[11px] text-slate-500 font-medium">
              {unit}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] text-slate-400 truncate mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </Wrapper>
  );
};

export default React.memo(KpiCard);