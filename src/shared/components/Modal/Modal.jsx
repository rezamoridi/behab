// src/shared/components/Modal/Modal.jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal — مودال عمومی با پشتیبانی کامل از موبایل
 *
 * ویژگی‌ها:
 *   - Portal به document.body (backdrop همیشه روی همه چیز)
 *   - Body scroll lock هنگام باز بودن
 *   - Focus trap
 *   - Escape برای بستن
 *   - Responsive: در موبایل تمام صفحه با اسکرول، در دسکتاپ کارت
 *   - z-index بالا (10000)
 *
 * props:
 *   isOpen: boolean
 *   onClose: () => void
 *   title: string
 *   subtitle?: string
 *   icon?: React.ComponentType  (lucide icon)
 *   headerBg?: string  (کلاس‌های tailwind، مثلاً "bg-emerald-50/60")
 *   headerColor?: string
 *   maxWidth?: string  ("max-w-md" | "max-w-lg" | "max-w-2xl" | "max-w-3xl")
 *   children
 *   footer?: ReactNode
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  headerBg = 'bg-gray-50/70',
  headerColor = 'text-gray-700',
  maxWidth = 'max-w-lg',
  children,
  footer,
}) => {
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // ── Body scroll lock + focus restore ──
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // جلوگیری از پرش layout وقتی scrollbar مخفی می‌شود
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    previouslyFocusedRef.current = document.activeElement;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      if (previouslyFocusedRef.current?.focus) {
        try {
          previouslyFocusedRef.current.focus();
        } catch {
          /* ignore */
        }
      }
    };
  }, [isOpen]);

  // ── Focus trap + Escape ──
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Focus اولین عنصر
    const focusables = panel.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusables.length > 0) {
      setTimeout(() => {
        try {
          focusables[0].focus();
        } catch {
          /* ignore */
        }
      }, 50);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const items = panel.querySelectorAll(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () =>
      document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[10000]
        flex items-end sm:items-center justify-center
        p-0 sm:p-4
      "
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* ─── Backdrop ─── */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ─── Panel ─── */}
      <div
        ref={panelRef}
        className={`
          relative w-full ${maxWidth}
          bg-white
          rounded-t-3xl sm:rounded-2xl
          shadow-2xl
          flex flex-col
          max-h-[95vh] sm:max-h-[90vh]
          animate-slideUp sm:animate-scaleIn
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — فقط موبایل */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* ─── Header ─── */}
        {(title || Icon) && (
          <div
            className={`
              flex items-center justify-between gap-3
              px-4 sm:px-5 py-3 sm:py-4
              border-b border-gray-100
              flex-shrink-0
              ${headerBg}
              rounded-t-3xl sm:rounded-t-2xl
            `}
          >
            <div className="flex items-center gap-3 min-w-0">
              {Icon && (
                <div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center
                    bg-white border border-white/80 shadow-sm
                    flex-shrink-0
                    ${headerColor}
                  `}
                >
                  <Icon size={16} strokeWidth={2.4} />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h4
                    id="modal-title"
                    className="text-sm font-bold text-gray-900 truncate"
                  >
                    {title}
                  </h4>
                )}
                {subtitle && (
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                p-1.5 rounded-lg
                text-gray-400 hover:bg-white/70 hover:text-gray-700
                transition-colors
                flex-shrink-0
              "
              aria-label="بستن"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ─── Body (scroll) ─── */}
        <div
          className="
            flex-1 overflow-y-auto overflow-x-hidden
            p-4 sm:p-5
            overscroll-contain
          "
        >
          {children}
        </div>

        {/* ─── Footer ─── */}
        {footer && (
          <div
            className="
              flex justify-end gap-2
              px-4 sm:px-5 py-3 sm:py-4
              border-t border-gray-100
              bg-gray-50/50
              flex-shrink-0
              rounded-b-3xl sm:rounded-b-2xl
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;