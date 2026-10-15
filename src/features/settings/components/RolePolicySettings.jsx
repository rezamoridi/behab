// src/features/settings/components/RolePolicySettings.jsx
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  Info,
  Check,
  ShieldAlert,
  Wheat,
  Users,
  Layers,
  Sprout,
  MessageSquare,
  Settings2,
  Lock,
} from 'lucide-react';

import { permissionApi } from '../../../services/api/permissionApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const ROLE_META = {
  super_admin: {
    label: 'مدیر ارشد',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: ShieldAlert,
    locked: true, // قابل ویرایش نیست
    description: 'دسترسی کامل — غیرقابل ویرایش',
  },
  manager: {
    label: 'مدیر منطقه',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    icon: Shield,
    locked: false,
    description: 'دسترسی مالکیت‌محور به منابع خودش',
  },
  dehyar: {
    label: 'دهیار',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    icon: Shield,
    locked: false,
    description: 'فقط منابعی که خودش ثبت کرده',
  },
  operator: {
    label: 'اپراتور',
    color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    icon: Shield,
    locked: false,
    description: 'فقط ثبت، بدون ویرایش/حذف',
  },
};

// ═══════════════════════════════════════════════════════════
// Permission metadata per resource
// ═══════════════════════════════════════════════════════════
const RESOURCE_META = {
  farm: {
    label: 'مزرعه',
    icon: Wheat,
    color: 'text-primary-700',
    actions: [
      {
        value: 'view_own',
        label: 'مشاهدهٔ مزارع خودش',
        hint: 'مزارعی که خودش ثبت کرده',
      },
      {
        value: 'view_reference_layer',
        label: 'مشاهدهٔ لایهٔ مرجع',
        hint: 'مزارع دیگران به‌صورت خنثی روی نقشه',
      },
      {
        value: 'create',
        label: 'ثبت مزرعهٔ جدید',
        hint: '',
      },
      {
        value: 'edit_own',
        label: 'ویرایش مزارع خودش',
        hint: '',
      },
      {
        value: 'delete_own',
        label: 'حذف مزارع خودش',
        hint: '',
      },
      {
        value: 'export',
        label: 'خروجی گرفتن',
        hint: 'Excel و گزارش‌ها',
      },
      {
        value: 'view_geometry',
        label: 'مشاهدهٔ هندسهٔ دقیق',
        hint: 'محدودهٔ دقیق روی نقشه',
      },
    ],
  },
  farmer: {
    label: 'کشاورز',
    icon: Users,
    color: 'text-emerald-700',
    actions: [
      { value: 'view_own', label: 'مشاهدهٔ کشاورزان خودش' },
      { value: 'create', label: 'ثبت کشاورز جدید' },
      { value: 'edit_own', label: 'ویرایش کشاورزان خودش' },
      { value: 'delete_own', label: 'حذف کشاورزان خودش' },
      { value: 'export', label: 'خروجی گرفتن' },
      {
        value: 'resend_invitation',
        label: 'ارسال مجدد پیامک دعوت',
      },
    ],
  },
  region: {
    label: 'منطقه',
    icon: Layers,
    color: 'text-purple-700',
    actions: [
      { value: 'view_own', label: 'مشاهدهٔ مناطق خودش' },
    ],
  },
  crop: {
    label: 'محصول',
    icon: Sprout,
    color: 'text-amber-700',
    actions: [{ value: 'view', label: 'مشاهدهٔ محصولات' }],
  },
  sms: {
    label: 'پیامک',
    icon: MessageSquare,
    color: 'text-sky-700',
    actions: [
      { value: 'send', label: 'ارسال پیامک' },
      { value: 'manage_templates', label: 'مدیریت قالب‌ها' },
    ],
  },
  user: {
    label: 'کاربران',
    icon: Users,
    color: 'text-red-700',
    actions: [
      { value: 'view', label: 'مشاهدهٔ کاربران' },
      { value: 'create', label: 'ایجاد کاربر' },
      { value: 'edit', label: 'ویرایش کاربر' },
      { value: 'delete', label: 'حذف کاربر' },
      {
        value: 'manage_permissions',
        label: 'مدیریت مجوزها',
      },
    ],
  },
  settings: {
    label: 'تنظیمات',
    icon: Settings2,
    color: 'text-gray-700',
    actions: [
      { value: 'view', label: 'مشاهدهٔ تنظیمات' },
    ],
  },
  admin: {
    label: 'مدیریت داده',
    icon: Lock,
    color: 'text-rose-700',
    actions: [
      { value: 'orphans', label: 'مدیریت داده‌های بی‌مالک' },
      { value: 'trash', label: 'سبد بازیابی' },
      { value: 'merge', label: 'ادغام تکراری‌ها' },
      { value: 'import', label: 'ورود داده' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
const rolePolicyKeys = {
  all: ['role-policies'],
  list: () => [...rolePolicyKeys.all, 'list'],
  detail: (role) => [...rolePolicyKeys.all, 'detail', role],
};

// ═══════════════════════════════════════════════════════════
// Role Editor
// ═══════════════════════════════════════════════════════════
const RoleEditor = ({ policy, onSave, isSubmitting }) => {
  const roleMeta = ROLE_META[policy.role] || {
    label: policy.role,
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    icon: Shield,
    locked: false,
  };
  const RoleIcon = roleMeta.icon;

  // فرم محلی — کپی از policy
  const [permissions, setPermissions] = useState(() => {
    const p = {};
    Object.keys(RESOURCE_META).forEach((res) => {
      p[res] = Array.isArray(policy.permissions?.[res])
        ? [...policy.permissions[res]]
        : [];
    });
    return p;
  });

  const [description, setDescription] = useState(
    policy.description || '',
  );

  // اگر policy تغییر کرد، form را همگام کن
  useEffect(() => {
    const p = {};
    Object.keys(RESOURCE_META).forEach((res) => {
      p[res] = Array.isArray(policy.permissions?.[res])
        ? [...policy.permissions[res]]
        : [];
    });
    setPermissions(p);
    setDescription(policy.description || '');
  }, [policy]);

  const togglePermission = (resource, action) => {
    setPermissions((prev) => {
      const current = prev[resource] || [];
      const has = current.includes(action);
      const updated = has
        ? current.filter((a) => a !== action)
        : [...current, action];

      return { ...prev, [resource]: updated };
    });
  };

  const isDirty = useMemo(() => {
    const original = policy.permissions || {};
    for (const res of Object.keys(RESOURCE_META)) {
      const a = [...(original[res] || [])].sort().join(',');
      const b = [...(permissions[res] || [])].sort().join(',');
      if (a !== b) return true;
    }
    if ((description || '') !== (policy.description || ''))
      return true;
    return false;
  }, [permissions, description, policy]);

  const handleSave = () => {
    const cleaned = {};
    Object.keys(RESOURCE_META).forEach((res) => {
      const arr = permissions[res] || [];
      if (arr.length > 0) cleaned[res] = arr;
    });

    onSave({
      permissions: cleaned,
      description: description.trim() || null,
    });
  };

  const handleReset = () => {
    const p = {};
    Object.keys(RESOURCE_META).forEach((res) => {
      p[res] = Array.isArray(policy.permissions?.[res])
        ? [...policy.permissions[res]]
        : [];
    });
    setPermissions(p);
    setDescription(policy.description || '');
  };

  if (roleMeta.locked) {
    return (
      <div className="bg-red-50/30 border-2 border-red-200 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
            <RoleIcon size={18} strokeWidth={2.4} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-gray-900">
                {roleMeta.label}
              </h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleMeta.color}`}
              >
                <Lock size={9} strokeWidth={2.6} />
                محافظت‌شده
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {roleMeta.description}
            </p>
          </div>
        </div>
        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 leading-relaxed">
          🔒 مجوزهای این نقش قابل ویرایش نیست. این نقش همیشه به
          تمام بخش‌ها دسترسی کامل دارد و از حذف/غیرفعال شدن
          محافظت می‌شود.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${roleMeta.color}`}
          >
            <RoleIcon size={18} strokeWidth={2.4} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              {roleMeta.label}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {roleMeta.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="
                flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                text-[11px] font-medium text-gray-600
                bg-white border border-gray-200
                hover:bg-gray-50 transition-colors
                disabled:opacity-50
              "
            >
              <RotateCcw size={11} />
              بازنشانی
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSubmitting}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              text-[11px] font-bold transition-colors
              ${
                isDirty && !isSubmitting
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Save size={11} />
            )}
            ذخیره
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pt-4">
        <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
          توضیح (اختیاری)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          placeholder="توضیح نقش..."
          className="
            w-full px-3 py-2 rounded-lg border border-gray-200
            text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
          "
        />
      </div>

      {/* Permissions */}
      <div className="p-5 space-y-4">
        {Object.entries(RESOURCE_META).map(([resKey, meta]) => {
          const Icon = meta.icon;
          const activePerms = permissions[resKey] || [];
          const allSelected =
            activePerms.length === meta.actions.length;

          return (
            <div
              key={resKey}
              className="border border-gray-100 rounded-xl overflow-hidden"
            >
              {/* Resource header */}
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <Icon
                    size={14}
                    strokeWidth={2.4}
                    className={meta.color}
                  />
                  <span className="text-xs font-bold text-gray-800">
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    ({activePerms.length}/
                    {meta.actions.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (allSelected) {
                      setPermissions((p) => ({
                        ...p,
                        [resKey]: [],
                      }));
                    } else {
                      setPermissions((p) => ({
                        ...p,
                        [resKey]: meta.actions.map((a) => a.value),
                      }));
                    }
                  }}
                  disabled={isSubmitting}
                  className="
                    text-[10px] font-bold text-primary-600
                    hover:text-primary-700 transition-colors
                    disabled:opacity-50
                  "
                >
                  {allSelected ? 'حذف همه' : 'انتخاب همه'}
                </button>
              </div>

              {/* Actions */}
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {meta.actions.map((action) => {
                  const isChecked = activePerms.includes(
                    action.value,
                  );
                  return (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() =>
                        togglePermission(resKey, action.value)
                      }
                      disabled={isSubmitting}
                      className={`
                        flex items-start gap-2 p-2.5 rounded-lg
                        border-2 transition-all cursor-pointer text-right
                        ${
                          isChecked
                            ? 'bg-primary-50 border-primary-300'
                            : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }
                        disabled:opacity-50
                      `}
                    >
                      <span
                        className={`
                          flex-shrink-0 w-4 h-4 rounded flex items-center justify-center
                          border-2 transition-colors mt-0.5
                          ${
                            isChecked
                              ? 'bg-primary-600 border-primary-600'
                              : 'bg-white border-gray-300'
                          }
                        `}
                      >
                        {isChecked && (
                          <Check
                            size={11}
                            strokeWidth={3.5}
                            className="text-white"
                          />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-800">
                          {action.label}
                        </div>
                        {action.hint && (
                          <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                            {action.hint}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
const RolePolicySettings = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState('dehyar');
  const [savingRole, setSavingRole] = useState(null);

  // ── Query ──
  const {
    data: policiesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: rolePolicyKeys.list(),
    queryFn: () => permissionApi.rolePolicy.list(),
    staleTime: 5 * 60 * 1000,
  });

  const policies = useMemo(
    () => policiesData?.items || [],
    [policiesData],
  );

  const selectedPolicy = useMemo(
    () => policies.find((p) => p.role === selectedRole),
    [policies, selectedRole],
  );

  // ── Update Mutation ──
  const updateMutation = useMutation({
    mutationFn: ({ role, data }) =>
      permissionApi.rolePolicy.update(role, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rolePolicyKeys.all,
      });
      // ✅ مجوزهای کاربر جاری هم تغییر می‌کند
      queryClient.invalidateQueries({
        queryKey: ['permissions', 'me'],
      });
      toast.success('مجوزهای نقش به‌روزرسانی شد', 'موفق');
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ذخیره';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا',
      );
    },
  });

  const handleSave = async (data) => {
    if (!selectedRole) return;

    const roleMeta = ROLE_META[selectedRole];
    const ok = await confirm({
      title: 'تغییر مجوزهای نقش',
      message: `آیا از تغییر مجوزهای نقش «${
        roleMeta?.label || selectedRole
      }» اطمینان دارید؟\nاین تغییر فوری روی تمام کاربران این نقش اثر می‌گذارد.`,
      confirmText: 'ذخیره',
      cancelText: 'انصراف',
      variant: 'primary',
    });
    if (!ok) return;

    setSavingRole(selectedRole);
    try {
      await updateMutation.mutateAsync({
        role: selectedRole,
        data,
      });
    } finally {
      setSavingRole(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          size={24}
          className="text-primary-600 animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Info Banner */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Info
          size={14}
          className="text-blue-600 flex-shrink-0 mt-0.5"
        />
        <div className="text-xs text-blue-800 leading-relaxed">
          <strong>مجوزهای نقش‌ها</strong> — این تنظیمات روی همهٔ
          کاربران آن نقش اعمال می‌شود. تغییرات فوری است و روی
          درخواست بعدی کاربران اثر می‌گذارد. نقش «مدیر ارشد» قابل
          ویرایش نیست.
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {Object.entries(ROLE_META).map(([roleKey, meta]) => {
          const Icon = meta.icon;
          const isActive = selectedRole === roleKey;
          const policy = policies.find((p) => p.role === roleKey);
          const notFound = !policy;

          return (
            <button
              key={roleKey}
              type="button"
              onClick={() => setSelectedRole(roleKey)}
              disabled={notFound}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg
                text-xs font-bold transition-all border-2
                ${
                  isActive
                    ? `${meta.color} scale-[1.02] shadow-sm`
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }
                ${notFound ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon size={13} strokeWidth={2.4} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Selected Role Editor */}
      {selectedPolicy ? (
        <RoleEditor
          key={selectedPolicy.role}
          policy={selectedPolicy}
          onSave={handleSave}
          isSubmitting={savingRole === selectedPolicy.role}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <AlertCircle
            size={24}
            className="text-gray-300 mx-auto mb-2"
          />
          <p className="text-xs text-gray-400">
            این نقش تعریف نشده است
          </p>
        </div>
      )}
    </div>
  );
};

export default RolePolicySettings;