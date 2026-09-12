// src/shared/components/Button/Button.jsx
import React from 'react';

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
  secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  outline: 'bg-transparent text-primary-700 border-2 border-primary-600 hover:bg-primary-50',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
};

const sizeClasses = {
  small: 'px-3 py-1.5 text-xs rounded-md',
  medium: 'px-5 py-2.5 text-sm rounded-lg',
  large: 'px-7 py-3.5 text-base rounded-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled,
  loading,
  className = '',
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold font-vazir
        transition-all duration-200
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.medium}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>در حال بارگذاری...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default React.memo(Button);