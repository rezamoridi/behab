// src/shared/components/Input/Input.jsx
import React from 'react';

const Input = React.forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      value,
      onChange,
      onBlur,
      error,
      touched,
      required,
      placeholder,
      disabled,
      className = '',
      hint,
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;

    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && (
          <label
            htmlFor={name}
            className="text-sm font-medium text-gray-700 font-vazir"
          >
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3.5 py-2.5 rounded-lg font-vazir text-sm
            border transition-all duration-200
            ${hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
            }
            ${disabled
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-900'
            }
            outline-none
          `}
          {...props}
        />
        {hint && !hasError && (
          <span className="text-xs text-gray-500 font-vazir">{hint}</span>
        )}
        {hasError && (
          <span className="text-xs text-red-600 font-vazir">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default React.memo(Input);