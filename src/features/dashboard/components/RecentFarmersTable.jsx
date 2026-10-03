// src/features/dashboard/components/RecentFarmersTable.jsx
import { Users, Phone, ArrowLeft, CheckCircle2, Clock, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../utils/analytics';

/**
 * RecentFarmersTable — ۵ کشاورز اخیر
 *
 * props:
 *   farmers: آرایه‌ای از کشاورزان
 */
const RecentFarmersTable = ({ farmers = [] }) => {
  const navigate = useNavigate();

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // ─── وضعیت کشاورز ───
  const getStatus = (farmer) => {
    if (farmer.password_changed_at) {
      return {
        label: 'فعال',
        icon: CheckCircle2,
        color: 'emerald',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    }
    if (farmer.first_login_at) {
      return {
        label: 'لاگین کرده',
        icon: Clock,
        color: 'amber',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    }
    return {
      label: 'دعوت‌شده',
      icon: UserPlus,
      color: 'slate',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
    };
  };

  if (farmers.length === 0) {
    return (
      <div
        className="
          p-5 rounded-2xl
          bg-white/60 backdrop-blur-xl
          border border-white/70
          shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
        "
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-700/5 border border-blue-300/40 flex items-center justify-center">
              <Users size={16} className="text-blue-600" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                کشاورزان اخیر
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ۵ کشاورز اخیر ثبت‌شده
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
            <Users size={20} />
          </div>
          <p className="text-xs text-slate-500">هنوز کشاورزی ثبت نشده</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        p-5 rounded-2xl
        bg-white/60 backdrop-blur-xl
        border border-white/70
        shadow-[0_4px_20px_rgba(31,38,135,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]
      "
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-blue-700/5 border border-blue-300/40 flex items-center justify-center">
            <Users size={16} className="text-blue-600" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              کشاورزان اخیر
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ۵ کشاورز اخیر ثبت‌شده
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate('/settings', { state: { activeTab: 'farmers' } })
          }
          className="
            flex items-center gap-1.5
            text-[11px] font-semibold
            text-blue-600 hover:text-blue-700
            transition-colors cursor-pointer
          "
        >
          <span>مشاهده همه</span>
          <ArrowLeft size={12} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/50 border-b border-slate-200/60">
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">
                نام
              </th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500 hidden md:table-cell">
                تلفن
              </th>
              <th className="text-right px-3 py-2.5 font-semibold text-slate-500">
                وضعیت
              </th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-500 hidden lg:table-cell">
                تاریخ ثبت
              </th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((farmer) => {
              const fullName =
                `${farmer.fname || ''} ${farmer.lname || ''}`.trim() ||
                'بدون نام';
              const status = getStatus(farmer);
              const StatusIcon = status.icon;

              return (
                <tr
                  key={farmer.id}
                  className="
                    border-b border-slate-200/40 last:border-0
                    hover:bg-blue-50/40
                    transition-colors
                  "
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-[10px] font-bold">
                          {fullName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-800 truncate">
                        {fullName}
                      </span>
                    </div>
                  </td>

                  <td
                    className="px-3 py-2.5 hidden md:table-cell"
                    dir="ltr"
                  >
                    <div className="flex items-center gap-1 justify-end text-slate-600">
                      <span className="tabular-nums">
                        {farmer.phone_number || '—'}
                      </span>
                      <Phone size={10} className="text-slate-400" />
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <span
                      className={`
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-md
                        text-[10px] font-semibold
                        ${status.bg} ${status.text} border ${status.border}
                      `}
                    >
                      <StatusIcon size={10} strokeWidth={2.4} />
                      {status.label}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-left text-slate-500 hidden lg:table-cell">
                    {formatDate(farmer.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentFarmersTable;