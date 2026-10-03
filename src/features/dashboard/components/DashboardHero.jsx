// src/features/dashboard/components/DashboardHero.jsx
import { Calendar, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const DashboardHero = ({ userName = 'کاربر' }) => {
  const [today, setToday] = useState('');

  useEffect(() => {
    const formatDate = () => {
      try {
        const now = new Date();
        const persian = now.toLocaleDateString('fa-IR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        setToday(persian);
      } catch {
        setToday('');
      }
    };

    const t = setTimeout(formatDate, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        p-5 md:p-8
        bg-gradient-to-br from-primary-500/15 via-white/40 to-blue-500/10
        backdrop-blur-xl
        border border-white/70
        shadow-[0_8px_32px_rgba(31,38,135,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]
        animate-fadeInUp
      "
      dir="rtl"
    >
      {/* گرادیانت تزئینی */}
      <div
        className="
          pointer-events-none absolute -top-20 -left-20
          w-72 h-72 rounded-full
          bg-primary-500/20 blur-3xl
        "
        aria-hidden="true"
      />
      <div
        className="
          pointer-events-none absolute -bottom-20 -right-20
          w-72 h-72 rounded-full
          bg-blue-500/15 blur-3xl
        "
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-300/40 flex items-center justify-center">
            <Sparkles size={14} className="text-primary-600" />
          </div>
          <span className="text-xs font-semibold text-primary-700">
            داشبورد
          </span>
        </div>

        <h1 className="text-lg md:text-2xl font-bold text-slate-900 mb-1.5">
          سلام، {userName} 👋
        </h1>

        <p className="text-xs md:text-sm text-slate-600 mb-3">
          خلاصه‌ای از وضعیت فعلی سیستم و آمار مزارع
        </p>

        {today && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/70 shadow-sm">
            <Calendar size={12} className="text-slate-500" />
            <span className="text-[11px] md:text-xs text-slate-700 font-medium">
              {today}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHero;