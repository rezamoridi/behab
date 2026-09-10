// src/features/settings/components/UsersManagement.jsx
import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Search, Users } from 'lucide-react';
import { settingsApi } from '../../../services/api/settingsApi';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'مدیر سیستم', color: 'bg-red-50 text-red-700' },
  { value: 'manager', label: 'مدیر', color: 'bg-blue-50 text-blue-700' },
  {
    value: 'operator',
    label: 'اپراتور',
    color: 'bg-orange-50 text-orange-700',
  },
  { value: 'user', label: 'کاربر', color: 'bg-primary-50 text-primary-700' },
];

const UsersManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fname: '',
    lname: '',
    phone_number: '',
    role: 'user',
    password: '',
    confirm_password: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // ============================================
  // Query: Get Users
  // ============================================
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const res = await settingsApi.getUsers();
      return res.data?.items || res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ============================================
  // Mutations
  // ============================================
  const createMutation = useMutation({
    mutationFn: (data) => settingsApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => settingsApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });

  // ============================================
  // Filter
  // ============================================
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    const fullName = `${user.fname || ''} ${user.lname || ''}`.trim();
    return (
      (user.username || '').toLowerCase().includes(search) ||
      fullName.toLowerCase().includes(search) ||
      (user.phone_number || '').includes(search)
    );
  });

  // ============================================
  // Handlers
  // ============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username?.trim()) errors.username = 'نام کاربری الزامی است';
    if (!formData.fname?.trim()) errors.fname = 'نام الزامی است';
    if (!formData.lname?.trim()) errors.lname = 'نام خانوادگی الزامی است';

    if (!editingUser) {
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
      }
      if (formData.password !== formData.confirm_password) {
        errors.confirm_password = 'رمزهای عبور مطابقت ندارند';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = {
        username: formData.username,
        fname: formData.fname,
        lname: formData.lname,
        phone_number: formData.phone_number || '',
      };

      if (!editingUser) {
        data.password = formData.password;
        await createMutation.mutateAsync(data);
        alert('کاربر با موفقیت ایجاد شد.');
      } else {
        await updateMutation.mutateAsync({ id: editingUser.id, data });
        alert('اطلاعات کاربر با موفقیت به‌روزرسانی شد.');
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
          err?.message ||
          'خطا در ذخیره اطلاعات کاربر'
      );
    }
  };

  const handleEdit = (user) => {
    setEditingUser({
      id: user.id,
      username: user.username || '',
      fname: user.fname || '',
      lname: user.lname || '',
      phone_number: user.phone_number || '',
      role: user.role || 'user',
    });
    setFormData({
      username: user.username || '',
      fname: user.fname || '',
      lname: user.lname || '',
      phone_number: user.phone_number || '',
      role: user.role || 'user',
      password: '',
      confirm_password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    const fullName = `${user.fname || ''} ${user.lname || ''}`.trim();
    if (
      !window.confirm(
        `آیا از حذف کاربر "${fullName || user.username}" اطمینان دارید؟`
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(user.id);
      alert('کاربر با موفقیت حذف شد.');
    } catch (err) {
      alert(
        err?.response?.data?.detail || err?.message || 'خطا در حذف کاربر'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fname: '',
      lname: '',
      phone_number: '',
      role: 'user',
      password: '',
      confirm_password: '',
    });
    setEditingUser(null);
    setFormErrors({});
  };

  const getRoleInfo = (role) => {
    return (
      ROLE_OPTIONS.find((r) => r.value === role) ||
      ROLE_OPTIONS[ROLE_OPTIONS.length - 1]
    );
  };

  // ============================================
  // Render
  // ============================================
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
            لیست کاربران
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی کاربر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-56 pr-9 pl-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-700 transition-colors whitespace-nowrap"
          >
            <Plus size={14} />
            افزودن کاربر
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-right px-4 py-3 font-semibold text-gray-600 rounded-r-lg">
                #
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                نام کاربری
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                نام و نام خانوادگی
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                شماره تماس
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">
                نقش
              </th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 rounded-l-lg">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => {
                const fullName =
                  `${user.fname || ''} ${user.lname || ''}`.trim();
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr
                    key={user.username || index}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {user.username}
                    </td>
                    <td className="px-4 py-3">{fullName || '—'}</td>
                    <td
                      className="px-4 py-3 text-gray-600"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    >
                      {user.phone_number || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`
                          inline-block px-2.5 py-1 rounded-full text-[11px] font-medium
                          ${roleInfo.color}
                        `}
                      >
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="حذف"
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
                  colSpan="6"
                  className="text-center py-8 text-gray-400 text-sm"
                >
                  {searchTerm
                    ? 'کاربری با این مشخصات یافت نشد'
                    : 'هیچ کاربری ثبت نشده است'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="pt-3 border-t border-gray-100 text-xs text-gray-600">
        <span>تعداد کل کاربران: {users.length}</span>
        {searchTerm && (
          <span className="mr-3">| نتایج جستجو: {filteredUsers.length}</span>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h4 className="text-base font-semibold text-gray-900">
                {editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
              </h4>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    نام کاربری <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="نام کاربری"
                    className={`
                      w-full px-3.5 py-2.5 rounded-lg border text-sm
                      focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                      outline-none transition-all
                      ${
                        formErrors.username
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }
                    `}
                    style={{ direction: 'ltr' }}
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.username}
                    </p>
                  )}
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
                      placeholder="نام"
                      className={`
                        w-full px-3.5 py-2.5 rounded-lg border text-sm
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                        outline-none transition-all
                        ${
                          formErrors.fname
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }
                      `}
                    />
                    {formErrors.fname && (
                      <p className="mt-1 text-xs text-red-600">
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
                      placeholder="نام خانوادگی"
                      className={`
                        w-full px-3.5 py-2.5 rounded-lg border text-sm
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                        outline-none transition-all
                        ${
                          formErrors.lname
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }
                      `}
                    />
                    {formErrors.lname && (
                      <p className="mt-1 text-xs text-red-600">
                        {formErrors.lname}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="09..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    نقش کاربری
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        رمز عبور <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="حداقل ۶ کاراکتر"
                        className={`
                          w-full px-3.5 py-2.5 rounded-lg border text-sm
                          focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                          outline-none transition-all
                          ${
                            formErrors.password
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }
                        `}
                        style={{ direction: 'ltr' }}
                      />
                      {formErrors.password && (
                        <p className="mt-1 text-xs text-red-600">
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        تکرار رمز عبور <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        placeholder="تکرار رمز عبور"
                        className={`
                          w-full px-3.5 py-2.5 rounded-lg border text-sm
                          focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                          outline-none transition-all
                          ${
                            formErrors.confirm_password
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }
                        `}
                        style={{ direction: 'ltr' }}
                      />
                      {formErrors.confirm_password && (
                        <p className="mt-1 text-xs text-red-600">
                          {formErrors.confirm_password}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'در حال ذخیره...'
                    : editingUser
                      ? 'ویرایش'
                      : 'افزودن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;