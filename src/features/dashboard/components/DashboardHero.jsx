// src/features/dashboard/components/DashboardHero.jsx
import { Calendar, Sparkles, Activity } from 'lucide-react';
import { useMemo } from 'react';

let cachedToday = null;
let cachedDateKey = null;

const getToday = () => {
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  if (cachedDateKey === todayKey && cachedToday) return cachedToday;

  try {
    cachedToday = now.toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    cachedDateKey = todayKey;
    return cachedToday;
  } catch {
    return '';
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return 'شب بخیر';
  if (hour < 12) return 'صبح بخیر';
  if (hour < 17) return 'ظهر بخیر';
  if (hour < 20) return 'عصر بخیر';
  return 'شب بخیر';
};

const DashboardHero = ({ userName = 'کاربر', statusSummary = null }) => {
  const today = useMemo(() => getToday(), []);
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <div
      className="
        relative overflow-hidden
        rounded-3xl
        p-5 md:p-6
        bg-gradient-to-br from-primary-500/15 via-white/50 to-blue-500/10
        backdrop-blur-xl
        border border-white/70
        shadow-[0_8px_32px_rgba(31,38,135,0.10),inset_0_1px_0_rgba(255,255,255,0.95)]
        animate-fadeInUp
      "
      dir="rtl"
    >
      {/* گرادیانت تزئینی */}
      <div
        className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-blue-500/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        {/* چپ: پیام خوش‌آمد */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-300/40 flex items-center justify-center">
              <Sparkles size={14} className="text-primary-600" />
            </div>
            <span className="text-xs font-semibold text-primary-700">
              داشبورد مدیریتی
            </span>
          </div>

          <h1 className="text-lg md:text-2xl font-bold text-slate-900 mb-1.5">
            {greeting}، {userName} 👋
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

        {/* راست: status pill */}
        {statusSummary && (
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/60 backdrop-blur-md border border-white/70 shadow-sm flex-shrink-0"
            dir="rtl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Activity size={13} className="text-slate-500" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-slate-500 font-medium">
                وضعیت سیستم
              </span>
              <span className="text-[11px] text-slate-800 font-bold">
                {statusSummary}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHero;