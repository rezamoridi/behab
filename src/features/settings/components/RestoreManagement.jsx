// src/features/settings/components/RestoreManagement.jsx
import { useState, useMemo, useCallback } from 'react';
import {
  Trash2,
  RotateCcw,
  Search,
  X,
  Loader2,
  Wheat,
  Users,
  AlertCircle,
  Clock,
} from 'lucide-react';

import {
  useTrashSummaryQuery,
  useDeletedFarmsQuery,
  useDeletedFarmersQuery,
  useRestoreFarmMutation,
  useRestoreFarmerMutation,
} from '../../admin/hooks/useOrphans';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ============================================================
// KPI Card
// ============================================================
const KpiCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100">
    <span
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
    >
      <Icon size={17} strokeWidth={2.2} />
    </span>
    <div className="min-w-0">
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      <div className="text-lg font-bold text-gray-900 tabular-nums leading-none">
        {value}
      </div>
    </div>
  </div>
);

// ============================================================
// Main Component
// ============================================================
const RestoreManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [activeType, setActiveType] = useState('farms');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [restoringId, setRestoringId] = useState(null);

  // Debounce
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: summary } = useTrashSummaryQuery();

  const farmsQuery = useDeletedFarmsQuery({
    search: debouncedSearch || null,
    enabled: activeType === 'farms',
  });

  const farmersQuery = useDeletedFarmersQuery({
    search: debouncedSearch || null,
    enabled: activeType === 'farmers',
  });

  const restoreFarmMutation = useRestoreFarmMutation();
  const restoreFarmerMutation = useRestoreFarmerMutation();

  const isLoading =
    activeType === 'farms' ? farmsQuery.isLoading : farmersQuery.isLoading;
  const items =
    activeType === 'farms'
      ? farmsQuery.data?.items || []
      : farmersQuery.data?.items || [];
  const total =
    activeType === 'farms'
      ? farmsQuery.data?.total || 0
      : farmersQuery.data?.total || 0;

  // ─── Restore handler ───
  const handleRestore = useCallback(
    async (item) => {
      const name =
        activeType === 'farms'
          ? item.farmer_name || `مزرعه ${item.farm_id?.slice(0, 8)}`
          : `${item.fname || ''} ${item.lname || ''}`.trim() ||
            item.national_id;

      const ok = await confirm({
        title: 'بازگردانی',
        message: `آیا «${name}» بازگردانی شود؟\nاین آیتم به لیست عادی برمی‌گردد.`,
        confirmText: 'بازگردان',
        cancelText: 'انصراف',
        variant: 'primary',
      });
      if (!ok) return;

      setRestoringId(item.id || item.farm_id);

      try {
        if (activeType === 'farms') {
          await restoreFarmMutation.mutateAsync(item.farm_id);
        } else {
          await restoreFarmerMutation.mutateAsync(item.id);
        }
        toast.success('با موفقیت بازگردانی شد', 'موفق');
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          'خطا در بازگردانی';
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
      } finally {
        setRestoringId(null);
      }
    },
    [
      activeType,
      confirm,
      restoreFarmMutation,
      restoreFarmerMutation,
      toast,
    ],
  );

  // ─── Format date ───
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-xl">
        <AlertCircle
          size={14}
          className="text-sky-600 flex-shrink-0 mt-0.5"
        />
        <div className="text-xs text-sky-800 leading-relaxed">
          <strong>سبد بازیابی</strong> — داده‌های حذف‌شده اینجا
          نگه‌داری می‌شوند. اگر اشتباهاً حذف شده‌اند، می‌توانید
          بازگردانی کنید.
        </div>
      </div>

      {/* Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-2 gap-2">
          <KpiCard
            icon={Wheat}
            label="مزارع حذف‌شده"
            value={(summary.deleted_farms || 0).toLocaleString('fa-IR')}
            color="text-rose-700 bg-rose-50"
          />
          <KpiCard
            icon={Users}
            label="کشاورزان حذف‌شده"
            value={(summary.deleted_farmers || 0).toLocaleString('fa-IR')}
            color="text-rose-700 bg-rose-50"
          />
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => {
              setActiveType('farms');
              setSearchTerm('');
              setDebouncedSearch('');
            }}
            className={`
              flex items-center gap-2 px-5 py-3 text-xs font-bold
              border-b-2 transition-all
              ${
                activeType === 'farms'
                  ? 'border-primary-600 text-primary-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Wheat size={14} />
            مزارع
            {summary?.deleted_farms > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                {summary.deleted_farms.toLocaleString('fa-IR')}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveType('farmers');
              setSearchTerm('');
              setDebouncedSearch('');
            }}
            className={`
              flex items-center gap-2 px-5 py-3 text-xs font-bold
              border-b-2 transition-all
              ${
                activeType === 'farmers'
                  ? 'border-primary-600 text-primary-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Users size={14} />
            کشاورزان
            {summary?.deleted_farmers > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                {summary.deleted_farmers.toLocaleString('fa-IR')}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pr-9 pl-8 py-2 rounded-lg
                border border-gray-200 text-sm bg-white
                focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all
              "
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="
                  absolute left-2 top-1/2 -translate-y-1/2
                  p-1 rounded-md text-gray-400
                  hover:bg-gray-100 hover:text-gray-600
                "
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={24}
                className="text-primary-600 animate-spin"
              />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-3">
                <Trash2 size={20} />
              </div>
              {debouncedSearch
                ? 'موردی با این مشخصات یافت نشد'
                : 'سبد بازیابی خالی است ✅'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    #
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    {activeType === 'farms' ? 'کشاورز / کد مزرعه' : 'نام / کد ملی'}
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    اطلاعات
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase">
                    تاریخ حذف
                  </th>
                  <th className="text-center px-3 py-2.5 font-semibold text-[11px] text-gray-500 uppercase w-32">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const itemKey = item.farm_id || item.id;
                  const isRestoring = restoringId === item.id ||
                    restoringId === item.farm_id;

                  return (
                    <tr
                      key={itemKey}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-gray-400 text-xs">
                        {index + 1}
                      </td>

                      <td className="px-3 py-2.5">
                        {activeType === 'farms' ? (
                          <div>
                            <div className="text-xs font-semibold text-gray-800">
                              {item.farmer_name || 'بدون نام'}
                            </div>
                            <div
                              className="text-[10px] text-gray-400 font-mono mt-0.5"
                              dir="ltr"
                            >
                              {item.farm_id?.slice(0, 14)}…
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-semibold text-gray-800">
                              {`${item.fname || ''} ${item.lname || ''}`.trim() ||
                                'بدون نام'}
                            </div>
                            <div
                              className="text-[10px] text-gray-400 font-mono mt-0.5"
                              dir="ltr"
                            >
                              {item.national_id}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2.5">
                        {activeType === 'farms' ? (
                          <div className="text-[11px] text-gray-600">
                            {(item.area_ha || 0).toLocaleString('fa-IR', {
                              maximumFractionDigits: 2,
                            })}{' '}
                            ha
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-600" dir="ltr">
                            {item.phone_number}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock size={10} className="text-gray-400" />
                          <span>{formatDate(item.deleted_at)}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRestore(item)}
                            disabled={isRestoring}
                            className="
                              inline-flex items-center gap-1.5
                              px-3 py-1.5 rounded-lg
                              bg-emerald-50 text-emerald-700
                              hover:bg-emerald-100
                              border border-emerald-200
                              text-[11px] font-bold
                              transition-colors
                              disabled:opacity-50 disabled:cursor-wait
                            "
                          >
                            {isRestoring ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <RotateCcw size={12} />
                            )}
                            بازگردانی
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {total > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-[11px] text-gray-500">
            مجموع:{' '}
            <strong className="text-gray-700">
              {total.toLocaleString('fa-IR')}
            </strong>{' '}
            مورد
          </div>
        )}
      </div>
    </div>
  );
};

export default RestoreManagement;