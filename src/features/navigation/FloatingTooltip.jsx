// src/shared/components/Tooltip/FloatingTooltip.jsx
import React from 'react';

const FloatingTooltip = ({ label, visible }) => {
  if (!visible) return null;

  return (
    <div
      role="tooltip"
      className="
        pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2
        mb-2 px-2.5 py-1.5 rounded-lg
        bg-slate-800/90 backdrop-blur-md
        text-white text-[11px] font-medium font-vazir
        whitespace-nowrap
        border border-white/10
        shadow-lg shadow-black/20
        animate-tooltip-in
      "
      dir="rtl"
    >
      {label}

      <span
        className="
          absolute top-full left-1/2 -translate-x-1/2
          w-0 h-0
          border-l-4 border-r-4 border-t-4
          border-l-transparent border-r-transparent
          border-t-slate-800/90
        "
        aria-hidden="true"
      />
    </div>
  );
};

export default React.memo(FloatingTooltip);