// src/shared/components/Drawer/Drawer.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Drawer = ({ isOpen, onClose, title, children }) => {
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // ✅ قفل اسکرول بدنه + ذخیره focus قبلی
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    previouslyFocusedRef.current = document.activeElement;
    return () => {
      document.body.style.overflow = original;
      // ✅ بازگرداندن focus
      if (previouslyFocusedRef.current?.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isOpen]);

  // ✅ Focus trap + Escape
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Focus اولین عنصر قابل focus
    const focusables = panel.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusables.length > 0) {
      setTimeout(() => focusables[0].focus(), 50);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = panel.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-end md:items-center justify-center"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="
          relative w-full md:w-[500px] max-h-[85vh] md:max-h-[80vh]
          bg-white rounded-t-2xl md:rounded-2xl shadow-2xl
          flex flex-col
          animate-slideUp
        "
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <h3
            id="drawer-title"
            className="text-sm font-semibold text-gray-800 truncate"
          >
            {title || ''}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors flex-shrink-0"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default React.memo(Drawer);