// src/features/map/components/SnapToggleControl.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';

// ============================================================
// SnapToggleControl
//
// یک L.Control سفارشی که در گوشه بالا-چپ نقشه، زیر کنترل‌های
// zoom و draw قرار می‌گیرد و دکمه toggle اسنپ را نمایش می‌دهد.
// استایل‌ها همه با Tailwind داخل JSX اعمال می‌شوند.
// ============================================================
const SnapToggleControl = ({ enabled, onToggle, hidden = false }) => {
  const map = useMap();
  const controlRef = useRef(null);
  const containerRef = useRef(null);
  const rootRef = useRef(null);

  // ✅ ایجاد کنترل یک بار در mount
  useEffect(() => {
    if (!map) return;

    // leaflet-bar باعث می‌شود border-radius و box-shadow استاندارد Leaflet اعمال شود
    const container = L.DomUtil.create(
      'div',
      'leaflet-bar leaflet-control'
    );
    container.style.display = 'none'; // در ابتدا مخفی

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const control = new L.Control({ position: 'topleft' });
    control.onAdd = () => container;
    control.addTo(map);

    controlRef.current = control;
    containerRef.current = container;
    rootRef.current = createRoot(container);

    return () => {
      const root = rootRef.current;
      queueMicrotask(() => {
        try {
          root?.unmount();
        } catch {
          /* ignore */
        }
      });
      rootRef.current = null;
      try {
        control.remove();
      } catch {
        /* ignore */
      }
      controlRef.current = null;
      containerRef.current = null;
    };
  }, [map]);

  // ✅ رندر React داخل کنترل
  useEffect(() => {
    const root = rootRef.current;
    const container = containerRef.current;
    if (!root || !container) return;

    container.style.display = hidden ? 'none' : '';

    root.render(
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onToggle?.();
        }}
        title={enabled ? 'اسنپ به رئوس: فعال' : 'اسنپ به رئوس: غیرفعال'}
        aria-label="اسنپ به رئوس"
        aria-pressed={enabled}
        className={[
          'relative w-[30px] h-[30px] flex items-center justify-center',
          'border-0 p-0 cursor-pointer',
          'transition-colors duration-150',
          'focus:outline-none',
          enabled
            ? 'bg-green-50 text-green-700 hover:bg-green-100'
            : 'bg-white text-gray-700 hover:bg-gray-100',
        ].join(' ')}
      >
        {/* آیکون Magnet — نماینده‌ی snap */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="block"
        >
          <path d="M6 15V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v9" />
          <path d="M10 15v3a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-3" />
          <path d="M18 6v3" />
          <path d="M6 6v3" />
          <line x1="6" y1="9" x2="10" y2="9" />
          <line x1="14" y1="9" x2="18" y2="9" />
        </svg>

        {/* نقطه سبز کوچک گوشه برای نشان دادن وضعیت فعال */}
        {enabled && (
          <span
            className="absolute top-[3px] right-[3px] w-1.5 h-1.5 rounded-full bg-green-500 ring-1 ring-white"
            aria-hidden="true"
          />
        )}
      </button>
    );
  }, [enabled, hidden, onToggle]);

  return null;
};

export default SnapToggleControl;