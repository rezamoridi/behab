// src/features/map/components/MapErrorBoundary.jsx
import React from 'react';
import ErrorBoundary from '../../../shared/components/ErrorBoundary/ErrorBoundary';

const MapErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="h-full relative">{children}</div>
    </ErrorBoundary>
  );
};

export default MapErrorBoundary;