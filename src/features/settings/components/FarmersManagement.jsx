// src/features/settings/components/FarmersManagement.jsx
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
} from 'lucide-react';
import { farmerApi } from '../../../services/api/farmerApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

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
// Main Component
// ============================================================
const FarmersManagement = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [formData, setFormData] = useState({
    national_id: '',
    phone_number: '',
    fname: '',
    lname: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // ── Query: لیست کشاورزان ──
  const { data, isLoading } = useQuery({
    queryKey: farmerKeys.list({ page: 1, pageSize: 200, search: null }),
    queryFn: () => farmerApi.list({ page: 1, pageSize: 200 }),
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

  // ── Mutation: ویرایش ──
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => farmerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
    },
  });

  // ── Mutation: حذف ──
  const deleteMutation = useMutation({
    mutationFn: (id) => farmerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.all });
    },
  });

  // ── Mutation: ارسال مجدد دعوت ──
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
      toast.error(msg, 'خطا');
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

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary-600" />
          <h3 className="text-base font-semibold text-gray-900">
            لیست کشاورزان
          </h3>
          <span className="text-xs text-gray-400">
            ({filteredFarmers.length} از {farmers.length})
          </span>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی کشاورز (نام، کد ملی، تلفن)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 pr-9 pl-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-right px-4 py-3 font-semibold text-gray-600 rounded-r-lg">#</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">نام و نام خانوادگی</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">کد ملی</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">تلفن همراه</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">وضعیت</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 rounded-l-lg">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredFarmers.length > 0 ? (
              filteredFarmers.map((farmer, index) => {
                const fullName = `${farmer.fname || ''} ${farmer.lname || ''}`.trim();
                const isPending = !farmer.password_changed_at;

                return (
                  <tr
                    key={farmer.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {fullName || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700" dir="ltr">
                      {farmer.national_id}
                    </td>
                    <td className="px-4 py-3 text-gray-700" dir="ltr" style={{ textAlign: 'right' }}>
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
                <td colSpan="6" className="text-center py-8 text-gray-400 text-sm">
                  {searchTerm
                    ? 'کشاورزی با این مشخصات یافت نشد'
                    : 'هیچ کشاورزی ثبت نشده است'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 flex flex-wrap gap-4">
        <span>تعداد کل: {farmers.length}</span>
        {searchTerm && <span>| نتایج: {filteredFarmers.length}</span>}
        <span className="text-emerald-600">
          | فعال: {farmers.filter((f) => f.password_changed_at).length}
        </span>
        <span className="text-amber-600">
          | در انتظار: {farmers.filter((f) => !f.password_changed_at).length}
        </span>
      </div>

      {/* Edit Modal */}
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
                {/* کد ملی */}
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

                {/* تلفن (غیرقابل ویرایش) */}
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

                {/* نام و نام خانوادگی */}
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