// src/features/farm-registration/components/FarmWindowHeader.jsx
import React from 'react';
import { GripVertical, X } from 'lucide-react';

export const FarmWindowHeader = React.forwardRef(
  ({ title, isDragging, onMouseDown, onClose }, ref) => {
    const handleCloseClick = (e) => {
      e.stopPropagation();
      onClose?.();
    };

    return (
      <div
        ref={ref}
        onMouseDown={onMouseDown}
        className={`
          flex items-center justify-between px-4 py-3
          bg-gray-50 border-b border-gray-200 rounded-t-xl
          flex-shrink-0 select-none
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical
            size={16}
            className="text-gray-400 flex-shrink-0"
          />
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCloseClick}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors flex-shrink-0"
          aria-label="بستن"
        >
          <X size={18} />
        </button>
      </div>
    );
  }
);

FarmWindowHeader.displayName = 'FarmWindowHeader';

export default React.memo(FarmWindowHeader);