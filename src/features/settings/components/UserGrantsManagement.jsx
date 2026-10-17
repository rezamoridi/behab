// src/features/settings/components/UserGrantsManagement.jsx
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Plus,
  X,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
  Ban,
  Clock,
  CheckCircle2,
  User as UserIcon,
  Wheat,
  Users,
  FileDown,
  Info,
  RefreshCw,
} from 'lucide-react';

import { permissionApi } from '../../../services/api/permissionApi';
import { settingsApi } from '../../../services/api/settingsApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════
const PERMISSION_OPTIONS = [
  {
    value: 'view',
    label: 'مشاهده',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    value: 'view_full',
    label: 'مشاهدهٔ کامل',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  },
  {
    value: 'edit',
    label: 'ویرایش',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    value: 'delete',
    label: 'حذف',
    color: 'text-red-700 bg-red-50 border-red-200',
  },
  {
    value: 'export',
    label: 'خروجی',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    value: 'geometry',
    label: 'هندسه',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
];

const getPermissionInfo = (value) =>
  PERMISSION_OPTIONS.find((o) => o.value === value) || {
    value,
    label: value,
    color: 'text-gray-700 bg-gray-50 border-gray-200',
  };

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
const grantKeys = {
  all: ['user-grants'],
  list: (params) => [...grantKeys.all, 'list', params],
};

// ═══════════════════════════════════════════════════════════
// Permission Badge
// ═══════════════════════════════════════════════════════════
const PermissionBadge = ({ value }) => {
  const info = getPermissionInfo(value);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${info.color}`}
    >
      {info.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// Grant Status Badge
// ═══════════════════════════════════════════════════════════
const GrantStatusBadge = ({ grant }) => {
  if (grant.revoked_at) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold">
        <Ban size={9} strokeWidth={2.6} />
        ابطال‌شده
      </span>
    );
  }

  if (grant.is_expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
        <Clock size={9} strokeWidth={2.6} />
        منقضی‌شده
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
      <CheckCircle2 size={9} strokeWidth={2.6} />
      فعال
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// Create Grant Modal
// ═══════════════════════════════════════════════════════════
const CreateGrantModal = ({ onClose, onSuccess }) => {
  const toast = useToast();

  const [form, setForm] = useState({
    grantee_user_id: '',
    resource_type: 'farm',
    resource_id: '',
    permissions: ['view'],
    reason: '',
    expires_at: '',
  });

  const [errors, setErrors] = useState({});

  // دریافت کاربران (غیر super_admin)
  const { data: usersData = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'list', 'for-grants'],
    queryFn: async () => {
      const res = await settingsApi.getUsers({ page: 1, size: 100 });
      const items = res.data?.items || res.data || [];
      // فقط کاربران غیر super_admin
      return items.filter((u) => u.role !== 'super_admin');
    },
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => permissionApi.userGrant.create(data),
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ایجاد مجوز';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا',
      );
    },
  });

  const togglePermission = (value) => {
    setForm((prev) => {
      const has = prev.permissions.includes(value);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== value)
          : [...prev.permissions, value],
      };
    });
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.grantee_user_id)
      errs.grantee_user_id = 'کاربر را انتخاب کنید';
    if (!form.resource_id) errs.resource_id = 'شناسه منبع الزامی است';
    if (form.permissions.length === 0)
      errs.permissions = 'حداقل یک مجوز انتخاب کنید';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    createMutation.mutate({
      granteeUserId: Number(form.grantee_user_id),
      resourceType: form.resource_type,
      resourceId: String(form.resource_id).trim(),
      permissions: form.permissions,
      reason: form.reason.trim() || null,
      expiresAt: form.expires_at || null,
    });
  };

  const isSubmitting = createMutation.isPending;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                اعطای مجوز استثنایی
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                دسترسی به یک منبع خاص از کاربر دیگر
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Grantee */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              کاربر گیرندهٔ مجوز{' '}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={form.grantee_user_id}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  grantee_user_id: e.target.value,
                }))
              }
              disabled={isSubmitting || usersLoading}
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm
                cursor-pointer outline-none transition-all
                ${
                  errors.grantee_user_id
                    ? 'border-red-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                }
              `}
            >
              <option value="">
                {usersLoading ? 'در حال بارگذاری...' : '— انتخاب کنید —'}
              </option>
              {usersData.map((u) => {
                const name =
                  `${u.fname || ''} ${u.lname || ''}`.trim() ||
                  u.username;
                return (
                  <option key={u.id} value={u.id}>
                    {name} ({u.role})
                  </option>
                );
              })}
            </select>
            {errors.grantee_user_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.grantee_user_id}
              </p>
            )}
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              نوع منبع
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'farm', label: 'مزرعه', icon: Wheat },
                { value: 'farmer', label: 'کشاورز', icon: Users },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = form.resource_type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        resource_type: opt.value,
                        resource_id: '',
                      }))
                    }
                    disabled={isSubmitting}
                    className={`
                      flex items-center justify-center gap-2
                      px-3 py-2.5 rounded-lg border-2 text-xs font-bold
                      transition-all cursor-pointer
                      ${
                        isActive
                          ? 'bg-primary-50 border-primary-400 text-primary-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon size={14} strokeWidth={2.4} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource ID */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {form.resource_type === 'farm'
                ? 'شناسهٔ مزرعه (farm_id)'
                : 'شناسهٔ کشاورز (id)'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.resource_id}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  resource_id: e.target.value,
                }))
              }
              disabled={isSubmitting}
              placeholder={
                form.resource_type === 'farm'
                  ? 'مثال: a1b2c3d4-...'
                  : 'مثال: 42'
              }
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono
                outline-none transition-all
                ${
                  errors.resource_id
                    ? 'border-red-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                }
              `}
              style={{ direction: 'ltr' }}
            />
            {errors.resource_id && (
              <p className="mt-1 text-xs text-red-600">
                {errors.resource_id}
              </p>
            )}
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              مجوزها <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSION_OPTIONS.map((opt) => {
                const isSelected = form.permissions.includes(
                  opt.value,
                );
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => togglePermission(opt.value)}
                    disabled={isSubmitting}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg
                      border-2 transition-all cursor-pointer text-right
                      ${
                        isSelected
                          ? `${opt.color} font-bold scale-[1.01]`
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    <span
                      className={`
                        w-4 h-4 rounded flex items-center justify-center
                        border-2 flex-shrink-0 transition-colors
                        ${
                          isSelected
                            ? 'bg-current border-current'
                            : 'bg-white border-gray-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.permissions && (
              <p className="mt-1 text-xs text-red-600">
                {errors.permissions}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              دلیل (اختیاری)
            </label>
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((p) => ({ ...p, reason: e.target.value }))
              }
              disabled={isSubmitting}
              rows={2}
              maxLength={500}
              placeholder="مثال: انتقال مسئولیت به دلیل مرخصی"
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all resize-none
              "
            />
          </div>

          {/* Expires */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              تاریخ انقضا (اختیاری)
            </label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  expires_at: e.target.value,
                }))
              }
              disabled={isSubmitting}
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all
              "
              style={{ direction: 'ltr' }}
            />
            <p className="mt-1 text-[10px] text-gray-400">
              اگر خالی بماند، مجوز بدون انقضا خواهد بود.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            اعطای مجوز
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ✅ Revoke Reason Modal — جایگزین window.prompt
// ═══════════════════════════════════════════════════════════
const RevokeReasonModal = ({
  grant,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Ban size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                ابطال مجوز
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                برای: {grant?.grantee_username || '—'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            دلیل ابطال (اختیاری)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="مثال: پایان ماموریت، تغییر مسئولیت..."
            disabled={isSubmitting}
            className="
              w-full px-3.5 py-2.5 rounded-lg border border-gray-300
              text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
              outline-none transition-all resize-none
              disabled:bg-gray-50
            "
            autoFocus
          />
          <div className="text-[10px] text-gray-400 text-left">
            {reason.length} / 500
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            ابطال کن
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
const UserGrantsManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revokeModal, setRevokeModal] = useState(null); // { grant }
  const [searchTerm, setSearchTerm] = useState('');
  const [includeRevoked, setIncludeRevoked] = useState(false);
  const [resourceFilter, setResourceFilter] = useState('');

  // ── Query ──
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: grantKeys.list({ includeRevoked }),
    queryFn: () =>
      permissionApi.userGrant.list({ includeRevoked }),
    staleTime: 60 * 1000,
  });

  const grants = useMemo(() => data?.items || [], [data]);

  // ── Filter ──
  const filteredGrants = useMemo(() => {
    let list = grants;

    if (resourceFilter) {
      list = list.filter((g) => g.resource_type === resourceFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((g) => {
        return (
          (g.grantee_username || '')
            .toLowerCase()
            .includes(term) ||
          (g.grantor_username || '')
            .toLowerCase()
            .includes(term) ||
          (g.resource_id || '').toLowerCase().includes(term) ||
          (g.reason || '').toLowerCase().includes(term)
        );
      });
    }

    return list;
  }, [grants, searchTerm, resourceFilter]);

  // ── Revoke Mutation ──
  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      permissionApi.userGrant.revoke(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grantKeys.all });
      toast.success('مجوز ابطال شد', 'موفق');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ابطال';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا',
      );
    },
  });

  // ✅ فاز ۲: دو مرحله — confirm بومی + مودال دلیل
  const handleRevoke = useCallback(
    async (grant) => {
      const ok = await confirm({
        title: 'ابطال مجوز',
        message: `آیا از ابطال این مجوز برای «${
          grant.grantee_username || 'کاربر'
        }» اطمینان دارید؟\nاین عمل قابل بازگشت نیست (ولی در تاریخچه می‌ماند).`,
        confirmText: 'ادامه',
        cancelText: 'انصراف',
        variant: 'danger',
      });
      if (!ok) return;

      // ✅ باز کردن مودال دلیل (به‌جای window.prompt)
      setRevokeModal({ grant });
    },
    [confirm],
  );

  // ✅ تایید نهایی از مودال
  const handleConfirmRevoke = useCallback(
    (reason) => {
      if (!revokeModal) return;
      revokeMutation.mutate({
        id: revokeModal.grant.id,
        reason,
      });
      setRevokeModal(null);
    },
    [revokeModal, revokeMutation],
  );

  const handleCloseRevokeModal = useCallback(() => {
    if (revokeMutation.isPending) return;
    setRevokeModal(null);
  }, [revokeMutation.isPending]);

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: grantKeys.all });
    toast.success('مجوز جدید اعطا شد', 'موفق');
  };

  // ── Stats ──
  const stats = useMemo(() => {
    const active = grants.filter(
      (g) => g.is_active && !g.revoked_at,
    ).length;
    const revoked = grants.filter((g) => g.revoked_at).length;
    const expired = grants.filter(
      (g) => g.is_expired && !g.revoked_at,
    ).length;
    return { total: grants.length, active, revoked, expired };
  }, [grants]);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3"
      dir="rtl"
    >
      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <Info
          size={14}
          className="text-emerald-600 flex-shrink-0 mt-0.5"
        />
        <div className="text-xs text-emerald-800 leading-relaxed">
          <strong>مجوزهای استثنایی</strong> — به یک کاربر خاص اجازه
          می‌دهد به یک منبع مشخص از کاربر دیگر دسترسی داشته باشد.
          این مجوزها روی دسترسی پایهٔ نقش اضافه می‌شوند و
          در تاریخچه ثبت می‌مانند.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="text-[10px] text-gray-500 mb-0.5">
            کل مجوزها
          </div>
          <div className="text-lg font-bold text-gray-900">
            {stats.total.toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          <div className="text-[10px] text-emerald-600 mb-0.5">
            فعال
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {stats.active.toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="text-[10px] text-gray-500 mb-0.5">
            ابطال‌شده
          </div>
          <div className="text-lg font-bold text-gray-700">
            {stats.revoked.toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
          <div className="text-[10px] text-amber-600 mb-0.5">
            منقضی
          </div>
          <div className="text-lg font-bold text-amber-700">
            {stats.expired.toLocaleString('fa-IR')}
          </div>
        </div>
      </div>

      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          <h3 className="text-base font-semibold text-gray-900">
            مجوزهای استثنایی
          </h3>
          <span className="text-xs text-gray-400">
            ({filteredGrants.length.toLocaleString('fa-IR')})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-52 pr-9 pl-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            title="بروزرسانی"
          >
            <RefreshCw
              size={14}
              className={isFetching ? 'animate-spin' : ''}
            />
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700"
          >
            <Plus size={14} />
            اعطای مجوز
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white cursor-pointer focus:border-primary-500 outline-none"
        >
          <option value="">نوع منبع: همه</option>
          <option value="farm">مزرعه</option>
          <option value="farmer">کشاورز</option>
        </select>

        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeRevoked}
            onChange={(e) => setIncludeRevoked(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary-600 cursor-pointer"
          />
          <span>نمایش ابطال‌شده‌ها</span>
        </label>

        {(resourceFilter || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setResourceFilter('');
              setSearchTerm('');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
          >
            <X size={11} className="inline" /> پاک کردن
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              size={24}
              className="text-emerald-600 animate-spin"
            />
          </div>
        ) : filteredGrants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={20} />
            </div>
            <p className="text-sm text-gray-400">
              {searchTerm || resourceFilter
                ? 'موردی با این فیلترها یافت نشد'
                : 'هیچ مجوز استثنایی وجود ندارد'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase">
                  #
                </th>
                <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase">
                  گیرنده
                </th>
                <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase">
                  منبع
                </th>
                <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase">
                  مجوزها
                </th>
                <th className="text-center px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase">
                  وضعیت
                </th>
                <th className="text-right px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase">
                  اعطاکننده
                </th>
                <th className="text-center px-3 py-3 font-semibold text-[11px] text-gray-500 uppercase">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGrants.map((grant, idx) => (
                <tr
                  key={grant.id}
                  className={`
                    transition-colors
                    ${
                      grant.revoked_at
                        ? 'bg-gray-50/50 opacity-60'
                        : 'hover:bg-gray-50/80'
                    }
                  `}
                >
                  <td className="px-3 py-3 text-gray-400 text-xs">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <UserIcon size={12} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-800 truncate">
                          {grant.grantee_username || '—'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          id: {grant.grantee_user_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                          text-[10px] font-bold border
                          ${
                            grant.resource_type === 'farm'
                              ? 'bg-primary-50 text-primary-700 border-primary-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }
                        `}
                      >
                        {grant.resource_type === 'farm' ? (
                          <Wheat size={9} />
                        ) : (
                          <Users size={9} />
                        )}
                        {grant.resource_type === 'farm'
                          ? 'مزرعه'
                          : 'کشاورز'}
                      </span>
                      <span
                        className="text-[10px] font-mono text-gray-500 truncate max-w-[120px]"
                        dir="ltr"
                      >
                        {grant.resource_id.length > 15
                          ? `${grant.resource_id.slice(0, 15)}…`
                          : grant.resource_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {grant.permissions.map((p) => (
                        <PermissionBadge key={p} value={p} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <GrantStatusBadge grant={grant} />
                    {grant.expires_at && (
                      <div className="text-[9px] text-gray-400 mt-1">
                        انقضا:{' '}
                        {new Date(
                          grant.expires_at,
                        ).toLocaleDateString('fa-IR')}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-[11px] text-gray-600 truncate">
                      {grant.grantor_username || '—'}
                    </div>
                    <div className="text-[9px] text-gray-400">
                      {new Date(
                        grant.created_at,
                      ).toLocaleDateString('fa-IR')}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {!grant.revoked_at && !grant.is_expired && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(grant)}
                        disabled={revokeMutation.isPending}
                        title="ابطال"
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                    {grant.revoked_at && (
                      <span className="text-[10px] text-gray-400">
                        ابطال‌شده
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reason column — اگر وجود دارد، در سطر نمایش داده می‌شود */}
      {filteredGrants.some((g) => g.reason) && (
        <div className="pt-3 border-t border-gray-100">
          <div className="text-[10px] font-semibold text-gray-500 mb-2">
            دلیلها:
          </div>
          <div className="space-y-1">
            {filteredGrants
              .filter((g) => g.reason)
              .map((g) => (
                <div
                  key={`reason-${g.id}`}
                  className="text-[11px] text-gray-600 bg-gray-50 rounded-md px-2 py-1.5 border border-gray-100"
                >
                  <span className="font-bold text-gray-700">
                    #{g.id} ({g.grantee_username}):
                  </span>{' '}
                  {g.reason}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <CreateGrantModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* ✅ Revoke Reason Modal — جایگزین window.prompt */}
      {revokeModal && (
        <RevokeReasonModal
          grant={revokeModal.grant}
          onClose={handleCloseRevokeModal}
          onConfirm={handleConfirmRevoke}
          isSubmitting={revokeMutation.isPending}
        />
      )}
    </div>
  );
};

export default UserGrantsManagement;