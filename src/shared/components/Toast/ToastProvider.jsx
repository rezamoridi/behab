// src/shared/components/Toast/ToastProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react';

// ============================================================
// Context
// ============================================================
const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

// ============================================================
// Config آیکون و رنگ
// ============================================================
const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconColor: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    classes: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-50 border-amber-200 text-amber-800',
    iconColor: 'text-amber-600',
  },
  info: {
    icon: Info,
    classes: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600',
  },
};

// ============================================================
// Toast Item
// ============================================================
const ToastItem = ({ toast, onDismiss }) => {
  const config = VARIANT_CONFIG[toast.variant] || VARIANT_CONFIG.info;
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration === 0) return undefined;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
        min-w-[280px] max-w-[400px]
        font-vazir animate-slideDown
        ${config.classes}
      `}
      dir="rtl"
      role="alert"
    >
      <Icon
        size={18}
        className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}
        strokeWidth={2.4}
      />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-sm font-semibold mb-0.5">
            {toast.title}
          </div>
        )}
        {toast.message && (
          <div className="text-xs opacity-90 leading-relaxed">
            {toast.message}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="بستن"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// ============================================================
// Provider
// ============================================================
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((options) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast = {
      id,
      variant: 'info',
      duration: 4000,
      ...options,
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const value = useMemo(() => {
    return {
      show,
      dismiss,
      success: (message, title) =>
        show({ variant: 'success', message, title }),
      error: (message, title) =>
        show({ variant: 'error', message, title, duration: 6000 }),
      warning: (message, title) =>
        show({ variant: 'warning', message, title }),
      info: (message, title) =>
        show({ variant: 'info', message, title }),
    };
  }, [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[1200] flex flex-col gap-2 items-center pointer-events-none"
            dir="rtl"
          >
            {toasts.map((toast) => (
              <div key={toast.id} className="pointer-events-auto">
                <ToastItem toast={toast} onDismiss={dismiss} />
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;