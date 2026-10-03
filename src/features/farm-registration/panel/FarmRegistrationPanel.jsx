// src/features/farm-registration/panel/FarmRegistrationPanel.jsx
import { memo, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPinned, X } from 'lucide-react';
import { useFarmPanel } from './FarmPanelContext';
import FarmPanelContent from './FarmPanelContent';

const FarmRegistrationPanel = () => {
  const { isOpen, togglePanel, closePanel } = useFarmPanel();

  const [visible, setVisible] = useState(isOpen);
  const [animating, setAnimating] = useState(false);
  const [blurOn, setBlurOn] = useState(false);

  const timersRef = useRef([]);
  const rafRef = useRef(null);

  const clearAll = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    clearAll();

    if (isOpen) {
      const t0 = setTimeout(() => setBlurOn(false), 0);
      timersRef.current.push(t0);

      const t1 = setTimeout(() => setVisible(true), 0);
      timersRef.current.push(t1);

      rafRef.current = requestAnimationFrame(() => {
        const t2 = setTimeout(() => setAnimating(true), 20);
        timersRef.current.push(t2);
      });

      const t3 = setTimeout(() => setBlurOn(true), 180);
      timersRef.current.push(t3);
    } else {
      const t0 = setTimeout(() => setBlurOn(false), 0);
      timersRef.current.push(t0);

      const t1 = setTimeout(() => setAnimating(false), 0);
      timersRef.current.push(t1);

      const t2 = setTimeout(() => setVisible(false), 170);
      timersRef.current.push(t2);
    }

    return clearAll;
  }, [isOpen]);

  // ── حالت ۱: پنل بسته ──
  if (!visible) {
    return (
      <button
        type="button"
        onClick={togglePanel}
        className="
          hidden md:flex
          fixed top-1/2 -translate-y-1/2 right-0 z-[1050]
          items-center gap-2
          py-3 px-2.5 rounded-l-2xl
          bg-white/40
          border border-r-0 border-white/60
          text-slate-700 text-xs font-semibold font-vazir
          shadow-[-4px_0_20px_rgba(31,38,135,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]
          hover:bg-white/60 transition-colors
          cursor-pointer
        "
        title="باز کردن فرم ثبت زمین"
        aria-label="باز کردن فرم ثبت زمین"
      >
        <ChevronLeft size={14} strokeWidth={2.4} className="rotate-180" />
        <span className="[writing-mode:vertical-rl]">ثبت زمین</span>
        <MapPinned size={14} strokeWidth={2.4} />
      </button>
    );
  }

  // ── حالت ۲: پنل باز ──
  return (
    <>
      {/* Backdrop موبایل */}
      <div
        className={`
          md:hidden fixed inset-0 z-[1199]
          bg-black/30 transition-opacity duration-150
          ${animating ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* 
        ✅ پنل با z-index بالاتر از TopBar (1090)
        تا دکمه‌های پنل روی کارت لوگو قرار بگیرند
      */}
      <aside
        className={`
          farm-panel-aside
          fixed top-0 right-0 bottom-0 z-[1200]
          font-vazir
          w-full md:w-[420px] md:max-w-[90vw]
          ${animating ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{
          transition: 'transform 150ms cubic-bezier(0.25, 1, 0.5, 1)',
          pointerEvents: animating ? 'auto' : 'none',
        }}
        dir="rtl"
        aria-hidden={!isOpen}
      >
        <div
          className={`
            relative h-full flex flex-col overflow-hidden
            border-l border-white/60
            shadow-[-12px_0_40px_rgba(31,38,135,0.18),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(255,255,255,0.4)]
            transition-[background-color,backdrop-filter] duration-100
            ${
              blurOn
                ? 'bg-white/30 backdrop-blur-sm'
                : 'bg-white/45 backdrop-blur-none'
            }
          `}
        >
          {/* گرادیانت عمق */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.02) 100%)',
            }}
            aria-hidden="true"
          />

          {/* خط درخشش بالا */}
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent z-10"
            aria-hidden="true"
          />

          {/* Header */}
          <div
            className="
              relative z-20
              flex items-center justify-between
              px-4 py-3
              border-b border-white/40
              bg-white/20
              flex-shrink-0
            "
          >
            <div className="flex items-center gap-2">
              <div
                className="
                  w-8 h-8 rounded-xl
                  bg-white/60
                  border border-white/70
                  flex items-center justify-center
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_6px_rgba(31,38,135,0.08)]
                "
              >
                <MapPinned size={14} className="text-primary-700" />
              </div>
              <div>
                <h3 className="text-slate-900 text-sm font-bold drop-shadow-sm">
                  ثبت زمین جدید
                </h3>
                <p className="text-slate-700 text-[10px] mt-0.5">
                  اطلاعات کشاورز و زمین را وارد کنید
                </p>
              </div>
            </div>

            {/* دکمه بستن — دسکتاپ */}
            <button
              type="button"
              onClick={closePanel}
              className="
                hidden md:flex
                items-center justify-center
                w-10 h-10 rounded-xl
                text-slate-700 hover:bg-white/80 hover:text-slate-900
                active:bg-white
                transition-colors cursor-pointer
                relative z-30
              "
              aria-label="بستن پنل"
              title="بستن پنل"
            >
              <ChevronRight size={20} strokeWidth={2.4} />
            </button>

            {/* دکمه بستن — موبایل */}
            <button
              type="button"
              onClick={closePanel}
              className="
                md:hidden
                flex items-center justify-center
                w-10 h-10 rounded-xl
                text-slate-700 hover:bg-white/80 hover:text-slate-900
                active:bg-white
                transition-colors cursor-pointer
                relative z-30
              "
              aria-label="بستن پنل"
              title="بستن پنل"
            >
              <X size={20} strokeWidth={2.4} />
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden bg-transparent">
            <FarmPanelContent />
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(FarmRegistrationPanel);