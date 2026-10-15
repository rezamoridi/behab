// src/features/settings/components/VillageSettings.jsx
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Users,
  Info,
  FileDown,
  Loader2,
  Wheat,
  Layers,
  Activity,
  Map as MapIcon,
} from 'lucide-react';

import {
  useVillages,
  useAssignUsersToVillageMutation,
  villageKeys,
} from '../../villages/hooks/useVillages';
import { useRegionsQuery } from '../../regions/hooks/useRegions';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';
import { settingsApi } from '../../../services/api/settingsApi';
import { villageApi } from '../../../services/api/villageApi';
import VillageStatsPanel from './VillageStatsPanel';

// ═══════════════════════════════════════════════════════════
// Village Form Modal
// ═══════════════════════════════════════════════════════════
const VillageFormModal = ({
  village,
  regions,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const isEditing = !!village?.id;

  const [form, setForm] = useState({
    name: village?.name || '',
    description: village?.description || '',
    region_id: village?.region_id || '',
    is_active: village?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async () => {
    const trimmed = form.name.trim();
    if (!trimmed) {
      setErrors({ name: 'نام روستا الزامی است' });
      return;
    }
    if (trimmed.length < 2) {
      setErrors({ name: 'نام حداقل ۲ حرف باشد' });
      return;
    }

    await onSubmit({
      name: trimmed,
      description: form.description.trim() || null,
      region_id: form.region_id ? Number(form.region_id) : null,
      is_active: form.is_active,
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                {isEditing ? 'ویرایش روستا' : 'افزودن روستا'}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {isEditing
                  ? 'مشخصات روستا را ویرایش کنید'
                  : 'روستای جدید بسازید'}
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
              نام روستا <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="مثال: هوکی"
              disabled={isSubmitting}
              maxLength={150}
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
              منطقه (اختیاری)
            </label>
            <select
              value={form.region_id}
              onChange={(e) => handleChange('region_id', e.target.value)}
              disabled={isSubmitting}
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-200
                text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all cursor-pointer
              "
            >
              <option value="">— بدون منطقه —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
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
                روستا فعال باشد
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
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
              💡 پس از ساخت، می‌توانید:
              <br />• مرز روستا را روی نقشه رسم کنید (دکمهٔ «مرز»)
              <br />• مسئولان را اختصاص دهید (دکمهٔ «مسئولان»)
            </div>
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
            disabled={isSubmitting || !form.name.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
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
const AssignUsersModal = ({
  village,
  users,
  onClose,
  onSave,
  isSubmitting,
}) => {
  const [selectedIds, setSelectedIds] = useState(
    new Set(village.user_ids || []),
  );

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getRoleLabel = (role) => {
    if (role === 'super_admin') return 'مدیر ارشد';
    if (role === 'manager') return 'مدیر منطقه';
    if (role === 'dehyar') return 'دهیار';
    if (role === 'operator') return 'اپراتور';
    return role || 'کاربر';
  };

  const assignableUsers = useMemo(
    () => users.filter((u) => u.role !== 'super_admin'),
    [users],
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                مسئولان روستا
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{village.name}</p>
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

        <div className="px-4 py-2.5 bg-blue-50/60 border-b border-blue-100 text-[11px] text-blue-800 leading-relaxed">
          💡 دهیاران انتخاب‌شده به همهٔ مزارع و کشاورزان این روستا
          دسترسی خواهند داشت.
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {assignableUsers.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              <Users size={24} className="mx-auto mb-2 opacity-40" />
              <p>هنوز دهیار یا کاربری ثبت نشده</p>
            </div>
          ) : (
            assignableUsers.map((u) => {
              const isSelected = selectedIds.has(u.id);
              const fullName =
                `${u.fname || ''} ${u.lname || ''}`.trim() || u.username;

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggle(u.id)}
                  disabled={isSubmitting}
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
                      <span className="text-blue-600 font-semibold">
                        {getRoleLabel(u.role)}
                      </span>
                    </div>
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
            onClick={() => onSave(Array.from(selectedIds))}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
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
const VillageSettings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [statsModal, setStatsModal] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [assignLoadingId, setAssignLoadingId] = useState(null);

  const {
    villages,
    isLoading,
    createVillage,
    updateVillage,
    deleteVillage,
    isCreating,
    isUpdating,
    isDeleting,
  } = useVillages();

  const { data: regions = [] } = useRegionsQuery({
    activeOnly: true,
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const res = await settingsApi.getUsers();
      return res.data?.items || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const assignUsersMutation = useAssignUsersToVillageMutation();

  const filteredVillages = useMemo(() => {
    if (!searchTerm.trim()) return villages;
    const term = searchTerm.trim().toLowerCase();
    return villages.filter(
      (v) =>
        v.name.toLowerCase().includes(term) ||
        (v.description || '').toLowerCase().includes(term),
    );
  }, [villages, searchTerm]);

  // ─── Handlers ───
  const handleSubmit = async (formData) => {
    try {
      if (editModal === 'new') {
        await createVillage(formData);
        toast.success('روستای جدید ساخته شد', 'ذخیره شد');
      } else {
        await updateVillage(editModal.id, formData);
        toast.success('روستا به‌روزرسانی شد', 'ذخیره شد');
      }
      setEditModal(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || 'خطا در ذخیره';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا',
      );
    }
  };

  const handleDelete = async (village) => {
    const ok = await confirm({
      title: 'حذف روستا',
      message: `آیا از حذف روستای «${village.name}» اطمینان دارید؟\nمزارع و کشاورزان مرتبط حفظ می‌شوند ولی village_id آن‌ها NULL می‌شود.`,
      confirmText: 'حذف کن',
      cancelText: 'انصراف',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await deleteVillage(village.id);
      toast.success('روستا حذف شد', 'حذف شد');
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || 'خطا در حذف',
        'خطا',
      );
    }
  };

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await villageApi.exportExcel({});
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `villages-${new Date().toISOString().slice(0, 10)}.xlsx`;
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

  const handleOpenAssign = useCallback(
    async (village) => {
      setAssignLoadingId(village.id);
      try {
        const full = await villageApi.get(village.id);
        setAssignModal(full);
      } catch (err) {
        toast.error('خطا در دریافت اطلاعات روستا', 'خطا');
      } finally {
        setAssignLoadingId(null);
      }
    },
    [toast],
  );

  const handleSaveUsers = async (userIds) => {
    if (!assignModal) return;
    try {
      await assignUsersMutation.mutateAsync({
        villageId: assignModal.id,
        userIds,
      });
      toast.success('مسئولان روستا به‌روزرسانی شد', 'موفق');
      setAssignModal(null);
      queryClient.invalidateQueries({ queryKey: villageKeys.all });
    } catch (err) {
      toast.error('خطا در ذخیره', 'خطا');
    }
  };

  // ✅ فاز ۵: باز کردن ویرایش مرز روی نقشه
  const handleEditGeometry = useCallback(
    (village) => {
      navigate('/map', {
        state: { editVillageId: village.id },
      });
    },
    [navigate],
  );

  // ✅ فاز ۵: باز کردن آمار
  const handleOpenStats = useCallback((village) => {
    setStatsModal(village);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin size={16} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              روستاها
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              مدیریت روستاها، مرزها و مسئولان
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
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            روستا
          </button>
        </div>
      </div>

      {/* Empty */}
      {filteredVillages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
            <MapPin size={20} />
          </div>
          <p className="text-sm text-gray-500 mb-1">
            {searchTerm
              ? 'روستایی با این نام یافت نشد'
              : 'هنوز روستایی تعریف نشده'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={() => setEditModal('new')}
              className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              افزودن اولین روستا
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredVillages.map((village) => {
            const hasGeometry =
              village.geojson &&
              village.geojson.features &&
              village.geojson.features.length > 0;

            return (
              <div
                key={village.id}
                className={`
                  rounded-xl border p-4 transition-all
                  ${
                    village.is_active
                      ? 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'
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
                          village.is_active
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }
                      `}
                    >
                      {village.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {!village.is_active && (
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
                          غیرفعال
                        </span>
                      )}
                      {village.region_id && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                          <Layers size={8} strokeWidth={2.5} />
                          منطقه #{village.region_id}
                        </span>
                      )}
                      {hasGeometry ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <MapPin size={8} strokeWidth={2.5} />
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

                {village.description && (
                  <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">
                    {village.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Wheat size={12} className="text-primary-600" />
                    <span className="text-[11px] text-gray-600">
                      {(village.farm_count || 0).toLocaleString('fa-IR')}{' '}
                      مزرعه
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-blue-600" />
                    <span className="text-[11px] text-gray-600">
                      {(village.farmer_count || 0).toLocaleString('fa-IR')}{' '}
                      کشاورز
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-emerald-600" />
                    <span className="text-[11px] text-gray-600">
                      {(village.user_count || 0).toLocaleString('fa-IR')}{' '}
                      مسئول
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-wrap">
                  {/* ✅ فاز ۵: آمار */}
                  <button
                    type="button"
                    onClick={() => handleOpenStats(village)}
                    className="flex-1 min-w-[60px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
                    title="مشاهدهٔ آمار"
                  >
                    <Activity size={12} />
                    آمار
                  </button>

                  {/* ✅ فاز ۵: مرز */}
                  <button
                    type="button"
                    onClick={() => handleEditGeometry(village)}
                    className="flex-1 min-w-[60px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    title="ویرایش مرز روی نقشه"
                  >
                    <MapIcon size={12} />
                    مرز
                  </button>

                  {/* مسئولان */}
                  <button
                    type="button"
                    onClick={() => handleOpenAssign(village)}
                    disabled={assignLoadingId === village.id}
                    className="flex-1 min-w-[60px] flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {assignLoadingId === village.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Users size={12} />
                    )}
                    مسئولان
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditModal(village)}
                    className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors"
                    title="ویرایش"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(village)}
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

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 text-xs text-gray-600">
        <span>تعداد کل: {villages.length.toLocaleString('fa-IR')}</span>
        {searchTerm && (
          <span className="mr-3">
            | نتایج: {filteredVillages.length.toLocaleString('fa-IR')}
          </span>
        )}
      </div>

      {/* Modals */}
      {editModal && (
        <VillageFormModal
          village={editModal === 'new' ? null : editModal}
          regions={regions}
          onClose={() => setEditModal(null)}
          onSubmit={handleSubmit}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      {assignModal && (
        <AssignUsersModal
          village={assignModal}
          users={usersData}
          onClose={() => setAssignModal(null)}
          onSave={handleSaveUsers}
          isSubmitting={assignUsersMutation.isPending}
        />
      )}

      {/* ✅ فاز ۵: VillageStatsPanel */}
      {statsModal && (
        <VillageStatsPanel
          village={statsModal}
          onClose={() => setStatsModal(null)}
        />
      )}
    </div>
  );
};

export default VillageSettings;