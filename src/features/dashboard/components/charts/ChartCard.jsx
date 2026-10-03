// src/features/dashboard/components/charts/ChartCard.jsx
import React from 'react';

const COLOR_THEMES = {
  primary: {
    bg: 'from-primary-500/15 to-primary-700/5',
    icon: 'text-primary-600',
    border: 'border-primary-300/40',
  },
  blue: {
    bg: 'from-blue-500/15 to-blue-700/5',
    icon: 'text-blue-600',
    border: 'border-blue-300/40',
  },
  amber: {
    bg: 'from-amber-500/15 to-amber-700/5',
    icon: 'text-amber-600',
    border: 'border-amber-300/40',
  },
  purple: {
    bg: 'from-purple-500/15 to-purple-700/5',
    icon: 'text-purple-600',
    border: 'border-purple-300/40',
  },
  emerald: {
    bg: 'from-emerald-500/15 to-emerald-700/5',
    icon: 'text-emerald-600',
    border: 'border-emerald-300/40',
  },
};

const ChartCard = ({
  title,
  subtitle,
  icon: Icon,
  color = 'primary',
  children,
  action = null,
  delayClass = '',
}) => {
  const theme = COLOR_THEMES[color] || COLOR_THEMES.primary;

  return (
    <div
      className={`
        relative flex flex-col
        p-4 md:p-5 rounded-2xl
        bg-white/60 backdrop-blur-xl
        border border-white/70
        shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
        transition-shadow duration-200
        hover:shadow-[0_8px_32px_rgba(31,38,135,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]
        animate-fadeInUp
        ${delayClass}
      `}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div
              className={`
                w-9 h-9 rounded-xl
                bg-gradient-to-br ${theme.bg}
                border ${theme.border}
                flex items-center justify-center
                flex-shrink-0
                shadow-sm
              `}
            >
              <Icon size={16} strokeWidth={2.2} className={theme.icon} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
};

export default React.memo(ChartCard);