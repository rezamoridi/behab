// src/features/settings/components/UsersManagement.jsx
import { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Users,
  Key,
  CheckSquare,
  Square,
  UserCog,
  Power,
  PowerOff,
  Eye,
  Phone,
  CreditCard,
  Layers,
  Wheat,
  Ruler,
  RefreshCw,
  Shield,
  Ban,
  Loader2,
  Filter,
} from 'lucide-react';

import {
  useUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeRoleMutation,
  useToggleActiveMutation,
  useUpdateRegionsMutation,
  useResetPasswordMutation,
  useBulkActiveMutation,
  useBulkRoleMutation,
  useUserDetailsQuery,
} from '../hooks/useUsersManagement';
import { useRegionsQuery } from '../../regions/hooks/useRegions';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════
const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'مدیر ارشد', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'manager', label: 'مدیر منطقه', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'dehyar', label: 'دهیار', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'operator', label: 'اپراتور', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

const getRoleInfo = (role) =>
  ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[2];

// ═══════════════════════════════════════════════════════
// Status Badge
// ═══════════════════════════════════════════════════════
const StatusBadge = ({ isActive }) => (
  <span
    className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-md
      text-[10px] font-bold border
      ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-gray-50 text-gray-500 border-gray-200'
      }
    `}
  >
    {isActive ? '● فعال' : '○ غیرفعال'}
  </span>
);

// ═══════════════════════════════════════════════════════
// Checkbox
// ═══════════════════════════════════════════════════════
const RowCheckbox = ({ checked, indeterminate, onChange }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
    className="
      w-5 h-5 rounded flex items-center justify-center flex-shrink-0
      border-2 transition-colors cursor-pointer
    "
    style={{
      backgroundColor: checked || indeterminate ? '#2e7d32' : '#ffffff',
      borderColor: checked || indeterminate ? '#2e7d32' : '#cbd5e1',
    }}
  >
    {checked && (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

// ═══════════════════════════════════════════════════════
// User Form Modal (Create/Edit)
// ═══════════════════════════════════════════════════════
const UserFormModal = ({ user, regions, onClose, onSubmit, isSubmitting }) => {
  const isEditing = !!user?.id;

  const [form, setForm] = useState({
    username: user?.username || '',
    fname: user?.fname || '',
    lname: user?.lname || '',
    phone_number: user?.phone_number || '',
    role: user?.role || 'dehyar',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = 'نام کاربری الزامی است';
    if (!form.fname.trim()) errs.fname = 'نام الزامی است';
    if (!form.lname.trim()) errs.lname = 'نام خانوادگی الزامی است';

    if (!isEditing) {
      if (!form.password || form.password.length < 6) {
        errs.password = 'رمز باید حداقل ۶ کاراکتر باشد';
      }
      if (form.password !== form.confirm_password) {
        errs.confirm_password = 'رمزها مطابقت ندارند';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const data = {
      username: form.username.trim(),
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      phone_number: form.phone_number.trim(),
      role: form.role,
    };

    if (!isEditing) {
      data.password = form.password;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <UserCog size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                {isEditing ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
              </h4>
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
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              نام کاربری <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              disabled={isSubmitting}
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm
                focus:ring-2 outline-none transition-all
                ${errors.username
                  ? 'border-red-500 focus:ring-red-100'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-100'}
              `}
              style={{ direction: 'ltr', textAlign: 'right' }}
              autoFocus
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Fname/Lname */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                نام <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fname}
                onChange={(e) => handleChange('fname', e.target.value)}
                disabled={isSubmitting}
                className={`
                  w-full px-3.5 py-2.5 rounded-lg border text-sm
                  ${errors.fname ? 'border-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}
                  outline-none transition-all
                `}
              />
              {errors.fname && (
                <p className="mt-1 text-xs text-red-600">{errors.fname}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.lname}
                onChange={(e) => handleChange('lname', e.target.value)}
                disabled={isSubmitting}
                className={`
                  w-full px-3.5 py-2.5 rounded-lg border text-sm
                  ${errors.lname ? 'border-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}
                  outline-none transition-all
                `}
              />
              {errors.lname && (
                <p className="mt-1 text-xs text-red-600">{errors.lname}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              شماره تماس
            </label>
            <input
              type="tel"
              value={form.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              disabled={isSubmitting}
              placeholder="09..."
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all
              "
              style={{ direction: 'ltr', textAlign: 'right' }}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              نقش کاربری
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((option) => {
                const isActive = form.role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('role', option.value)}
                    disabled={isSubmitting}
                    className={`
                      px-3 py-2.5 rounded-lg border-2 text-xs font-bold
                      transition-all cursor-pointer
                      ${isActive
                        ? `${option.color} scale-[1.02] shadow-sm`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password — فقط برای ایجاد */}
          {!isEditing && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  رمز عبور <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={isSubmitting}
                  placeholder="حداقل ۶ کاراکتر"
                  className={`
                    w-full px-3.5 py-2.5 rounded-lg border text-sm
                    ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}
                    outline-none transition-all
                  `}
                  style={{ direction: 'ltr' }}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  تکرار رمز عبور <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                  disabled={isSubmitting}
                  className={`
                    w-full px-3.5 py-2.5 rounded-lg border text-sm
                    ${errors.confirm_password ? 'border-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}
                    outline-none transition-all
                  `}
                  style={{ direction: 'ltr' }}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>
                )}
              </div>
            </>
          )}
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
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isEditing ? 'ذخیره' : 'افزودن'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Reset Password Modal
// ═══════════════════════════════════════════════════════
const ResetPasswordModal = ({ user, onClose, onSubmit, isSubmitting }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password.length < 6) {
      setError('رمز باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (password !== confirm) {
      setError('رمزها مطابقت ندارند');
      return;
    }
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">تنظیم رمز جدید</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                برای: {user?.username}
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

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              رمز جدید
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none
              "
              style={{ direction: 'ltr' }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              تکرار رمز
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError('');
              }}
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none
              "
              style={{ direction: 'ltr' }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1.5">
              {error}
            </p>
          )}
        </div>

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
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 disabled:opacity-50"
          >
            تنظیم رمز
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// User Details Drawer
// ═══════════════════════════════════════════════════════
const UserDetailsDrawer = ({ userId, onClose }) => {
  const { data, isLoading } = useUserDetailsQuery(userId, {
    enabled: !!userId,
  });

  if (!userId) return null;

  const roleInfo = data ? getRoleInfo(data.user.role) : null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Eye size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">جزئیات کاربر</h4>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-primary-600 animate-spin" />
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <UserCog size={11} /> نام کاربری
                  </span>
                  <span className="text-xs font-bold text-gray-800 font-mono" dir="ltr">
                    {data.user.username}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <CreditCard size={11} /> نام کامل
                  </span>
                  <span className="text-xs font-bold text-gray-800">
                    {`${data.user.fname || ''} ${data.user.lname || ''}`.trim() || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Phone size={11} /> تلفن
                  </span>
                  <span className="text-xs font-bold text-gray-800 font-mono" dir="ltr">
                    {data.user.phone_number || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Shield size={11} /> نقش
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold ${roleInfo?.color}`}>
                    {roleInfo?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Power size={11} /> وضعیت
                  </span>
                  <StatusBadge isActive={data.user.is_active} />
                </div>
                {data.user.last_login_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">آخرین ورود</span>
                    <span className="text-[11px] text-gray-700">
                      {new Date(data.user.last_login_at).toLocaleString('fa-IR')}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div>
                <div className="text-xs font-bold text-gray-800 mb-2">
                  آمار فعالیت
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-primary-50 rounded-lg p-2.5 text-center">
                    <Wheat size={12} className="text-primary-600 mx-auto mb-1" />
                    <div className="text-base font-bold text-primary-700">
                      {data.stats.farm_count.toLocaleString('fa-IR')}
                    </div>
                    <div className="text-[10px] text-primary-600">مزرعه</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                    <Ruler size={12} className="text-blue-600 mx-auto mb-1" />
                    <div className="text-base font-bold text-blue-700">
                      {data.stats.total_area_ha.toLocaleString('fa-IR', { maximumFractionDigits: 1 })}
                    </div>
                    <div className="text-[10px] text-blue-600">هکتار</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                    <Users size={12} className="text-emerald-600 mx-auto mb-1" />
                    <div className="text-base font-bold text-emerald-700">
                      {data.stats.farmer_count.toLocaleString('fa-IR')}
                    </div>
                    <div className="text-[10px] text-emerald-600">کشاورز</div>
                  </div>
                </div>
              </div>

              {/* Regions */}
              <div>
                <div className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <Layers size={12} />
                  مناطق ({data.regions.length.toLocaleString('fa-IR')})
                </div>
                {data.regions.length === 0 ? (
                  <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 text-center">
                    هیچ منطقه‌ای اختصاص داده نشده
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.regions.map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold"
                      >
                        {r.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-gray-400">
              اطلاعاتی یافت نشد
            </div>
          )}
        </div>

        <div className="flex justify-end px-5 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Region Assignment Modal
// ═══════════════════════════════════════════════════════
const RegionAssignModal = ({ user, regions, onClose, onSubmit, isSubmitting }) => {
  const [selectedIds, setSelectedIds] = useState(
    new Set(user?.region_ids || []),
  );

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">اختصاص مناطق</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                برای: {`${user?.fname || ''} ${user?.lname || ''}`.trim() || user?.username}
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

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {regions.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              هیچ منطقه‌ای تعریف نشده
            </div>
          ) : (
            regions.map((r) => {
              const isSelected = selectedIds.has(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggle(r.id)}
                  disabled={isSubmitting}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    border transition-colors text-right
                    ${isSelected
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'}
                    disabled:opacity-50
                  `}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? '#7c3aed' : '#fff',
                      borderColor: isSelected ? '#7c3aed' : '#cbd5e1',
                    }}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {r.name}
                    </div>
                    {r.description && (
                      <div className="text-[10px] text-gray-500 truncate">
                        {r.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

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
            onClick={() => onSubmit(Array.from(selectedIds))}
            disabled={isSubmitting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════
const UsersManagement = () => {
  const toast = useToast();
  const confirm = useConfirm();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formModal, setFormModal] = useState(null); // user | 'new' | null
  const [resetModal, setResetModal] = useState(null); // user
  const [regionsModal, setRegionsModal] = useState(null); // user
  const [detailsModal, setDetailsModal] = useState(null); // user_id

  const [selectedIds, setSelectedIds] = useState(new Set());

  // Queries
  const { data: users = [], isLoading, refetch, isFetching } = useUsersQuery();
  const { data: regions = [] } = useRegionsQuery({ activeOnly: true });

  // Mutations
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  const deleteMutation = useDeleteUserMutation();
  const resetMutation = useResetPasswordMutation();
  const regionsMutation = useUpdateRegionsMutation();
  const bulkActiveMutation = useBulkActiveMutation();
  const bulkRoleMutation = useBulkRoleMutation();

  // ─── Filtered ───
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const search = searchTerm.toLowerCase().trim();
      if (search) {
        const fullName = `${u.fname || ''} ${u.lname || ''}`.toLowerCase();
        const matches =
          (u.username || '').toLowerCase().includes(search) ||
          fullName.includes(search) ||
          (u.phone_number || '').includes(search);
        if (!matches) return false;
      }

      if (roleFilter && u.role !== roleFilter) return false;

      if (statusFilter === 'active' && !u.is_active) return false;
      if (statusFilter === 'inactive' && u.is_active) return false;

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // ─── Selection ───
  const allSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedIds.has(u.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ─── Handlers ───
  const handleSubmitForm = async (data) => {
    try {
      if (formModal === 'new') {
        await createMutation.mutateAsync(data);
        toast.success('کاربر جدید ساخته شد', 'موفق');
      } else {
        await updateMutation.mutateAsync({
          id: formModal.id,
          data,
        });
        toast.success('اطلاعات کاربر به‌روزرسانی شد', 'موفق');
      }
      setFormModal(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ذخیره';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    }
  };

  const handleDelete = useCallback(
    async (user) => {
      const fullName =
        `${user.fname || ''} ${user.lname || ''}`.trim() || user.username;
      const ok = await confirm({
        title: 'حذف کاربر',
        message: `آیا از حذف «${fullName}» اطمینان دارید؟`,
        confirmText: 'حذف کن',
        cancelText: 'انصراف',
        variant: 'danger',
      });
      if (!ok) return;

      try {
        await deleteMutation.mutateAsync(user.id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
        toast.success('کاربر حذف شد', 'موفق');
      } catch (err) {
        const msg =
          err?.response?.data?.detail || err?.message || 'خطا در حذف';
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
      }
    },
    [confirm, deleteMutation, toast],
  );

  const handleResetPassword = async (newPassword) => {
    if (!resetModal) return;
    try {
      await resetMutation.mutateAsync({
        id: resetModal.id,
        new_password: newPassword,
      });
      toast.success('رمز عبور تنظیم شد', 'موفق');
      setResetModal(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || 'خطا';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    }
  };

  const handleSaveRegions = async (region_ids) => {
    if (!regionsModal) return;
    try {
      await regionsMutation.mutateAsync({
        id: regionsModal.id,
        region_ids,
      });
      toast.success('مناطق به‌روزرسانی شد', 'موفق');
      setRegionsModal(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || 'خطا';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    }
  };

  // ─── Bulk handlers ───
  const handleBulkActive = async (is_active) => {
    if (selectedIds.size === 0) return;
    const action = is_active ? 'فعال' : 'غیرفعال';
    const ok = await confirm({
      title: `${action} گروهی`,
      message: `آیا ${selectedIds.size.toLocaleString('fa-IR')} کاربر انتخاب‌شده ${action} شوند؟`,
      confirmText: action + ' کن',
      cancelText: 'انصراف',
      variant: is_active ? 'primary' : 'danger',
    });
    if (!ok) return;

    try {
      const result = await bulkActiveMutation.mutateAsync({
        user_ids: Array.from(selectedIds),
        is_active,
      });
      toast.success(result.message, 'موفق');
      clearSelection();
    } catch (err) {
      toast.error('خطا در عملیات گروهی', 'خطا');
    }
  };

  const handleBulkRole = async (role) => {
    if (selectedIds.size === 0) return;
    const roleInfo = getRoleInfo(role);
    const ok = await confirm({
      title: 'تغییر نقش گروهی',
      message: `آیا نقش ${selectedIds.size.toLocaleString('fa-IR')} کاربر انتخاب‌شده به «${roleInfo.label}» تغییر یابد؟`,
      confirmText: 'تغییر بده',
      cancelText: 'انصراف',
      variant: 'primary',
    });
    if (!ok) return;

    try {
      const result = await bulkRoleMutation.mutateAsync({
        user_ids: Array.from(selectedIds),
        role,
      });
      toast.success(result.message, 'موفق');
      clearSelection();
    } catch (err) {
      toast.error('خطا در عملیات گروهی', 'خطا');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            مدیریت کاربران
          </h3>
          <span className="text-xs text-gray-400">
            ({filteredUsers.length.toLocaleString('fa-IR')} از{' '}
            {users.length.toLocaleString('fa-IR')})
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
              className="w-full md:w-56 pr-9 pl-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            title="بروزرسانی"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={() => setFormModal('new')}
            className="px-3.5 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-primary-700"
          >
            <Plus size={14} />
            کاربر جدید
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Filter size={12} />
          <span>فیلتر:</span>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white cursor-pointer focus:border-primary-500 outline-none"
        >
          <option value="">نقش: همه</option>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white cursor-pointer focus:border-primary-500 outline-none"
        >
          <option value="">وضعیت: همه</option>
          <option value="active">فعال</option>
          <option value="inactive">غیرفعال</option>
        </select>

        {(roleFilter || statusFilter || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setRoleFilter('');
              setStatusFilter('');
              setSearchTerm('');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
          >
            <X size={11} className="inline" /> پاک کردن
          </button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-l from-primary-500/15 via-white to-blue-500/10 border border-primary-300/50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <CheckSquare size={13} className="text-primary-700" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {selectedIds.size.toLocaleString('fa-IR')} کاربر انتخاب شده
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleBulkActive(true)}
              disabled={bulkActiveMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 disabled:opacity-50"
            >
              <Power size={12} />
              فعال
            </button>

            <button
              type="button"
              onClick={() => handleBulkActive(false)}
              disabled={bulkActiveMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold border border-red-200 disabled:opacity-50"
            >
              <PowerOff size={12} />
              غیرفعال
            </button>

            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkRole(e.target.value);
                    e.target.value = '';
                  }
                }}
                disabled={bulkRoleMutation.isPending}
                className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold cursor-pointer"
              >
                <option value="">تغییر نقش...</option>
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-white/60 text-[11px] font-medium"
            >
              <X size={12} />
              لغو
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="text-primary-600 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-10 px-3 py-3">
                  <RowCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="text-right px-3 py-3 font-semibold text-gray-600">#</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">نام کاربری</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">نام کامل</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">تلفن</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">نقش</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">وضعیت</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">مناطق</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => {
                  const fullName =
                    `${user.fname || ''} ${user.lname || ''}`.trim();
                  const roleInfo = getRoleInfo(user.role);
                  const isSelected = selectedIds.has(user.id);
                  const regionCount = (user.region_ids || []).length;

                  return (
                    <tr
                      key={user.id}
                      className={`
                        border-b border-gray-100 last:border-0
                        transition-colors
                        ${isSelected ? 'bg-primary-50/40' : 'hover:bg-gray-50'}
                      `}
                    >
                      <td className="w-10 px-3 py-3">
                        <RowCheckbox
                          checked={isSelected}
                          onChange={() => toggleSelect(user.id)}
                        />
                      </td>
                      <td className="px-3 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 font-mono text-xs" dir="ltr">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {fullName || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-mono" dir="ltr" style={{ textAlign: 'right' }}>
                        {user.phone_number || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge isActive={user.is_active} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {regionCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            <Layers size={9} />
                            {regionCount.toLocaleString('fa-IR')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => setDetailsModal(user.id)}
                            title="جزئیات"
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegionsModal(user)}
                            title="مناطق"
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Layers size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setResetModal(user)}
                            title="تنظیم رمز"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Key size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormModal(user)}
                            title="ویرایش"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
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
                  <td colSpan="9" className="text-center py-8 text-gray-400 text-sm">
                    {searchTerm || roleFilter || statusFilter
                      ? 'کاربری با این فیلترها یافت نشد'
                      : 'هیچ کاربری ثبت نشده'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex flex-wrap gap-3">
        <span>کل: {users.length.toLocaleString('fa-IR')}</span>
        <span className="text-emerald-600">
          | فعال: {users.filter((u) => u.is_active).length.toLocaleString('fa-IR')}
        </span>
        <span className="text-red-500">
          | غیرفعال: {users.filter((u) => !u.is_active).length.toLocaleString('fa-IR')}
        </span>
        <span className="text-purple-600">
          | دهیار: {users.filter((u) => u.role === 'dehyar').length.toLocaleString('fa-IR')}
        </span>
        <span className="text-violet-600">
          | مدیر منطقه: {users.filter((u) => u.role === 'manager').length.toLocaleString('fa-IR')}
        </span>
      </div>

      {/* Modals */}
      {formModal && (
        <UserFormModal
          user={formModal === 'new' ? null : formModal}
          regions={regions}
          onClose={() => setFormModal(null)}
          onSubmit={handleSubmitForm}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {resetModal && (
        <ResetPasswordModal
          user={resetModal}
          onClose={() => setResetModal(null)}
          onSubmit={handleResetPassword}
          isSubmitting={resetMutation.isPending}
        />
      )}

      {regionsModal && (
        <RegionAssignModal
          user={regionsModal}
          regions={regions}
          onClose={() => setRegionsModal(null)}
          onSubmit={handleSaveRegions}
          isSubmitting={regionsMutation.isPending}
        />
      )}

      {detailsModal && (
        <UserDetailsDrawer
          userId={detailsModal}
          onClose={() => setDetailsModal(null)}
        />
      )}
    </div>
  );
};

export default UsersManagement;