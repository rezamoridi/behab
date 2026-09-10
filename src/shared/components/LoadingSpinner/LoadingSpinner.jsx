// src/shared/components/LoadingSpinner/LoadingSpinner.jsx
import React from 'react';

const sizeClasses = {
  small: 'w-6 h-6 border-2',
  medium: 'w-10 h-10 border-[3px]',
  large: 'w-14 h-14 border-4',
};

const LoadingSpinner = ({
  size = 'medium',
  message = 'در حال بارگذاری...',
  fullScreen = false,
}) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4 font-vazir" dir="rtl">
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.medium}
          border-gray-200 border-t-primary-600
          rounded-full animate-spin
        `}
      />
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default React.memo(LoadingSpinner);