// src/features/conversations/components/SmsLogTable.jsx
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
} from 'lucide-react';
import {
  SMS_KIND_LABELS,
  SMS_KIND_COLORS,
  SMS_STATUS_LABELS,
  SMS_STATUS_COLORS,
} from '../constants';

// ============================================
// Status Badge
// ============================================
const StatusBadge = ({ status }) => {
  const Icon =
    status === 'sent' ? CheckCircle2
    : status === 'failed' ? XCircle
    : Clock;

  const colorClass =
    SMS_STATUS_COLORS[status] || SMS_STATUS_COLORS.pending;

  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5 rounded-md text-[10px] font-semibold border
        ${colorClass}
      `}
    >
      <Icon size={10} strokeWidth={2.4} />
      {SMS_STATUS_LABELS[status] || status}
    </span>
  );
};

// ============================================
// Kind Badge
// ============================================
const KindBadge = ({ kind }) => {
  const colorClass =
    SMS_KIND_COLORS[kind] || SMS_KIND_COLORS.custom;

  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap
        ${colorClass}
      `}
    >
      {SMS_KIND_LABELS[kind] || kind}
    </span>
  );
};

// ============================================
// Date format
// ============================================
const formatDateTime = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

// ============================================
// Table
// ============================================
const SmsLogTable = ({
  logs = [],
  selectedId,
  onRowClick,
  isLoading,
}) => {
  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mb-3">
          <MessageSquare size={24} />
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">
          پیامکی یافت نشد
        </p>
        <p className="text-xs text-gray-400">
          فیلترها را تغییر دهید یا بعداً بررسی کنید
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wide w-12">
              #
            </th>
            <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
              شماره
            </th>
            <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
              نوع
            </th>
            <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wide">
              وضعیت
            </th>
            <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wide min-w-[180px]">
              متن
            </th>
            <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase tracking-wide w-36">
              تاریخ
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => {
            const isSelected = String(log.id) === String(selectedId);

            return (
              <tr
                key={log.id}
                onClick={() => onRowClick?.(log)}
                className={`
                  cursor-pointer transition-colors
                  ${
                    isSelected
                      ? 'bg-primary-50/60'
                      : 'hover:bg-gray-50/80'
                  }
                `}
              >
                <td className="px-3 py-2.5 text-gray-400 text-xs">
                  {log.id}
                </td>

                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <Phone size={11} className="text-gray-400" />
                    <span className="font-mono text-xs text-gray-700">
                      {log.phone_number}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2.5">
                  <KindBadge kind={log.kind} />
                </td>

                <td className="px-3 py-2.5">
                  <StatusBadge status={log.status} />
                </td>

                <td className="px-3 py-2.5">
                  <span className="text-xs text-gray-600 line-clamp-1">
                    {(log.message || '').replace(/\n/g, ' ').slice(0, 60)}
                    {log.message?.length > 60 ? '…' : ''}
                  </span>
                </td>

                <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SmsLogTable;