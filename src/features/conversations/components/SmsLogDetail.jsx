// src/features/conversations/components/SmsLogDetail.jsx
import { useState } from 'react';
import {
  X,
  Phone,
  Copy,
  Check,
  RotateCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  Hash,
  User,
  Wheat,
} from 'lucide-react';
import {
  SMS_KIND_LABELS,
  SMS_STATUS_LABELS,
  SMS_STATUS_COLORS,
} from '../constants';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ============================================
// Info Row
// ============================================
const InfoRow = ({ icon: Icon, label, value, mono = false, ltr = false }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
    <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
      <Icon size={12} />
      {label}
    </span>
    <span
      className={`
        text-xs font-medium text-gray-800 text-left
        ${mono ? 'font-mono' : ''}
      `}
      dir={ltr ? 'ltr' : 'rtl'}
    >
      {value || '—'}
    </span>
  </div>
);

// ============================================
// Main
// ============================================
const SmsLogDetail = ({
  log,
  onClose,
  onDelete,
  onResend,
  isDeleting,
  isResending,
}) => {
  const toast = useToast();
  const confirm = useConfirm();
  const [copiedField, setCopiedField] = useState(null);

  if (!log) return null;

  // ─── Copy to clipboard ───
  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch (err) {
      toast.error('خطا در کپی', 'خطا');
    }
  };

  // ─── Delete ───
  const handleDelete = async () => {
    const ok = await confirm({
      title: 'حذف پیامک',
      message: `آیا از حذف پیامک به «${log.phone_number}» اطمینان دارید؟`,
      confirmText: 'حذف کن',
      cancelText: 'انصراف',
      variant: 'danger',
    });
    if (!ok) return;
    await onDelete?.(log);
  };

  // ─── Resend ───
  const handleResend = async () => {
    const ok = await confirm({
      title: 'ارسال مجدد',
      message: `آیا می‌خواهید پیامک به «${log.phone_number}» مجدداً ارسال شود؟`,
      confirmText: 'ارسال کن',
      cancelText: 'انصراف',
      variant: 'primary',
    });
    if (!ok) return;
    await onResend?.(log);
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  const statusColor =
    SMS_STATUS_COLORS[log.status] || SMS_STATUS_COLORS.pending;

  const StatusIcon =
    log.status === 'sent'
      ? CheckCircle2
      : log.status === 'failed'
        ? AlertCircle
        : Clock;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Phone size={16} className="text-primary-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              جزئیات پیامک #{log.id}
            </h3>
            <p className="text-[10px] text-gray-400 font-mono" dir="ltr">
              {log.phone_number}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="بستن"
        >
          <X size={16} />
        </button>
      </div>

      {/* ─── Body ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status + Kind */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`
              inline-flex items-center gap-1.5
              px-3 py-1.5 rounded-lg text-xs font-semibold border
              ${statusColor}
            `}
          >
            <StatusIcon size={13} strokeWidth={2.4} />
            {SMS_STATUS_LABELS[log.status] || log.status}
          </span>
          <span
            className="
              inline-flex items-center
              px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-gray-100 text-gray-700 border border-gray-200
            "
          >
            {SMS_KIND_LABELS[log.kind] || log.kind}
          </span>
        </div>

        {/* Error */}
        {log.error_message && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold mb-0.5">خطای ارسال</div>
              <div className="leading-relaxed">{log.error_message}</div>
            </div>
          </div>
        )}

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              متن پیامک
            </span>
            <button
              type="button"
              onClick={() => handleCopy(log.message, 'message')}
              className="
                flex items-center gap-1 px-2 py-1 rounded-md
                text-[10px] text-gray-500
                hover:bg-gray-100 transition-colors
              "
            >
              {copiedField === 'message' ? (
                <>
                  <Check size={10} className="text-emerald-600" />
                  <span className="text-emerald-600">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy size={10} />
                  <span>کپی</span>
                </>
              )}
            </button>
          </div>
          <div
            className="
              p-3 rounded-lg bg-gray-50 border border-gray-100
              text-xs text-gray-800 leading-relaxed
              whitespace-pre-wrap
            "
          >
            {log.message || '—'}
          </div>
        </div>

        {/* Details */}
        <div className="rounded-lg bg-white border border-gray-100 p-3">
          <InfoRow
            icon={Hash}
            label="Message ID"
            value={log.message_id ? String(log.message_id) : '—'}
            mono
            ltr
          />
          <InfoRow
            icon={Coins}
            label="هزینه"
            value={
              log.cost != null
                ? `${Number(log.cost).toLocaleString('fa-IR')} ریال`
                : '—'
            }
            ltr
          />
          <InfoRow
            icon={Clock}
            label="تاریخ ایجاد"
            value={formatDateTime(log.created_at)}
          />
          <InfoRow
            icon={Clock}
            label="تاریخ ارسال"
            value={formatDateTime(log.sent_at)}
          />
          {log.user_id && (
            <InfoRow
              icon={User}
              label="کاربر"
              value={log.user_username || `#${log.user_id}`}
            />
          )}
          {log.farmer_id && (
            <InfoRow
              icon={Wheat}
              label="کشاورز"
              value={log.farmer_name || `#${log.farmer_id}`}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isDeleting}
            className="
              flex-1 inline-flex items-center justify-center gap-1.5
              px-4 py-2.5 rounded-lg
              bg-primary-600 text-white text-xs font-bold
              hover:bg-primary-700 transition-colors
              disabled:opacity-50 disabled:cursor-wait
            "
          >
            <RotateCw
              size={13}
              className={isResending ? 'animate-spin' : ''}
            />
            {isResending ? 'در حال ارسال...' : 'ارسال مجدد'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isResending || isDeleting}
            className="
              inline-flex items-center justify-center gap-1.5
              px-4 py-2.5 rounded-lg
              bg-red-50 text-red-700 border border-red-200
              hover:bg-red-100 transition-colors
              text-xs font-bold
              disabled:opacity-50 disabled:cursor-wait
            "
          >
            <Trash2 size={13} />
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsLogDetail;