// src/features/dashboard/DashboardPreview.jsx
import { useEffect, useRef, useState } from "react";
import {
  Wheat,
  Droplets,
  Users,
  Ruler,
  TrendingUp,
  Settings2,
  Sprout,
  Map as MapIcon,
  Users2,
  UserCog,
  Bell,
  Calendar,
  MessageSquare,
  Menu,
  ChevronLeft,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// Mock Data (طبق تغییرات شما)
// ═══════════════════════════════════════════════════════════
const MOCK_KPIS = [
  { label: "کل مزارع", value: "۳۴۰۴", unit: "مزرعه", color: "emerald", icon: Wheat, trend: "+۹۰۰٪", trendUp: true },
  { label: "کل کشاورزان", value: "۲۹۰۰", unit: "نفر", color: "blue", icon: Users, trend: "+۱۰۰٪", trendUp: true },
  { label: "مساحت کل", value: "۲۴۱,۰۰۰", unit: "هکتار", color: "amber", icon: Ruler, trend: "+۵٪", trendUp: true },
  { label: "آب مصرفی سالانه", value: "۱۰۰۰۰۰", unit: "هزار m³", color: "sky", icon: Droplets, trend: "-۲٪", trendUp: false },
  { label: "مزارع این ماه", value: "۱۰", unit: "جدید", color: "emerald", icon: TrendingUp, trend: "+۵۰٪", trendUp: true },
  { label: "کشاورزان فعال", value: "۱۵۰۰", unit: "نفر", color: "emerald", icon: Users2, trend: "+۱۰٪", trendUp: true },
];

const MOCK_TREND = [
  { month: "اردیبهشت", value: 0 },
  { month: "خرداد", value: 0 },
  { month: "تیر", value: 0 },
  { month: "مرداد", value: 0 },
  { month: "شهریور", value: 3 },
  { month: "مهر", value: 11 },
];

const MOCK_CROPS = [
  { name: "خربزه", area: 2307, color: "#f97316" },
  { name: "پیاز", area: 980, color: "#8b5cf6" },
  { name: "خیار", area: 430, color: "#22c55e" },
  { name: "چغندر", area: 330, color: "#a16207" },
  { name: "کلزا", area: 150, color: "#eab308" },
  { name: "نامشخص", area: 1031, color: "#94a3b8" },
];

const MOCK_FARMS = [
  { name: "حمید سوری", crop: "خیار", cropColor: "#22c55e", area: "۴۳۴", village: "تهران، بخش مرکزی تهران، شهرستان تهران، استان تهران، ایران", date: "۲۹ مهر ۱۴۰۵" },
  { name: "علی علیپور", crop: "چغندر", cropColor: "#a16207", area: "۳۳۹", village: "تهران، بخش مرکزی تهران، شهرستان تهران، استان تهران، ایران", date: "۲۹ مهر ۱۴۰۵" },
];

const MOCK_TOP_CROPS = [
  { name: "نامشخص", area: 1031.8, color: "#94a3b8" },
  { name: "پیاز", area: 579.7, color: "#8b5cf6" },
  { name: "خیار", area: 434.6, color: "#22c55e" },
  { name: "چغندر", area: 333.9, color: "#a16207" },
];

const KPI_THEMES = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", trendBg: "bg-emerald-50", trendText: "text-emerald-700" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", trendBg: "bg-emerald-50", trendText: "text-emerald-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", trendBg: "bg-emerald-50", trendText: "text-emerald-700" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", trendBg: "bg-rose-50", trendText: "text-rose-700" },
};

// ═══════════════════════════════════════════════════════════
// useReveal — تشخیص ورود و خروج از viewport (با ریست)
// ═══════════════════════════════════════════════════════════
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // ✅ ورود به viewport → فعال، خروج → غیرفعال (ریست)
        setIsActive(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isActive];
};

// ═══════════════════════════════════════════════════════════
// Glass Panel
// ═══════════════════════════════════════════════════════════
const GlassPanel = ({ children, className = "", delay = "" }) => {
  const [ref, isActive] = useReveal();
  return (
    <div
      ref={ref}
      className={`
        bg-white/60 backdrop-blur-xl rounded-2xl
        border border-white/80
        shadow-[0_4px_24px_rgba(31,38,135,0.04),inset_0_1px_0_rgba(255,255,255,0.95)]
        dp-glass-hover
        dp-reveal ${delay} ${isActive ? "dp-reveal-active" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// KPI Card — با ورود پلکانی
// ═══════════════════════════════════════════════════════════
const KpiCard = ({ kpi, delay = 0, isParentActive = false }) => {
  const Icon = kpi.icon;
  const theme = KPI_THEMES[kpi.color] || KPI_THEMES.emerald;

  return (
    <div
      className={`
        flex items-center justify-between gap-2 p-2 rounded-xl
        hover:bg-white/50 transition-colors
        dp-reveal ${isParentActive ? "dp-reveal-active" : ""}
      `}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-7 h-7 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-slate-500 font-medium truncate">{kpi.label}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-900 tabular-nums">{kpi.value}</span>
            <span className="text-[9px] text-slate-400">{kpi.unit}</span>
          </div>
        </div>
      </div>
      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${theme.trendBg} ${theme.trendText} text-[9px] font-bold flex-shrink-0`} dir="ltr">
        {kpi.trend}
        <TrendingUp size={10} className={kpi.trendUp ? "" : "rotate-180"} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Trend Area Chart — با رسم تدریجی خط
// ═══════════════════════════════════════════════════════════
const TrendAreaChart = ({ isActive = false }) => {
  const width = 500;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 30 };
  const maxValue = Math.max(...MOCK_TREND.map((d) => d.value), 10);
  const points = MOCK_TREND.map((d, i) => {
    const x = padding.left + (i / (MOCK_TREND.length - 1)) * (width - padding.left - padding.right);
    const y = height - padding.bottom - (d.value / maxValue) * (height - padding.top - padding.bottom);
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 3, 6, 9, 12].map((v) => {
        const y = height - padding.bottom - (v / maxValue) * (height - padding.top - padding.bottom);
        return (
          <line key={v} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" strokeWidth={0.5} />
        );
      })}

      <path d={areaPath} fill="url(#trendGrad)" className={`dp-trend-area ${isActive ? "dp-reveal-active" : ""}`} />

      <path d={linePath} fill="none" stroke="#10b981" strokeWidth={2} className={`dp-trend-line ${isActive ? "dp-reveal-active" : ""}`} />

      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#fff"
          stroke="#10b981"
          strokeWidth={2}
          className={`dp-trend-dot ${isActive ? "dp-reveal-active" : ""}`}
          style={{ animationDelay: `${0.3 + i * 0.1}s` }}
        />
      ))}

      {points.map((p, i) => (
        <text key={`label-${i}`} x={p.x} y={height - 8} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="Vazirmatn">
          {p.month}
        </text>
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════
// Horizontal Bar Chart — رشد تدریجی
// ═══════════════════════════════════════════════════════════
const HorizontalBarChart = ({ data, isActive = false }) => {
  const maxVal = Math.max(...data.map((d) => d.area), 1);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {data.map((item, i) => {
        const pct = (item.area / maxVal) * 100;

        return (
          <div key={i} className="flex items-center gap-2 group">
            <span className="text-[10px] font-medium text-slate-600 w-14 text-left truncate" dir="rtl">
              {item.name}
            </span>

            <div className="flex-1 h-3 bg-slate-100/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-80 dp-bar-grow ${isActive ? "dp-reveal-active" : ""}`}
                style={{
                  "--bar-width": `${pct}%`,
                  backgroundColor: item.color,
                  transitionDelay: `${i * 0.1}s`,
                }}
              />
            </div>

            <span className="text-[10px] font-bold text-slate-700 tabular-nums w-16 text-left flex items-baseline gap-0.5" dir="ltr">
              {item.area.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
              <span className="text-[8px] text-slate-400 font-normal">ha</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Donut Chart — ورود با چرخش
// ═══════════════════════════════════════════════════════════
const DonutChart = ({ isActive = false }) => {
  const total = MOCK_CROPS.reduce((s, c) => s + c.area, 0);
  let cumulative = 0;
  const gradientStops = MOCK_CROPS.map((crop) => {
    const start = (cumulative / total) * 360;
    cumulative += crop.area;
    const end = (cumulative / total) * 360;
    return `${crop.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div
        className={`w-32 h-32 rounded-full relative dp-donut-wrap ${isActive ? "dp-reveal-active" : ""}`}
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
          <span className="text-[9px] text-slate-400">کل</span>
          <span className="text-sm font-bold text-slate-900">{total.toLocaleString("fa-IR")}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-[220px]">
        {MOCK_CROPS.map((crop) => (
          <div key={crop.name} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: crop.color }} />
            <span className="text-[9px] font-medium text-slate-600">{crop.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
const DashboardPreview = () => {
  // refs و active برای هر ناحیه‌ی مهم
  const [headerRef, headerActive] = useReveal();
  const [heroRef, heroActive] = useReveal();
  const [row1Ref, row1Active] = useReveal();
  const [row2Ref, row2Active] = useReveal();
  const [row3Ref, row3Active] = useReveal();
  const [dockRef, dockActive] = useReveal(0.05);

  return (
    <div className="relative w-full max-w-6xl mx-auto" dir="rtl">
      {/* ── Top Header ── */}
      <div
        ref={headerRef}
        className={`
          flex items-center justify-between gap-2 mb-4
          bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 p-2 px-3 shadow-sm
          dp-reveal ${headerActive ? "dp-reveal-active" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
            <Sprout size={16} className="text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-800">داشبورد آب‌خوان</div>
            <div className="text-[9px] text-slate-500">پیش‌نمایش تعاملی</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors dp-btn-press">
            <Bell size={14} />
          </button>
          <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-[10px] font-bold border border-rose-200">
            علیرضا
          </div>
        </div>
      </div>

      {/* ── Hero Bar ── */}
      <div
        ref={heroRef}
        className={`
          mb-4 p-3 rounded-2xl
          bg-gradient-to-l from-primary-500/10 via-white/60 to-blue-500/10
          backdrop-blur-md border border-white/70 shadow-sm
          flex items-center justify-between flex-wrap gap-2
          dp-reveal dp-delay-1 ${heroActive ? "dp-reveal-active" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-300/40 flex items-center justify-center">
            <Sprout size={16} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">شب بخیر، علیرضا 👋</h1>
            <p className="text-[10px] text-slate-500">خلاصه‌ای از وضعیت سیستم در یک نگاه</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { icon: Users2, label: "کشاورزان", color: "text-blue-700 bg-blue-500/10 border-blue-300/30" },
            { icon: UserCog, label: "کاربران", color: "text-rose-700 bg-rose-500/10 border-rose-300/30" },
            { icon: MapIcon, label: "نقشه", color: "text-emerald-700 bg-emerald-500/10 border-emerald-300/30" },
            { icon: Sprout, label: "محصولات", color: "text-amber-700 bg-amber-500/10 border-amber-300/30" },
            { icon: Settings2, label: "تنظیمات", color: "text-slate-700 bg-slate-500/10 border-slate-300/30" },
          ].map((item, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${item.color} transition-transform hover:scale-105 cursor-pointer`}
            >
              <item.icon size={10} />
              {item.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
          <Calendar size={12} className="text-slate-400" />
          <span>چهارشنبه ۲۹ مهر</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            فعال
          </span>
        </div>
      </div>

      {/* ── Row 1: Trend + KPIs ── */}
      <div ref={row1Ref} className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <GlassPanel className="p-4 flex flex-col h-[240px] dp-delay-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">روند ثبت مزارع</h3>
              <p className="text-[9px] text-slate-400">۶ ماه اخیر</p>
            </div>
            <button className="flex items-center gap-1 text-[9px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-md transition-colors dp-btn-press">
              <span>مشاهده در نقشه</span>
              <ChevronLeft size={10} />
            </button>
          </div>
          <div className="flex-1 -mx-2 -mb-2">
            <TrendAreaChart isActive={row1Active} />
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 flex flex-col h-[240px] dp-delay-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">شاخص‌های کلیدی</h3>
              <p className="text-[9px] text-slate-400">کلیک برای مشاهده جزئیات</p>
            </div>
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
              <Wheat size={12} className="text-slate-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-1 content-start">
            {MOCK_KPIS.map((kpi, i) => (
              <KpiCard key={i} kpi={kpi} delay={0.1 + i * 0.08} isParentActive={row1Active} />
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* ── Row 2: Water + Area + Donut ── */}
      <div ref={row2Ref} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <GlassPanel className="p-4 flex flex-col h-[240px] dp-delay-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">آب مصرفی محصولات</h3>
              <p className="text-[9px] text-slate-400">واحد: متر مکعب</p>
            </div>
            <Droplets size={14} className="text-sky-500" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                  <div
                    className={`h-full bg-sky-500 rounded-md dp-bar-grow ${row2Active ? "dp-reveal-active" : ""}`}
                    style={{ "--bar-width": "85%", transitionDelay: "0.2s" }}
                  />
                </div>
                <span className="text-[10px] font-bold text-sky-700">۲,۳۰۷,۷۵۰</span>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-1">
                <span>۰</span>
                <span>۰/۵</span>
                <span>۱</span>
                <span>۱/۵</span>
                <span>۲</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 flex flex-col h-[240px] dp-delay-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">مساحت هر محصول</h3>
              <p className="text-[9px] text-slate-400">واحد: هکتار</p>
            </div>
            <Ruler size={14} className="text-amber-500" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <HorizontalBarChart data={MOCK_TOP_CROPS} isActive={row2Active} />
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 flex flex-col h-[240px] dp-delay-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">توزیع محصولات</h3>
              <p className="text-[9px] text-slate-400">سهم از مزارع</p>
            </div>
            <Wheat size={14} className="text-primary-500" />
          </div>
          <div className="flex-1 -mt-2">
            <DonutChart isActive={row2Active} />
          </div>
        </GlassPanel>
      </div>

      {/* ── Row 3: Recent Farms + Top Crops ── */}
      <div ref={row3Ref} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <GlassPanel className="md:col-span-2 p-4 flex flex-col h-[220px] dp-delay-7">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">مزارع اخیر</h3>
              <p className="text-[9px] text-slate-400">۵ مزرعه اخیر ثبت‌شده</p>
            </div>
            <button className="flex items-center gap-1 text-[9px] font-bold text-primary-600 hover:text-primary-700 dp-btn-press">
              <span>مشاهده همه</span>
              <ChevronLeft size={10} />
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-[10px]">
              <thead className="text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="text-right py-1.5 font-semibold">کشاورز</th>
                  <th className="text-right py-1.5 font-semibold">روستا</th>
                  <th className="text-right py-1.5 font-semibold">محصول</th>
                  <th className="text-right py-1.5 font-semibold">مساحت</th>
                  <th className="text-left py-1.5 font-semibold">تاریخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_FARMS.map((farm, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700">
                          {farm.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700">{farm.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-slate-500 truncate max-w-[150px]">{farm.village}</td>
                    <td className="py-2">
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
                        style={{ background: `${farm.cropColor}20`, color: farm.cropColor }}
                      >
                        <span className="w-1 h-1 rounded-full" style={{ background: farm.cropColor }} />
                        {farm.crop}
                      </span>
                    </td>
                    <td className="py-2 font-bold text-blue-700 tabular-nums">{farm.area} ha</td>
                    <td className="py-2 text-slate-400 text-left">{farm.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 flex flex-col h-[220px] dp-delay-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-800">محصولات برتر</h3>
              <p className="text-[9px] text-slate-400">بر اساس مساحت</p>
            </div>
            <Sprout size={14} className="text-emerald-500" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <HorizontalBarChart data={MOCK_TOP_CROPS} isActive={row3Active} />
          </div>
        </GlassPanel>
      </div>

      {/* ── Floating Dock ── */}
      <div
        ref={dockRef}
        className={`flex items-center justify-center mt-4 pointer-events-none dp-dock-reveal ${dockActive ? "dp-reveal-active" : ""}`}
      >
        <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg pointer-events-auto">
          {[MessageSquare, Users, Sprout, UserCog, MapIcon].map((Icon, i) => (
            <button
              key={i}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors dp-btn-press ${
                i === 4 ? "bg-primary-500 text-white shadow-md shadow-primary-500/30" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Icon size={15} strokeWidth={2.2} />
            </button>
          ))}
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 text-white shadow-md dp-btn-press">
            <Menu size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;