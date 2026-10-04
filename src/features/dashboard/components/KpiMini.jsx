// src/features/dashboard/components/KpiMini.jsx
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const COLOR_MAP = {
  primary: {
    icon: 'text-primary-600 bg-primary-500/15',
    hover: 'hover:bg-primary-500/10 hover:border-primary-400/50',
  },
  blue: {
    icon: 'text-blue-600 bg-blue-500/15',
    hover: 'hover:bg-blue-500/10 hover:border-blue-400/50',
  },
  amber: {
    icon: 'text-amber-600 bg-amber-500/15',
    hover: 'hover:bg-amber-500/10 hover:border-amber-400/50',
  },
  sky: {
    icon: 'text-sky-600 bg-sky-500/15',
    hover: 'hover:bg-sky-500/10 hover:border-sky-400/50',
  },
  purple: {
    icon: 'text-purple-600 bg-purple-500/15',
    hover: 'hover:bg-purple-500/10 hover:border-purple-400/50',
  },
  emerald: {
    icon: 'text-emerald-600 bg-emerald-500/15',
    hover: 'hover:bg-emerald-500/10 hover:border-emerald-400/50',
  },
};

const KpiMini = ({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  color = 'primary',
  onClick,
  actionLabel,
  compact = false,
}) => {
  const theme = COLOR_MAP[color] || COLOR_MAP.primary;
  const isInteractive = typeof onClick === 'function';
  const Wrapper = isInteractive ? 'button' : 'div';

  return (
    <Wrapper
      type={isInteractive ? 'button' : undefined}
      onClick={onClick}
      className={`
        group
        w-full flex flex-col gap-1.5
        ${compact ? 'p-2' : 'p-2.5'}
        rounded-xl
        border border-transparent
        transition-all duration-200
        text-right
        ${isInteractive ? `cursor-pointer ${theme.hover}` : ''}
      `}
      title={actionLabel || undefined}
    >
      {/* ردیف ۱: icon + label + trend */}
      <div className="flex items-center gap-2 w-full">
        <div
          className={`
            ${compact ? 'w-7 h-7' : 'w-8 h-8'}
            rounded-lg flex items-center justify-center flex-shrink-0
            ${theme.icon}
            transition-transform duration-200
            ${isInteractive ? 'group-hover:scale-110' : ''}
          `}
        >
          <Icon size={compact ? 13 : 14} strokeWidth={2.2} />
        </div>

        <span
          className={`
            text-[10px] text-slate-500 font-medium truncate flex-1
            leading-tight
          `}
        >
          {label}
        </span>

        {/* trend - کنار label */}
        {trend !== null && trend !== undefined && (
          <span
            className={`
              text-[9px] font-bold px-1 py-0.5 rounded whitespace-nowrap flex-shrink-0
              ${trend >= 0
                ? 'text-emerald-700 bg-emerald-500/15'
                : 'text-rose-700 bg-rose-500/15'}
            `}
            dir="ltr"
          >
            {trend > 0 ? '+' : ''}
            {trend}%
          </span>
        )}

        {isInteractive && (
          <ArrowUpRight
            size={12}
            className="
              text-slate-300 flex-shrink-0
              opacity-0 group-hover:opacity-100
              group-hover:text-slate-600
              transition-all duration-200
            "
          />
        )}
      </div>

      {/* ردیف ۲: value + unit */}
      <div className="flex items-baseline gap-1 pr-1">
        <span
          className={`
            ${compact ? 'text-base' : 'text-lg'}
            font-bold text-slate-900 tabular-nums leading-none
          `}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
            {unit}
          </span>
        )}
      </div>
    </Wrapper>
  );
};

export default React.memo(KpiMini);