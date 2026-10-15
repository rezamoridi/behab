// src/features/map/components/FarmHistoryModal.jsx
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  History,
  Loader2,
  AlertCircle,
  UserCog,
  ArrowLeft,
  Clock,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';

import {
  fetchFarmHistory,
  transferFarmOwnership,
} from '../../../services/api/farmApi';
import { settingsApi } from '../../../services/api/settingsApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
const historyKeys = {
  all: ['farm-history'],
  detail: (farmId) => [...historyKeys.all, farmId],
};


// ═══════════════════════════════════════════════════════════
// Person Badge
// ═══════════════════════════════════════════════════════════
const PersonBadge = ({ username, name, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const label = name || username || '—';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2 py-0.5 rounded-md text-[11px] font-semibold border
        ${colors[color]}
      `}
    >
      <UserIcon size={10} strokeWidth={2.6} />
      {label}
    </span>
  );
};


// ═══════════════════════════════════════════════════════════
// History Item
// ═══════════════════════════════════════════════════════════
const HistoryItem = ({ item, isFirst }) => {
  const isCreation = item.previous_owner_id == null;

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative pl-6 pb-4 border-r-2 border-gray-100 last:border-r-0 last:pb-0">
      {/* Dot */}
      <div
        className={`
          absolute -right-[7px] top-0 w-3 h-3 rounded-full
          ring-4 ring-white
          ${
            isCreation
              ? 'bg-emerald-500'
              : 'bg-amber-500'
          }
        `}
      />

      <div className="pr-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className={`
              inline-flex items-center gap-1
              px-2 py-0.5 rounded-md text-[10px] font-bold
              ${
                isCreation
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }
            `}
          >
            {isCreation ? 'ایجاد اولیه' : 'انتقال مسئولیت'}
          </span>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock size={9} />
            {formatDate(item.created_at)}
          </span>
        </div>

        {/* Transition */}
        {isCreation ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500">مسئول:</span>
            <PersonBadge
              username={item.new_owner_username}
              name={item.new_owner_name}
              color="emerald"
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <PersonBadge
              username={item.previous_owner_username}
              name={item.previous_owner_name}
              color="gray"
            />
            <ArrowLeft
              size={11}
              className="text-gray-400 flex-shrink-0"
            />
            <PersonBadge
              username={item.new_owner_username}
              name={item.new_owner_name}
              color="emerald"
            />
          </div>
        )}

        {/* Reason */}
        {item.reason && (
          <div className="mt-2 text-[11px] text-gray-600 bg-gray-50 rounded-md px-2 py-1.5 border border-gray-100 leading-relaxed">
            {item.reason}
          </div>
        )}

        {/* Meta — created_by و original_creator */}
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
          {item.changed_by_username && !isCreation && (
            <span>
              تغییر توسط: {item.changed_by_username}
            </span>
          )}
          {item.original_creator_username && (
            <span>
              ثبت‌کنندهٔ اولیه: {item.original_creator_username}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════
// History View
// ═══════════════════════════════════════════════════════════
const HistoryView = ({ farmId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: historyKeys.detail(farmId),
    queryFn: () => fetchFarmHistory(farmId),
    staleTime: 30 * 1000,
    enabled: !!farmId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle
          size={24}
          className="text-red-300 mx-auto mb-2"
        />
        <p className="text-xs text-gray-400">
          خطا در دریافت تاریخچه
        </p>
      </div>
    );
  }

  const items = data?.items || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <History
          size={24}
          className="text-gray-300 mx-auto mb-2"
        />
        <p className="text-xs text-gray-400">
          تاریخچه‌ای ثبت نشده است
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, idx) => (
        <HistoryItem
          key={item.id}
          item={item}
          isFirst={idx === 0}
        />
      ))}
    </div>
  );
};


// ═══════════════════════════════════════════════════════════
// Transfer Form
// ═══════════════════════════════════════════════════════════
const TransferView = ({ farm, onSuccess }) => {
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [newOwnerId, setNewOwnerId] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  // کاربران غیر super_admin
  const { data: usersData = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'list', 'for-transfer'],
    queryFn: async () => {
      const res = await settingsApi.getUsers({ page: 1, size: 100 });
      const items = res.data?.items || res.data || [];
      return items.filter((u) => u.role !== 'super_admin');
    },
    staleTime: 5 * 60 * 1000,
  });

  const transferMutation = useMutation({
    mutationFn: (data) =>
      transferFarmOwnership(farm.farm_id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: historyKeys.detail(farm.farm_id),
      });
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      toast.success(data?.message || 'مسئولیت منتقل شد', 'موفق');
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.message || 'خطا در انتقال', 'خطا');
    },
  });

  const currentOwnerId = useMemo(() => {
    return farm.current_owner_id ?? farm.created_by_user_id ?? null;
  }, [farm]);

  const handleSubmit = async () => {
    const errs = {};
    if (!newOwnerId) {
      errs.newOwnerId = 'کاربر جدید را انتخاب کنید';
    } else if (Number(newOwnerId) === currentOwnerId) {
      errs.newOwnerId = 'مسئول جدید با مسئول فعلی یکسان است';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const newOwner = usersData.find(
      (u) => u.id === Number(newOwnerId),
    );
    const newOwnerName =
      `${newOwner?.fname || ''} ${newOwner?.lname || ''}`.trim() ||
      newOwner?.username ||
      'کاربر انتخاب‌شده';

    const ok = await confirm({
      title: 'انتقال مسئولیت',
      message: `آیا مسئولیت مزرعه به «${newOwnerName}» منتقل شود؟\n\nتوجه: ثبت‌کنندهٔ اولیه حفظ می‌شود و در تاریخچه ثبت خواهد شد.`,
      confirmText: 'انتقال بده',
      cancelText: 'انصراف',
      variant: 'primary',
    });
    if (!ok) return;

    transferMutation.mutate({
      newOwnerId: Number(newOwnerId),
      reason: reason.trim() || null,
    });
  };

  const isSubmitting = transferMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 leading-relaxed">
        <AlertCircle
          size={13}
          className="text-amber-600 flex-shrink-0 mt-0.5"
        />
        <div>
          <strong>انتقال مسئولیت</strong> — مسئول فعلی پرونده عوض
          می‌شود، ولی ثبت‌کنندهٔ اولیه حفظ می‌شود. این انتقال در
          تاریخچه ثبت خواهد شد.
        </div>
      </div>

      {/* Current owner */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
          مسئول فعلی
        </label>
        <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
          {farm.current_owner_id
            ? `کاربر با شناسه ${farm.current_owner_id}`
            : 'بدون مسئول'}
        </div>
      </div>

      {/* New owner */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          مسئول جدید <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <ChevronDown
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={newOwnerId}
            onChange={(e) => {
              setNewOwnerId(e.target.value);
              setErrors((p) => ({ ...p, newOwnerId: '' }));
            }}
            disabled={isSubmitting || usersLoading}
            className={`
              w-full px-3.5 py-2.5 pr-3 pl-8 rounded-lg border
              text-sm appearance-none cursor-pointer outline-none
              transition-all
              ${
                errors.newOwnerId
                  ? 'border-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
              }
            `}
          >
            <option value="">
              {usersLoading
                ? 'در حال بارگذاری...'
                : '— انتخاب کنید —'}
            </option>
            {usersData.map((u) => {
              const name =
                `${u.fname || ''} ${u.lname || ''}`.trim() ||
                u.username;
              const isCurrent = u.id === currentOwnerId;
              return (
                <option key={u.id} value={u.id} disabled={isCurrent}>
                  {name} ({u.role}){isCurrent ? ' — فعلی' : ''}
                </option>
              );
            })}
          </select>
        </div>
        {errors.newOwnerId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.newOwnerId}
          </p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          دلیل (اختیاری)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          maxLength={500}
          placeholder="مثال: انتقال به دلیل تغییر محدودهٔ کاری"
          className="
            w-full px-3.5 py-2.5 rounded-lg border border-gray-300
            text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all resize-none
          "
        />
        <div className="text-[10px] text-gray-400 mt-1 text-left">
          {reason.length} / 500
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !newOwnerId}
          className="
            flex items-center gap-2 px-4 py-2
            bg-amber-600 text-white rounded-lg
            text-sm font-semibold
            hover:bg-amber-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              در حال انتقال...
            </>
          ) : (
            <>
              <UserCog size={14} />
              انتقال مسئولیت
            </>
          )}
        </button>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════
// Main Modal
// ═══════════════════════════════════════════════════════════
const FarmHistoryModal = ({
  farm,
  onClose,
  initialTab = 'history',
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!farm) return null;

  const TABS = [
    {
      id: 'history',
      label: 'تاریخچه',
      icon: History,
    },
    {
      id: 'transfer',
      label: 'انتقال مسئولیت',
      icon: UserCog,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <History size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                تاریخچه و انتقال
              </h4>
              <p
                className="text-[10px] text-gray-400 mt-0.5 font-mono truncate max-w-[200px]"
                dir="ltr"
              >
                {farm.farm_id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 text-xs font-bold
                  border-b-2 transition-all
                  ${
                    isActive
                      ? 'border-primary-600 text-primary-700 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <Icon size={13} strokeWidth={2.4} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'history' && (
            <HistoryView farmId={farm.farm_id} />
          )}
          {activeTab === 'transfer' && (
            <TransferView farm={farm} onSuccess={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmHistoryModal;