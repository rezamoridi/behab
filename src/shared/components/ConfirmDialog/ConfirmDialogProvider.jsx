// src/shared/components/ConfirmDialog/ConfirmDialogProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../Button/Button';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider');
  }
  return ctx;
};

export const ConfirmDialogProvider = ({ children }) => {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تایید',
    cancelText: 'انصراف',
    variant: 'danger',
  });

  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        title: options.title || 'تایید عملیات',
        message: options.message || 'آیا مطمئن هستید؟',
        confirmText: options.confirmText || 'تایید',
        cancelText: options.cancelText || 'انصراف',
        variant: options.variant || 'danger',
      });
    });
  }, []);

  const handleClose = useCallback((result) => {
    setState((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current?.(result);
    resolveRef.current = null;
  }, []);

  // بستن با Escape
  useEffect(() => {
    if (!state.isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') handleClose(false);
      if (e.key === 'Enter') handleClose(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.isOpen, handleClose]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {state.isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
            dir="rtl"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
              onClick={() => handleClose(false)}
            />
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {state.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {state.message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleClose(false)}
                >
                  {state.cancelText}
                </Button>
                <Button
                  variant={state.variant}
                  size="small"
                  onClick={() => handleClose(true)}
                >
                  {state.confirmText}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
};

export default ConfirmDialogProvider;