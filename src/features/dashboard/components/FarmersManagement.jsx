// src/features/dashboard/components/FarmersManagement.jsx
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Users,
  Phone,
  CreditCard,
  CheckCircle2,
  Clock,
  UserPlus,
  Send,
  AlertCircle,
  CheckSquare,
  SendHorizontal,
  FileDown,
  Loader2,
  Layers,
} from 'lucide-react';
import { farmerApi } from '../../../services/api/farmerApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { useRegionsQuery } from '../../regions/hooks/useRegions';
import useSessionState from '../../../shared/hooks/useSessionState';

// ============================================================
// Query Keys
// ============================================================
const farmerKeys = {
  all: ['farmers'],
  lists: () => [...farmerKeys.all, 'list'],
  list: (params) => [...farmerKeys.lists(), params],
};

// ============================================================
// Status Badge
// ============================================================
const StatusBadge = ({ farmer }) => {
  if (farmer.password_changed_at) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
        <CheckCircle2 size={10} strokeWidth={2.4} />
        فعال
      </span>
    );
  }
  if (farmer.first_login_at) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
        <Clock size={10} strokeWidth={2.4} />
        لاگین کرده
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
      <UserPlus size={10} strokeWidth={2.4} />
      دعوت‌شده
    </span>
  );
};

// ============================================================
// Bulk Actions Bar
// ============================================================
const BulkActionsBar = ({
  selectedCount,
  onClear,
  onResend,
  onDelete,
  onExport,
  isResending,
  isDeleting,
  isExporting,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className="
        flex items-center justify-between gap-3
        px-4 py-2.5 mb-3
        bg-gradient-to-l from-primary-500/15 via-white/70 to-blue-500/10
        backdrop-blur-xl
        border border-primary-300/50
        rounded-xl
        shadow-[0_4px_16px_rgba(46,125,50,0.12)]
        animate-fadeInUp
      "
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary-500/20 border border-primary-300/50 flex items-center justify-center">
          <CheckSquare size={13} className="text-primary-700" strokeWidth={2.4} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-slate-500 font-medium">
            انتخاب شده
          </span>
          <span className="text-xs font-bold text-slate-900">
            {selectedCount.toLocaleString('fa-IR')} نفر
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onResend}
          disabled={isResending || isDeleting || isExporting}
          className="
            flex items-center gap-1.5
            px-3 py-1.5 rounded-lg
            bg-amber-500/15 hover:bg-amber-500/25
            text-amber-800 text-[11px] font-bold
            border border-amber-400/40
            transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="ارسال دعوت مجدد به انتخاب‌شده‌ها"
        >
          {isResending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <SendHorizontal size={12} strokeWidth={2.4} />
          )}
          <span>ارسال دعوت</span>
        </button>

        <button
          type="button"
          onClick={onExport}
          disabled={isResending || isDeleting || isExporting}
          className="
            flex items-center gap-1.5
            px-3 py-1.5 rounded-lg
            bg-emerald-500/15 hover:bg-emerald-500/25
            text-emerald-800 text-[11px] font-bold
            border border-emerald-400/40
            transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="خروجی Excel از انتخاب‌شده‌ها"
        >
          {isExporting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <FileDown size={12} strokeWidth={2.4} />
          )}
          <span>Excel</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting || isResending || isExporting}
          className="
            flex items-center gap-1.5
            px-3 py-1.5 rounded-lg
            bg-red-500/15 hover:bg-red-500/25
            text-red-800 text-[11px] font-bold
            border border-red-400/40
            transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          title="حذف انتخاب‌شده‌ها"
        >
          {isDeleting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Trash2 size={12} strokeWidth={2.4} />
          )}
          <span>حذف</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={isResending || isDeleting || isExporting}
          className="
            flex items-center gap-1
            px-2.5 py-1.5 rounded-lg
            text-slate-600 hover:text-slate-800 hover:bg-white/60
            text-[11px] font-medium
            transition-colors cursor-pointer
            disabled:opacity-50
          "
          title="پاک کردن انتخاب"
        >
          <X size={12} strokeWidth={2.4} />
          <span>لغو</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Row Checkbox
// ============================================================
const RowCheckbox = ({ checked, indeterminate = false, onChange }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
    className="
      w-5 h-5 rounded flex items-center justify-center flex-shrink-0
      border-2 transition-colors
      cursor-pointer
      focus:outline-none focus:ring-2 focus:ring-primary-500/30
    "
    style={{
      backgroundColor: checked || indeterminate ? '#2e7d32' : '#ffffff',
      borderColor: checked || indeterminate ? '#2e7d32' : '#cbd5e1',
    }}
    role="checkbox"
    aria-checked={checked}
  >
    {checked && (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
    {indeterminate && !checked && (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
        <rect x="4" y="10" width="16" height="4" />
      </svg>
    )}
  </button>
);

// ============================================================
// Region Filter (فقط super_admin)
// ============================================================
const RegionFilterSelect = ({ value, onChange }) => {
  const { data: regions = [] } = useRegionsQuery({ activeOnly: true });

  return (
    <div className="relative">
      <Layers
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 pointer-events-none z-10"
      />
      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
        className={`
          w-full md:w-44 pr-8 pl-7 py-2 rounded-lg border text-sm
          outline-none transition-all cursor-pointer appearance-none
          ${
            value != null
              ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold'
              : 'bg-white border-gray-300 text-gray-700'
          }
          focus:border-purple-500 focus:ring-2 focus:ring-purple-200
        `}
      >
        <option value="">همه مناطق</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={value != null ? 'text-purple-600' : 'text-gray-400'}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================
const FarmersManagement = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { isSuperAdmin } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [formData, setFormData] = useState({
    national_id: '',
    phone_number: '',
    fname: '',
    lname: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // ✅ Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkResending, setIsBulkResending] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Region filter (فقط super_admin از آن استفاده می‌کند)
  const [regionFilter, setRegionFilter] = useSessionState(
    'farmers_region_filter',
    null,
  );

  // ── Query ──
  const { data, isLoading, refetch } = useQuery({
    queryKey: farmerKeys.list({
      page: 1,
      pageSize: 200,
      search: null,
      regionFilter: isSuperAdmin ? regionFilter : null,
    }),
    queryFn: () =>
      farmerApi.list({
        page: 1,
        pageSize: 200,
        regionFilter: isSuperAdmin ? regionFilter : null,
      }),
    staleTime: 60 * 1000,
  });

  const farmers = useMemo(() => data?.items || [], [data]);

  // ── Filter ──
  const filteredFarmers = useMemo(() => {
    if (!searchTerm.trim()) return farmers;
    const term = searchTerm.trim().toLowerCase();
    return farmers.filter((f) => {
      const fullName = `${f.fname || ''} ${f.lname || ''}`.toLowerCase();
      return (
        (f.national_id || '').includes(term) ||
        (f.phone_number || '').includes(term) ||
        fullName.includes(term)
      );
    });
  }, [farmers, searchTerm]);

  // ── Select/Deselect all ──
  const allSelected =
    filteredFarmers.length > 0 &&
    filteredFarmers.every((f) => selectedIds.has(f.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFarmers.map((f) => f.id)));
    }
  }, [allSelected, filteredFarmers]);

  const handleToggleRow = useCallback((farmerId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(farmerId)) next.delete(farmerId);
      else next.add(farmerId);
      return next;
    });
  }, []);

  // ── Mutations ──
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => farmerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => farmerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
    },
  });

  const resendMutation = useMutation({
    mutationFn: (id) => farmerApi.resendInvitation(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
      toast.success(
        `پیامک دعوت ارسال شد (تعداد کل: ${result.invitation_count})`,
        'ارسال موفق',
      );
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ارسال پیامک';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    },
  });

  // ── Handlers ──
  const handleEditClick = useCallback((farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      national_id: farmer.national_id || '',
      phone_number: farmer.phone_number || '',
      fname: farmer.fname || '',
      lname: farmer.lname || '',
    });
    setFormErrors({});
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingFarmer(null);
    setFormErrors({});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.national_id || formData.national_id.length < 10) {
      errors.national_id = 'کد ملی باید ۱۰ رقم باشد';
    }
    if (!formData.fname || formData.fname.length < 2) {
      errors.fname = 'نام الزامی است';
    }
    if (!formData.lname || formData.lname.length < 2) {
      errors.lname = 'نام خانوادگی الزامی است';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !editingFarmer) return;

    try {
      await updateMutation.mutateAsync({
        id: editingFarmer.id,
        data: {
          national_id: formData.national_id,
          fname: formData.fname,
          lname: formData.lname,
        },
      });
      toast.success('اطلاعات کشاورز به‌روزرسانی شد', 'ذخیره شد');
      handleCloseModal();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ذخیره اطلاعات';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    }
  };

  const handleDelete = useCallback(
    async (farmer) => {
      const fullName = `${farmer.fname || ''} ${farmer.lname || ''}`.trim();
      const ok = await confirm({
        title: 'حذف کشاورز',
        message: `آیا از حذف کشاورز «${fullName || farmer.national_id}» اطمینان دارید؟\nمزارع مرتبط حفظ می‌شوند ولی farmer_id آن‌ها NULL می‌شود.`,
        confirmText: 'حذف کن',
        cancelText: 'انصراف',
        variant: 'danger',
      });
      if (!ok) return;

      try {
        await deleteMutation.mutateAsync(farmer.id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(farmer.id);
          return next;
        });
        toast.success('کشاورز حذف شد', 'حذف شد');
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          'خطا در حذف';
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
      }
    },
    [confirm, deleteMutation, toast],
  );

  const handleResend = useCallback(
    async (farmer) => {
      try {
        await resendMutation.mutateAsync(farmer.id);
      } catch {
        /* handled in onError */
      }
    },
    [resendMutation],
  );

  // ══════════════════════════════════════════════════════════
  // ✅ Bulk actions
  // ══════════════════════════════════════════════════════════

  const handleBulkResend = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const pendingFarmers = farmers.filter(
      (f) => selectedIds.has(f.id) && !f.password_changed_at,
    );

    if (pendingFarmers.length === 0) {
      toast.warning(
        'هیچ کشاورز در انتظار دعوتی در انتخاب شما نیست',
        'توجه',
      );
      return;
    }

    const ok = await confirm({
      title: 'ارسال دعوت مجدد',
      message: `آیا می‌خواهید برای ${pendingFarmers.length.toLocaleString('fa-IR')} کشاورز انتخاب‌شده پیامک دعوت ارسال کنید؟\n(فقط کشاورزان در انتظار دعوت)`,
      confirmText: 'ارسال کن',
      cancelText: 'انصراف',
      variant: 'danger',
    });
    if (!ok) return;

    setIsBulkResending(true);
    let successCount = 0;
    let failCount = 0;

    for (const farmer of pendingFarmers) {
      try {
        await farmerApi.resendInvitation(farmer.id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkResending(false);
    queryClient.invalidateQueries({ queryKey: farmerKeys.all });

    if (successCount > 0) {
      toast.success(
        `${successCount.toLocaleString('fa-IR')} دعوت ارسال شد${failCount > 0 ? ` (${failCount.toLocaleString('fa-IR')} ناموفق)` : ''}`,
        'ارسال گروهی',
      );
    } else {
      toast.error('هیچ دعوتی ارسال نشد', 'خطا');
    }

    setSelectedIds(new Set());
  }, [selectedIds, farmers, confirm, queryClient, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const ok = await confirm({
      title: 'حذف گروهی',
      message: `آیا از حذف ${selectedIds.size.toLocaleString('fa-IR')} کشاورز انتخاب‌شده اطمینان دارید؟\nمزارع مرتبط حفظ می‌شوند ولی farmer_id آن‌ها NULL می‌شود.`,
      confirmText: 'حذف کن',
      cancelText: 'انصراف',
      variant: 'danger',
    });
    if (!ok) return;

    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        await farmerApi.delete(id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkDeleting(false);
    queryClient.invalidateQueries({ queryKey: farmerKeys.all });

    if (successCount > 0) {
      toast.success(
        `${successCount.toLocaleString('fa-IR')} کشاورز حذف شد${failCount > 0 ? ` (${failCount.toLocaleString('fa-IR')} ناموفق)` : ''}`,
        'حذف گروهی',
      );
    } else {
      toast.error('هیچ کشاورزی حذف نشد', 'خطا');
    }

    setSelectedIds(new Set());
  }, [selectedIds, confirm, queryClient, toast]);

  // ✅ خروجی Excel — از endpoint جدید backend
  const handleBulkExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await farmerApi.exportExcel({
        search: searchTerm.trim() || null,
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `farmers-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('خروجی Excel دانلود شد', 'موفق');
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || 'خطا در خروجی',
        'خطا',
      );
    } finally {
      setIsExporting(false);
    }
  }, [searchTerm, toast]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // ── تغییر فیلتر منطقه: ریست انتخاب‌ها ──
  const handleRegionFilterChange = useCallback(
    (val) => {
      setRegionFilter(val);
      setSelectedIds(new Set());
    },
    [setRegionFilter],
  );

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3"
      dir="rtl"
    >
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            لیست کشاورزان
          </h3>
          <span className="text-xs text-gray-400">
            ({filteredFarmers.length.toLocaleString('fa-IR')} از{' '}
            {farmers.length.toLocaleString('fa-IR')})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* ✅ فیلتر منطقه — فقط super_admin */}
          {isSuperAdmin && (
            <RegionFilterSelect
              value={regionFilter}
              onChange={handleRegionFilterChange}
            />
          )}

          {/* جستجو */}
          <div className="relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی کشاورز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pr-9 pl-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ─── Bulk Actions Bar ─── */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onClear={handleClearSelection}
        onResend={handleBulkResend}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        isResending={isBulkResending}
        isDeleting={isBulkDeleting}
        isExporting={isExporting}
      />

      {/* ─── Table ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-10 px-3 py-3">
                <RowCheckbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="text-right px-3 py-3 font-semibold text-gray-600">
                #
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                نام و نام خانوادگی
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                کد ملی
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                تلفن همراه
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                وضعیت
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 rounded-l-lg">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredFarmers.length > 0 ? (
              filteredFarmers.map((farmer, index) => {
                const fullName =
                  `${farmer.fname || ''} ${farmer.lname || ''}`.trim();
                const isPending = !farmer.password_changed_at;
                const isSelected = selectedIds.has(farmer.id);

                return (
                  <tr
                    key={farmer.id}
                    className={`
                      border-b border-gray-100 last:border-0
                      transition-colors
                      ${isSelected ? 'bg-primary-50/40' : 'hover:bg-gray-50'}
                    `}
                  >
                    <td className="w-10 px-3 py-3">
                      <RowCheckbox
                        checked={isSelected}
                        onChange={() => handleToggleRow(farmer.id)}
                      />
                    </td>

                    <td className="px-3 py-3 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {fullName || '—'}
                    </td>

                    <td
                      className="px-4 py-3 font-mono text-xs text-gray-700"
                      dir="ltr"
                    >
                      {farmer.national_id}
                    </td>

                    <td
                      className="px-4 py-3 text-gray-700"
                      dir="ltr"
                      style={{ textAlign: 'right' }}
                    >
                      {farmer.phone_number}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge farmer={farmer} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleResend(farmer)}
                            disabled={resendMutation.isPending}
                            title="ارسال مجدد پیامک دعوت"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEditClick(farmer)}
                          title="ویرایش"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(farmer)}
                          title="حذف"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-8 text-gray-400 text-sm"
                >
                  {searchTerm
                    ? 'کشاورزی با این مشخصات یافت نشد'
                    : 'هیچ کشاورزی ثبت نشده است'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Stats ─── */}
      <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex flex-wrap gap-4">
        <span>تعداد کل: {farmers.length.toLocaleString('fa-IR')}</span>
        {searchTerm && (
          <span>| نتایج: {filteredFarmers.length.toLocaleString('fa-IR')}</span>
        )}
        <span className="text-emerald-600">
          | فعال:{' '}
          {farmers
            .filter((f) => f.password_changed_at)
            .length.toLocaleString('fa-IR')}
        </span>
        <span className="text-amber-600">
          | در انتظار:{' '}
          {farmers
            .filter((f) => !f.password_changed_at)
            .length.toLocaleString('fa-IR')}
        </span>
      </div>

      {/* ─── Edit Modal ─── */}
      {editingFarmer && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h4 className="text-base font-semibold text-gray-900">
                ویرایش کشاورز
              </h4>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-400" />
                    کد ملی
                  </label>
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                      formErrors.national_id
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                    }`}
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                  {formErrors.national_id && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {formErrors.national_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    تلفن همراه
                    <span className="text-[10px] text-gray-400 font-normal">
                      (غیرقابل ویرایش)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      نام <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fname"
                      value={formData.fname}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                        formErrors.fname
                          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                      }`}
                    />
                    {formErrors.fname && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {formErrors.fname}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      نام خانوادگی <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lname"
                      value={formData.lname}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all ${
                        formErrors.lname
                          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                      }`}
                    />
                    {formErrors.lname && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {formErrors.lname}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmersManagement;