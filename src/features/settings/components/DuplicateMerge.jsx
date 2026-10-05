// src/features/settings/components/DuplicateMerge.jsx
import { useState } from 'react';
import {
  AlertTriangle,
  Users,
  Merge,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  Info,
  Wheat,
  RefreshCw,
  PartyPopper,
} from 'lucide-react';

import {
  useDuplicatesQuery,
  useMergeMutation,
} from '../../admin/hooks/useImport';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ============================================================
// Farmer Card
// ============================================================
const FarmerCard = ({ farmer, isPrimary, onSelect, disabled }) => (
  <button
    type="button"
    onClick={() => onSelect(farmer.id)}
    disabled={disabled}
    className={`
      flex-1 min-w-[200px] p-3 rounded-xl border-2 transition-all text-right
      ${
        isPrimary
          ? 'bg-emerald-50 border-emerald-400 shadow-sm'
          : 'bg-white border-gray-200 hover:border-primary-300'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {isPrimary && (
      <div className="flex items-center gap-1 mb-1.5">
        <CheckCircle2 size={11} className="text-emerald-600" />
        <span className="text-[10px] font-bold text-emerald-700">
          نگه‌داشته می‌شود
        </span>
      </div>
    )}

    <div className="text-sm font-bold text-gray-800 mb-1">
      {`${farmer.fname || ''} ${farmer.lname || ''}`.trim() || 'بدون نام'}
    </div>

    <div className="text-[10px] text-gray-500 font-mono mb-1.5" dir="ltr">
      {farmer.national_id}
    </div>

    <div className="text-[10px] text-gray-500 font-mono mb-2" dir="ltr">
      {farmer.phone_number}
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 text-[10px] font-semibold">
        <Wheat size={9} />
        {farmer.farm_count.toLocaleString('fa-IR')} مزرعه
      </span>
      <span className="text-[10px] text-gray-400" dir="ltr">
        {farmer.total_area_ha.toLocaleString('fa-IR', {
          maximumFractionDigits: 1,
        })}{' '}
        ha
      </span>
    </div>
  </button>
);

// ============================================================
// Duplicate Group Card
// ============================================================
const DuplicateGroupCard = ({ group, onMerge, isMerging }) => {
  const [primaryId, setPrimaryId] = useState(
    group.farmers[0]?.id ?? null,
  );
  const [expanded, setExpanded] = useState(true);

  const reasonLabel =
    group.reason === 'national_id'
      ? 'کد ملی تکراری'
      : 'شماره تلفن تکراری';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="
          w-full flex items-center justify-between gap-2
          px-4 py-3 bg-gray-50/70
          hover:bg-gray-100/70 transition-colors
        "
      >
        <div className="flex items-center gap-2 flex-wrap">
          <AlertTriangle size={14} className="text-amber-600" />
          <span className="text-xs font-bold text-gray-800">
            {reasonLabel}:
          </span>
          <span className="text-xs font-mono text-gray-600" dir="ltr">
            {group.match_key}
          </span>
          <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
            {group.farmers.length.toLocaleString('fa-IR')} کشاورز
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>

      {/* Body */}
      {expanded && (
        <div className="p-4 space-y-3">
          <div className="text-[11px] text-gray-500 leading-relaxed">
            یکی از کشاورزان را به‌عنوان «اصلی» انتخاب کنید. مزارع
            بقیه به او منتقل می‌شوند و بقیه حذف می‌شوند.
          </div>

          <div className="flex flex-wrap gap-2">
            {group.farmers.map((f) => (
              <FarmerCard
                key={f.id}
                farmer={f}
                isPrimary={primaryId === f.id}
                onSelect={setPrimaryId}
                disabled={isMerging}
              />
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onMerge(primaryId, group.farmers)}
              disabled={isMerging || !primaryId}
              className="
                inline-flex items-center gap-2 px-4 py-2
                bg-primary-600 text-white rounded-lg
                text-xs font-bold
                hover:bg-primary-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isMerging ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  در حال ادغام...
                </>
              ) : (
                <>
                  <Merge size={12} />
                  ادغام
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// Main
// ============================================================
const DuplicateMerge = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const { data, isLoading, isFetching, refetch } = useDuplicatesQuery();
  const mergeMutation = useMergeMutation();

  const groups = data?.groups || [];
  const totalGroups = data?.total_groups || 0;

  const handleMerge = async (primaryId, farmers) => {
    const others = farmers
      .filter((f) => f.id !== primaryId)
      .map((f) => f.id);

    if (others.length === 0) return;

    const primary = farmers.find((f) => f.id === primaryId);
    const ok = await confirm({
      title: 'ادغام کشاورزان',
      message: `آیا «${primary?.fname || ''} ${primary?.lname || ''}» به‌عنوان کشاورز اصلی نگه داشته شود و ${others.length} کشاورز دیگر با آن ادغام شوند؟\n\nمزارع بقیه به اصلی منتقل می‌شود.`,
      confirmText: 'ادغام کن',
      cancelText: 'انصراف',
      variant: 'primary',
    });
    if (!ok) return;

    try {
      const result = await mergeMutation.mutateAsync({
        primaryId,
        mergeIds: others,
      });
      toast.success(result.message, 'ادغام موفق');
      refetch();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ادغام';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <strong>کشاورزان تکراری</strong> — کشاورزانی که کد ملی یا
          شماره تلفن یکسانی دارند. با ادغام، مزارع همه به یک کشاورز
          منتقل می‌شود و بقیه حذف می‌شوند.
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border
            ${
              totalGroups > 0
                ? 'bg-amber-50 border-amber-200'
                : 'bg-emerald-50 border-emerald-200'
            }
          `}
        >
          <span
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
              ${
                totalGroups > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }
            `}
          >
            <AlertTriangle size={17} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] text-gray-500 mb-0.5">
              گروه‌های تکراری
            </div>
            <div
              className={`
                text-lg font-bold tabular-nums leading-none
                ${totalGroups > 0 ? 'text-amber-800' : 'text-emerald-800'}
              `}
            >
              {totalGroups.toLocaleString('fa-IR')}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="
            flex items-center gap-3 px-4 py-3 rounded-xl border
            bg-white border-gray-200 hover:bg-gray-50
            transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-wait
          "
        >
          <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary-50 text-primary-700">
            <RefreshCw
              size={17}
              strokeWidth={2.2}
              className={isFetching ? 'animate-spin' : ''}
            />
          </span>
          <div className="min-w-0 text-right">
            <div className="text-[11px] text-gray-500 mb-0.5">
              بروزرسانی
            </div>
            <div className="text-xs font-bold text-gray-700">
              بررسی مجدد
            </div>
          </div>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-primary-600 animate-spin" />
        </div>
      ) : totalGroups === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <PartyPopper size={28} strokeWidth={2} />
          </div>
          <h3 className="text-sm font-bold text-gray-800 mb-1.5">
            هیچ کشاورز تکراری وجود ندارد
          </h3>
          <p className="text-xs text-gray-500">
            همه‌ی کشاورزان با کد ملی و شماره تلفن یکتا ثبت شده‌اند. 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group, idx) => (
            <DuplicateGroupCard
              key={`${group.reason}-${group.match_key}-${idx}`}
              group={group}
              onMerge={handleMerge}
              isMerging={mergeMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DuplicateMerge;