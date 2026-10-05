// src/features/conversations/components/SmsStatsBar.jsx
import { Send, XCircle, Clock, Coins, MessageSquare } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
    <span
      className={`
        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
        ${color}
      `}
    >
      <Icon size={18} strokeWidth={2.2} />
    </span>
    <div className="min-w-0">
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-lg font-bold text-gray-900 tabular-nums leading-tight">
        {value}
      </div>
    </div>
  </div>
);

const SmsStatsBar = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-[68px] rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const formatNumber = (n) =>
    Number(n || 0).toLocaleString('fa-IR');

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      <StatCard
        icon={MessageSquare}
        label="کل پیامک‌ها"
        value={formatNumber(stats.total)}
        color="text-slate-700 bg-slate-100"
      />
      <StatCard
        icon={Send}
        label="ارسال شده"
        value={formatNumber(stats.sent)}
        color="text-emerald-700 bg-emerald-50"
      />
      <StatCard
        icon={XCircle}
        label="خطا"
        value={formatNumber(stats.failed)}
        color="text-red-700 bg-red-50"
      />
      <StatCard
        icon={Clock}
        label="در انتظار"
        value={formatNumber(stats.pending)}
        color="text-amber-700 bg-amber-50"
      />
      <StatCard
        icon={Coins}
        label="هزینه کل"
        value={formatNumber(stats.total_cost)}
        color="text-blue-700 bg-blue-50"
      />
    </div>
  );
};

export default SmsStatsBar;