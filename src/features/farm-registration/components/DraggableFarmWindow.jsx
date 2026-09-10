// src/features/farm-registration/components/DraggableFarmWindow.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

import { useDraggableWindow } from '../hooks/useDraggableWindow';
import FarmWindowHeader from './FarmWindowHeader';
import { FarmFormContainer } from '../forms/FarmFormContainer';

const WINDOW_CONFIG = {
  width: 720,
  height: 640,
  minWidth: 500,
  minHeight: 400,
  margin: 16,
};

export const DraggableFarmWindow = ({
  isOpen,
  onClose,
  onCancel,
  onSuccess,
  initialData = null,
  areaHa = 0,
  geojson = null,
  locationData = null,
  isEditMode = false,
  editingFarmId = null,
  isLoading = false,
}) => {
  const [mounted, setMounted] = useState(false);

  const {
    position,
    isDragging,
    windowRef,
    headerRef,
    handleDragStart,
  } = useDraggableWindow({
    isOpen,
    config: WINDOW_CONFIG,
    persistPosition: true,
  });

  // Mount
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const title =
    isEditMode && initialData
      ? `ویرایش مزرعه - ${initialData.farmer_name || 'بدون نام'}`
      : 'ثبت مزرعه جدید';

  return createPortal(
    <div
      ref={windowRef}
      className={`
        fixed z-modal bg-white rounded-xl
        flex flex-col
        ${isDragging ? 'shadow-2xl' : 'shadow-xl'}
        transition-shadow duration-200
      `}
      style={{
        left: position.x,
        top: position.y,
        width: WINDOW_CONFIG.width,
        height: WINDOW_CONFIG.height,
        direction: 'rtl',
      }}
      role="dialog"
      aria-modal="false"
      aria-label={title}
    >
      <FarmWindowHeader
        ref={headerRef}
        title={title}
        isDragging={isDragging}
        onMouseDown={handleDragStart}
        onClose={onClose}
      />

      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2
                size={36}
                className="text-primary-600 animate-spin"
              />
              <span className="text-sm text-gray-500">
                در حال بارگذاری اطلاعات مزرعه...
              </span>
            </div>
          </div>
        ) : (
          <FarmFormContainer
            initialData={initialData}
            areaHa={areaHa}
            geojson={geojson}
            locationData={locationData}
            isEditing={isEditMode}
            editingFarmId={editingFarmId}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

export default React.memo(DraggableFarmWindow);