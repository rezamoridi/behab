// src/shared/components/Skeleton/Skeleton.jsx
import React from 'react';

/**
 * Skeleton — placeholder در حین بارگذاری
 */
const Skeleton = ({ className = '', variant = 'rect' }) => {
  const base = 'bg-gray-200 animate-pulse';

  const shapes = {
    rect: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded-md h-3',
  };

  return (
    <div
      className={`${base} ${shapes[variant] || shapes.rect} ${className}`}
      aria-hidden="true"
    />
  );
};

export default React.memo(Skeleton);