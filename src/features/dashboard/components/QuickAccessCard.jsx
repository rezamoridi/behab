// src/features/dashboard/components/QuickAccessCard.jsx
import React from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * QuickAccessCard
 * یک کارت دسترسی سریع در داشبورد
 */
const QuickAccessCard = ({
  icon: Icon,
  title,
  description,
  color = 'primary',
  onClick,
}) => {
  const colorClasses = {
    primary: 'from-primary-500/20 to-primary-700/5 text-primary-600 border-primary-300/40',
    blue: 'from-blue-500/20 to-blue-700/5 text-blue-600 border-blue-300/40',
    purple: 'from-purple-500/20 to-purple-700/5 text-purple-600 border-purple-300/40',
    amber: 'from-amber-500/20 to-amber-700/5 text-amber-600 border-amber-300/40',
    emerald: 'from-emerald-500/20 to-emerald-700/5 text-emerald-600 border-emerald-300/40',
    rose: 'from-rose-500/20 to-rose-700/5 text-rose-600 border-rose-300/40',
  };

  const cls = colorClasses[color] || colorClasses.primary;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative flex flex-col items-start gap-3
        p-4 rounded-2xl text-right
        bg-white/60 backdrop-blur-xl
        border border-white/60
        shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
        hover:bg-white/80 hover:shadow-[0_8px_32px_rgba(31,38,135,0.15),inset_0_1px_0_rgba(255,255,255,0.9)]
        hover:-translate-y-0.5
        transition-all duration-200
        cursor-pointer
      `}
    >
      {/* icon */}
      <div
        className={`
          w-11 h-11 rounded-xl
          bg-gradient-to-br ${cls}
          border
          flex items-center justify-center
          shadow-sm
        `}
      >
        <Icon size={20} strokeWidth={2.2} />
      </div>

      {/* متن */}
      <div className="w-full">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          {title}
        </h4>
        {description && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* فلش */}
      <ChevronLeft
        size={14}
        className="
          absolute top-4 left-4
          text-gray-300
          group-hover:text-gray-500 group-hover:-translate-x-0.5
          transition-all
        "
      />
    </button>
  );
};

export default React.memo(QuickAccessCard);