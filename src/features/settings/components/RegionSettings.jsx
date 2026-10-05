// src/features/settings/components/RegionSettings.jsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Map,
  AlertCircle,
  CheckCircle2,
  Users,
  Layers,
  Info,
  FileDown,
  Loader2,
  BarChart3,
  Activity,
} from 'lucide-react';

import {
  useRegions,
  useAssignRegionsToUserMutation,
} from '../../regions/hooks/useRegions';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../../../services/api/settingsApi';
import { regionApi } from '../../../services/api/regionApi';
import RegionStatsPanel from './RegionStatsPanel';
import RegionComparisonChart from './RegionComparisonChart';

// ═══════════════════════════════════════════════════════════
// Region Form Modal
// ═══════════════════════════════════════════════════════════
const RegionFormModal = ({ region, onClose, onSubmit, isSubmitting }) => {
  const isEditing = !!region?.id;

  const [form, setForm] = useState({
    name: region?.name || '',
    description: region?.description || '',
    is_active: region?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async () => {
    const trimmed = form.name.trim();
    if (!trimmed) {
      setErrors({ name: 'نام منطقه الزامی است' });
      return;
    }
    if (trimmed.length < 2) {
      setErrors({ name: 'نام حداقل ۲ حرف باشد' });
      return;
    }

    await onSubmit({
      name: trimmed,
      description: form.description.trim() || null,
      is_active: form.is_active,
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                {isEditing ? 'ویرایش منطقه' : 'افزودن منطقه'}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isEditing ? 'مشخصات منطقه را ویرایش کنید' : 'منطقه جدید بسازید'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              نام منطقه <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="مثال: منطقه شمال"
              disabled={isSubmitting}
              maxLength={100}
              className={`
                w-full px-3.5 py-2.5 rounded-lg border text-sm
                focus:ring-2 outline-none transition-all
                ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                }
              `}
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              توضیحات
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="توضیحات اختیاری..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
            />
          </div>

          <label className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer">
            <div className="flex items-center gap-2">
              <Info size={13} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-700">
                منطقه فعال باشد
              </span>
            </div>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
            />
          </label>

          {!isEditing && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-[11px] text-purple-800 leading-relaxed">
              💡 پس از ساخت، با کلیک روی دکمه <strong>«مرز»</strong> کنار
              کارت منطقه، می‌توانید محدوده‌ی آن را روی نقشه رسم کنید.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.name.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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

// ═══════════════════════════════════════════════════════════
// Assign Users Modal
// ═══════════════════════════════════════════════════════════
const AssignUsersModal = ({ region, users, onClose }) => {
  const toast = useToast();
  const assignMutation = useAssignRegionsToUserMutation();

  const [selectedIds, setSelectedIds] = useState(
    new Set(region.user_ids || []),
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleUser = (userId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allPromises = users
        .map((u) => {
          const currentUserRegionIds = u.region_ids || [];
          const hasThisRegion = selectedIds.has(u.id);
          const wasAssigned = currentUserRegionIds.includes(region.id);

          if (hasThisRegion === wasAssigned) return null;

          const newRegionIds = hasThisRegion
            ? [...currentUserRegionIds, region.id]
            : currentUserRegionIds.filter((id) => id !== region.id);

          return assignMutation.mutateAsync({
            userId: u.id,
            regionIds: newRegionIds,
          });
        })
        .filter(Boolean);

      await Promise.all(allPromises);
      toast.success('مسئولان منطقه به‌روزرسانی شد', 'ذخیره شد');
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || 'خطا در ذخیره',
        'خطا',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ نمایش برچسب نقش
  const getRoleLabel = (role) => {
    if (role === 'super_admin') return 'مدیر ارشد';
    if (role === 'manager') return 'مدیر منطقه';
    if (role === 'dehyar') return 'دهیار';
    return role || 'کاربر';
  };

  // ✅ رنگ برچسب نقش
  const getRoleColor = (role) => {
    if (role === 'super_admin') return 'text-red-600';
    if (role === 'manager') return 'text-purple-600';
    if (role === 'dehyar') return 'text-blue-600';
    return 'text-gray-500';
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                مسئولان و مدیران منطقه
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {region.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info */}
        <div className="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100 text-[11px] text-blue-800 leading-relaxed">
          💡 مدیران منطقه و دهیاران انتخاب‌شده، به همه‌ی مزارع و کشاورزان
          این منطقه دسترسی خواهند داشت.
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {users.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              <Users size={24} className="mx-auto mb-2 opacity-40" />
              <p>هنوز دهیار یا مدیر منطقه‌ای ثبت نشده</p>
              <p className="mt-1 text-[10px] text-gray-400">
                ابتدا از تب «کاربران» یک کاربر بسازید
              </p>
            </div>
          ) : (
            users.map((u) => {
              const isSelected = selectedIds.has(u.id);
              const fullName =
                `${u.fname || ''} ${u.lname || ''}`.trim() || u.username;

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUser(u.id)}
                  disabled={isSaving}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    border transition-colors text-right
                    ${
                      isSelected
                        ? 'bg-primary-50 border-primary-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                    disabled:opacity-50
                  `}
                >
                  <span
                    className={`
                      w-5 h-5 rounded flex items-center justify-center
                      border-2 transition-colors flex-shrink-0
                      ${
                        isSelected
                          ? 'bg-primary-600 border-primary-600'
                          : 'bg-white border-gray-300'
                      }
                    `}
                  >
                    {isSelected && (
                      <CheckCircle2 size={12} className="text-white" />
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {fullName}
                    </div>
                    <div className="text-[10px] truncate flex items-center gap-1">
                      <span className="text-gray-500">{u.username}</span>
                      <span className="text-gray-300">•</span>
                      <span className={`font-semibold ${getRoleColor(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
const RegionSettings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const {
    regions,
    isLoading,
    createRegion,
    updateRegion,
    deleteRegion,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRegions();

  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [assignLoadingId, setAssignLoadingId] = useState(null);

  // ✅ Modal states
  const [statsModalRegion, setStatsModalRegion] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // ✅ لیست کاربران
  const { data: usersData = [] } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const res = await settingsApi.getUsers();
      return res.data?.items || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ✅ کاربران قابل اختصاص: dehyar + manager
  const assignableUsers = useMemo(
    () =>
      usersData.filter(
        (u) => u.role === 'dehyar' || u.role === 'manager',
      ),
    [usersData],
  );

  // ✅ فیلتر جستجو
  const filteredRegions = useMemo(() => {
    if (!searchTerm.trim()) return regions;
    const term = searchTerm.trim().toLowerCase();
    return regions.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        (r.description || '').toLowerCase().includes(term),
    );
  }, [regions, searchTerm]);

  // ─── Handlers ───
  const handleSubmit = async (formData) => {
    try {
      if (editModal === 'new') {
        await createRegion(formData);
        toast.success('منطقه جدید ساخته شد', 'ذخیره شد');
      } else {
        await updateRegion(editModal.id, formData);
        toast.success('منطقه به‌روزرسانی شد', 'ذخیره شد');
      }
      setEditModal(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || 'خطا در ذخیره';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    }
  };

  const handleDelete = async (region) => {
    const ok = await confirm({
      title: 'حذف منطقه',
      message: `آیا از حذف منطقه «${region.name}» اطمینان دارید؟\nمزارع و کشاورزان مرتبط حفظ می‌شوند ولی region_id آن‌ها NULL می‌شود.`,
      confirmText: 'حذف کن',
      cancelText: 'انصراف',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await deleteRegion(region.id);
      toast.success('منطقه حذف شد', 'حذف شد');
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || 'خطا در حذف',
        'خطا',
      );
    }
  };

  // ✅ خروجی Excel
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await regionApi.exportExcel({});
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `regions-${new Date().toISOString().slice(0, 10)}.xlsx`;
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
  }, [toast]);

  // ✅ باز کردن modal مسئولان با کاربران کامل
  const handleOpenAssign = useCallback(
    async (region) => {
      setAssignLoadingId(region.id);
      try {
        const fullRegion = await regionApi.get(region.id);
        setAssignModal(fullRegion);
      } catch (err) {
        toast.error('خطا در دریافت اطلاعات منطقه', 'خطا');
      } finally {
        setAssignLoadingId(null);
      }
    },
    [toast],
  );

  // ✅ رفتن به ویرایش مرز
  const handleEditGeometry = useCallback(
    (region) => {
      navigate('/map', { state: { editRegionId: region.id } });
    },
    [navigate],
  );

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const canCompare = regions.filter((r) => r.is_active).length > 1;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Layers size={16} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">مناطق</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              مدیریت مناطق و مسئولان هر منطقه
            </p>
          </div>
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
              className="w-full md:w-52 pr-9 pl-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
          </div>

          {/* ✅ دکمه مقایسه */}
          {canCompare && (
            <button
              type="button"
              onClick={() => setCompareModalOpen(true)}
              className="
                flex items-center gap-1.5 px-3 py-2 rounded-lg
                text-xs font-semibold text-violet-700
                bg-violet-50 hover:bg-violet-100
                border border-violet-200
                transition-colors cursor-pointer whitespace-nowrap
              "
              title="مقایسه مناطق"
            >
              <BarChart3 size={13} />
              <span>مقایسه</span>
            </button>
          )}

          {/* ✅ خروجی Excel */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="
              flex items-center gap-1.5 px-3 py-2 rounded-lg
              text-xs font-semibold text-emerald-700
              bg-emerald-50 hover:bg-emerald-100
              border border-emerald-200
              transition-colors cursor-pointer whitespace-nowrap
              disabled:opacity-50 disabled:cursor-wait
            "
            title="خروجی Excel"
          >
            {isExporting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <FileDown size={13} />
            )}
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setEditModal('new')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-primary-700 transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            منطقه
          </button>
        </div>
      </div>

      {/* Empty */}
      {filteredRegions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <Map size={20} />
          </div>
          <p className="text-sm text-gray-500 mb-1">
            {searchTerm
              ? 'منطقه‌ای با این نام یافت نشد'
              : 'هنوز منطقه‌ای تعریف نشده'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={() => setEditModal('new')}
              className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              افزودن اولین منطقه
            </button>
          )}
        </div>
      ) : (
        /* List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRegions.map((region) => {
            const hasGeometry =
              region.geojson &&
              region.geojson.features &&
              region.geojson.features.length > 0;

            return (
              <div
                key={region.id}
                className={`
                  rounded-xl border p-4 transition-all
                  ${
                    region.is_active
                      ? 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
                      : 'bg-gray-50/60 border-gray-200 opacity-70'
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <h4
                      className={`
                        text-sm font-bold truncate
                        ${
                          region.is_active
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }
                      `}
                    >
                      {region.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {!region.is_active && (
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
                          غیرفعال
                        </span>
                      )}
                      {hasGeometry ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                          <Map size={8} strokeWidth={2.5} />
                          مرز دارد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                          <AlertCircle size={8} strokeWidth={2.5} />
                          بدون مرز
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {region.description && (
                  <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">
                    {region.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 mb-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-blue-600" />
                    <span className="text-[11px] text-gray-600">
                      {(region.user_count || 0).toLocaleString('fa-IR')}{' '}
                      مسئول
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-wrap">
                  {/* آمار */}
                  <button
                    type="button"
                    onClick={() => setStatsModalRegion(region)}
                    className="flex-1 min-w-[60px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
                    title="مشاهده آمار"
                  >
                    <Activity size={12} />
                    آمار
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditGeometry(region)}
                    className="flex-1 min-w-[60px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
                    title="ویرایش مرز روی نقشه"
                  >
                    <Map size={12} />
                    مرز
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAssign(region)}
                    disabled={assignLoadingId === region.id}
                    className="flex-1 min-w-[60px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    title="اختصاص مسئول"
                  >
                    {assignLoadingId === region.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Users size={12} />
                    )}
                    مسئولان
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditModal(region)}
                    className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors"
                    title="ویرایش"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(region)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats footer */}
      <div className="pt-3 border-t border-gray-100 text-xs text-gray-600">
        <span>تعداد کل: {regions.length.toLocaleString('fa-IR')}</span>
        {searchTerm && (
          <span className="mr-3">
            | نتایج: {filteredRegions.length.toLocaleString('fa-IR')}
          </span>
        )}
      </div>

      {/* Modals */}
      {editModal && (
        <RegionFormModal
          region={editModal === 'new' ? null : editModal}
          onClose={() => setEditModal(null)}
          onSubmit={handleSubmit}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      {assignModal && (
        <AssignUsersModal
          region={assignModal}
          users={assignableUsers}
          onClose={() => setAssignModal(null)}
        />
      )}

      {/* Modal آمار */}
      {statsModalRegion && (
        <RegionStatsPanel
          region={statsModalRegion}
          onClose={() => setStatsModalRegion(null)}
        />
      )}

      {/* Modal مقایسه */}
      {compareModalOpen && (
        <RegionComparisonChart
          onClose={() => setCompareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RegionSettings;