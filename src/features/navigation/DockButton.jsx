// src/features/navigation/DockButton.jsx
import React, { useState } from 'react';
import FloatingTooltip from '../../shared/components/Tooltip/FloatingTooltip';

const DockButton = ({
  icon: Icon,
  label,
  shortcut,
  isActive = false,
  onClick,
  disabled = false,
}) => {
  const [hovered, setHovered] = useState(false);

  const tooltipLabel = shortcut ? `${label} (${shortcut})` : label;

  return (
    <div className="relative">
      <FloatingTooltip
        label={tooltipLabel}
        visible={hovered && !disabled}
      />

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={label}
        aria-pressed={isActive}
        className={`
          relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl
          flex items-center justify-center
          transition-all duration-200 ease-out
          border
          ${
            disabled
              ? 'opacity-40 cursor-not-allowed border-transparent'
              : 'cursor-pointer'
          }
          ${
            isActive
              ? 'bg-primary-500/90 border-primary-300/60 shadow-lg shadow-primary-500/40 scale-105'
              : 'bg-white/40 border-white/50 hover:bg-white/70 hover:border-white/70 hover:scale-105'
          }
        `}
      >
        <Icon
          size={20}
          strokeWidth={2.2}
          className={`
            md:w-[22px] md:h-[22px]
            transition-colors duration-200
            ${isActive ? 'text-white' : 'text-slate-700'}
          `}
        />

        {isActive && (
          <span
            className="
              absolute -bottom-1 md:-bottom-1.5 left-1/2 -translate-x-1/2
              w-1 h-1 rounded-full bg-white
            "
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
};

export default React.memo(DockButton);