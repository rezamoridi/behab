// src/features/farm-registration/panel/FarmRegistrationPanel.jsx
import { memo, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPinned, X } from "lucide-react";
import { useFarmPanel } from "./FarmPanelContext";
import FarmPanelContent from "./FarmPanelContent";

const FarmRegistrationPanel = () => {
  const { isOpen, togglePanel, closePanel } = useFarmPanel();

  const [visible, setVisible] = useState(isOpen);
  const [animating, setAnimating] = useState(false);

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
      const t1 = setTimeout(() => setVisible(true), 0);
      timersRef.current.push(t1);
      rafRef.current = requestAnimationFrame(() => {
        const t2 = setTimeout(() => setAnimating(true), 20);
        timersRef.current.push(t2);
      });
    } else {
      const t1 = setTimeout(() => setAnimating(false), 0);
      timersRef.current.push(t1);
      const t2 = setTimeout(() => setVisible(false), 170);
      timersRef.current.push(t2);
    }
    return clearAll;
  }, [isOpen]);

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
          bg-white/40 backdrop-blur-xl
          border border-r-0 border-white/60
          text-slate-700 text-xs font-semibold font-vazir
          shadow-[-4px_0_20px_rgba(31,38,135,0.12)]
          hover:bg-white/60 transition-colors cursor-pointer
        "
        title="باز کردن فرم ثبت زمین"
      >
        <ChevronLeft size={14} strokeWidth={2.4} className="rotate-180" />
        <span className="[writing-mode:vertical-rl]">ثبت زمین</span>
        <MapPinned size={14} strokeWidth={2.4} />
      </button>
    );
  }

  return (
    <>
      <div
        className={`md:hidden fixed inset-0 z-[1199] bg-black/30 transition-opacity duration-150 ${animating ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closePanel}
        aria-hidden="true"
      />

      {/* ✅ مینیمال: یک لایه شفاف، بدون gradient گوشه، بدون خطوط نور */}
      <aside
        className={`
          farm-panel-aside
          fixed top-0 right-0 bottom-0 z-[1200]
          font-vazir
          w-full md:w-[440px] md:max-w-[95vw]
          ${animating ? "translate-x-0" : "translate-x-full"}
        `}
        style={{
          transition: "transform 150ms cubic-bezier(0.25, 1, 0.5, 1)",
          pointerEvents: animating ? "auto" : "none",
          backdropFilter: "blur(10px) saturate(150%)",
          WebkitBackdropFilter: "blur(10px) saturate(150%)",
          // ✅ از 0.28 به 0.45 — پنل مات‌تر
          backgroundColor: "rgba(255, 255, 255, 0.45)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.55)",
          boxShadow: "-8px 0 32px rgba(31, 38, 135, 0.15)",
        }}
        dir="rtl"
        aria-hidden={!isOpen}
      >
        <div className="relative z-10 h-full flex flex-col">
          {/* Header مینیمال — فقط عنوان + دکمه بستن */}
          <div
            className="
              flex-shrink-0
              flex items-center justify-between
              px-5 py-4
              border-b border-white/30
            "
          >
            <h3 className="text-slate-900 text-base font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
              {isOpen ? "ثبت / ویرایش زمین" : "ثبت زمین"}
            </h3>

            <button
              type="button"
              onClick={closePanel}
              className="
                hidden md:flex items-center justify-center
                w-8 h-8 rounded-lg
                text-slate-700 hover:bg-white/40 hover:text-slate-900
                transition-colors cursor-pointer
              "
              aria-label="بستن پنل"
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={closePanel}
              className="
                md:hidden flex items-center justify-center
                w-8 h-8 rounded-lg
                text-slate-700 hover:bg-white/40 hover:text-slate-900
                transition-colors cursor-pointer
              "
              aria-label="بستن پنل"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-hidden">
            <FarmPanelContent />
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(FarmRegistrationPanel);
