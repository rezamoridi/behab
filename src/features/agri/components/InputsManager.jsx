// src/features/agri/components/InputsManager.jsx
import { useState } from 'react';
import {
  Plus,
  Search,
  FlaskConical,
  Info,
  Power,
  PowerOff,
  CircleSlash,
  Pencil,
  Trash2,
  AlertCircle,
  Palette,
  Bug,
  Sprout,
} from 'lucide-react';

import Modal from '../../../shared/components/Modal/Modal';   // ✅ جدید
import {
  INPUT_CATEGORIES,
  INPUT_UNITS,
  INPUT_COLOR_PALETTE,
  INPUT_STATUS_CONFIG,
  INPUT_ACTION_CONFIG,
  INPUTS_GRID_CLASS,
  getCategoryInfo,
  getUnitLabel,
} from '../constants/inputConfig';
import { useInputs } from '../hooks/useInputs';

// ═══════════════════════════════════════════════════════════
// CategoryBadge
// ═══════════════════════════════════════════════════════════
const CategoryBadge = ({ category }) => {
  const info = getCategoryInfo(category);
  const Icon = info.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${info.color}`}
    >
      <Icon size={10} strokeWidth={2.6} />
      {info.label}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// ColorPicker
// ═══════════════════════════════════════════════════════════
const ColorPicker = ({ value, onChange, disabled = false }) => (
  <div className="flex flex-wrap gap-1.5">
    {INPUT_COLOR_PALETTE.map((c) => {
      const isActive = value?.toUpperCase() === c.toUpperCase();
      return (
        <button
          key={c}
          type="button"
          onClick={() => !disabled && onChange(c)}
          disabled={disabled}
          className={`
            w-7 h-7 rounded-full border-2 transition-all
            ${isActive ? 'border-gray-800 scale-110 shadow-md' : 'border-white shadow'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
          `}
          style={{ backgroundColor: c }}
          aria-label={`انتخاب رنگ ${c}`}
          aria-pressed={isActive}
        />
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════
// InputRow
// ═══════════════════════════════════════════════════════════
const InputRow = ({ item, onEdit, onToggle, onDelete }) => (
  <div
    className={`
      ${INPUTS_GRID_CLASS}
      px-4 py-3 border-b border-gray-100 last:border-0
      transition-colors
      ${!item.is_active ? 'bg-gray-50/60' : 'hover:bg-gray-50'}
    `}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
        style={{
          backgroundColor: `${item.color}20`,
          borderColor: `${item.color}60`,
        }}
      >
        <span
          className="w-3.5 h-3.5 rounded-full shadow-inner"
          style={{ backgroundColor: item.color }}
        />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className={`text-sm font-semibold truncate ${
            item.is_active ? 'text-gray-900' : 'text-gray-400 line-through'
          }`}
          title={item.name}
        >
          {item.name}
        </span>
        {item.description && (
          <span className="text-[10px] text-gray-400 truncate">
            {item.description}
          </span>
        )}
      </div>
    </div>

    <CategoryBadge category={item.category} />

    <span className="text-xs font-medium text-gray-700 text-center">
      {getUnitLabel(item.unit)}
    </span>

    <div className="flex items-center justify-center gap-1">
      <span
        className="text-xs font-semibold text-violet-700 tabular-nums"
        style={{ direction: 'ltr' }}
      >
        {Number(item.price).toLocaleString('fa-IR')}
      </span>
      <span className="text-[10px] text-gray-400">تومان</span>
    </div>

    <div className="flex items-center justify-center">
      {item.is_active ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          فعال
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-bold">
          <CircleSlash size={9} />
          غیرفعال
        </span>
      )}
    </div>

    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(item)}
        className={`p-2 rounded-lg transition-colors ${INPUT_ACTION_CONFIG.edit.color}`}
        title={INPUT_ACTION_CONFIG.edit.title}
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        onClick={() => onToggle(item)}
        className={`
          p-2 rounded-lg transition-colors
          ${item.is_active
            ? 'text-green-600 hover:bg-green-50'
            : 'text-gray-400 hover:bg-gray-100'}
        `}
        title={item.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
      >
        {item.is_active ? <Power size={14} /> : <PowerOff size={14} />}
      </button>
      <button
        type="button"
        onClick={() => onDelete(item)}
        className={`p-2 rounded-lg transition-colors ${INPUT_ACTION_CONFIG.delete.color}`}
        title={INPUT_ACTION_CONFIG.delete.title}
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// InputFormModal — با Modal مشترک
// ═══════════════════════════════════════════════════════════
const InputFormModal = ({ item, onClose, onSubmit, isEdit }) => {
  const [form, setForm] = useState(() => ({
    name: item?.name || '',
    category: item?.category || 'fertilizer',
    unit: item?.unit || 'kg',
    price: item?.price ?? 0,
    description: item?.description || '',
    color: item?.color || '#4CAF50',
  }));

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    if (!name) {
      setError('نام نهاده الزامی است');
      return;
    }
    if (name.length < 2) {
      setError('نام نهاده باید حداقل ۲ حرف باشد');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        category: form.category,
        unit: form.unit,
        price: Number(form.price) || 0,
        description: form.description.trim() || null,
        color: form.color,
        ...(isEdit ? {} : { is_active: true }),
      });
    } catch (e) {
      setError(e?.message || 'خطا در ذخیره');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'ویرایش نهاده' : 'افزودن نهاده جدید'}
      subtitle={
        isEdit
          ? 'اطلاعات نهاده را ویرایش کنید'
          : 'نهادهٔ جدید برای استفاده در مزارع'
      }
      icon={Palette}
      headerBg="bg-emerald-50/60"
      headerColor="text-emerald-700"
      maxWidth="max-w-lg"
      footer={
        <>
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
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isEdit ? 'ذخیره تغییرات' : 'افزودن'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            نام نهاده <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="مثال: اوره"
            disabled={isSubmitting}
            className="
              w-full px-3.5 py-2.5 rounded-lg border border-gray-200
              text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
              outline-none transition-all
            "
            autoFocus
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            دسته
          </label>
          <div className="grid grid-cols-3 gap-2">
            {INPUT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = form.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleChange('category', cat.value)}
                  disabled={isSubmitting}
                  className={`
                    flex items-center justify-center gap-1.5
                    px-2 py-2.5 rounded-lg border-2
                    text-xs font-bold transition-all
                    ${
                      isActive
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon size={13} strokeWidth={2.4} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unit + Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              واحد
            </label>
            <select
              value={form.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              disabled={isSubmitting}
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-200
                text-sm bg-white cursor-pointer
                focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all
              "
            >
              {INPUT_UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              قیمت هر واحد (تومان)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              disabled={isSubmitting}
              className="
                w-full px-3.5 py-2.5 rounded-lg border border-gray-200
                text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all
              "
              style={{ direction: 'ltr' }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            توضیحات (اختیاری)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={isSubmitting}
            rows={3}
            maxLength={1000}
            placeholder="ترکیبات، کاربرد، نکات..."
            className="
              w-full px-3.5 py-2.5 rounded-lg border border-gray-200
              text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
              outline-none transition-all resize-none
            "
          />
        </div>

        {/* Color */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
            <Palette size={12} strokeWidth={2.4} />
            رنگ نمایش
          </label>
          <ColorPicker
            value={form.color}
            onChange={(c) => handleChange('color', c)}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// Stats Bar
// ═══════════════════════════════════════════════════════════
const StatsBar = ({ stats }) => {
  const cards = [
    {
      key: 'total',
      label: 'کل',
      value: stats.total,
      icon: FlaskConical,
      color: 'text-gray-700 bg-gray-100',
    },
    {
      key: 'fertilizers',
      label: 'کود',
      value: stats.fertilizers,
      icon: FlaskConical,
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      key: 'pesticides',
      label: 'سم',
      value: stats.pesticides,
      icon: Bug,
      color: 'text-amber-700 bg-amber-50',
    },
    {
      key: 'seeds',
      label: 'بذر',
      value: stats.seeds,
      icon: Sprout,
      color: 'text-sky-700 bg-sky-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-gray-100"
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-lg ${c.color}`}
            >
              <Icon size={15} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] text-gray-500">{c.label}</div>
              <div className="text-base font-bold text-gray-800 leading-none mt-0.5">
                {c.value.toLocaleString('fa-IR')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════
const InputsManager = () => {
  const {
    filteredInputs,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    editModalInput,
    setEditModalInput,
    addModalOpen,
    setAddModalOpen,
    handleAddInput,
    handleToggleActive,
    handleDeleteInput,
    handleSubmitEdit,
  } = useInputs();

  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FlaskConical size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                نهاده‌ها
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                مدیریت کود، سم و بذر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="
                px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white
                focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                outline-none transition-all cursor-pointer
              "
            >
              <option value="">دسته: همه</option>
              {INPUT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <div className="relative">
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
                  w-full md:w-52 pr-8 pl-3 py-2 rounded-lg
                  border border-gray-200 text-sm
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                  outline-none transition-all
                "
              />
            </div>

            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="
                px-3.5 py-2 bg-primary-600 text-white rounded-lg
                text-xs font-semibold flex items-center gap-1.5
                hover:bg-primary-700 transition-colors whitespace-nowrap
              "
            >
              <Plus size={14} />
              نهاده
            </button>
          </div>
        </div>

        {/* Scroll horizontal برای موبایل */}
        <div className="overflow-x-auto">
          {/* Header row */}
          <div
            className={`
              ${INPUTS_GRID_CLASS}
              px-4 py-2.5 bg-gray-50/70 border-b border-gray-100
              text-[10px] font-semibold text-gray-500 uppercase tracking-wide
              min-w-[700px]
            `}
          >
            <div>نام نهاده</div>
            <div className="text-center">دسته</div>
            <div className="text-center">واحد</div>
            <div className="text-center">قیمت</div>
            <div className="text-center">وضعیت</div>
            <div className="text-center">عملیات</div>
          </div>

          {/* Body rows */}
          {filteredInputs.length > 0 ? (
            <div className="min-w-[700px]">
              {filteredInputs.map((item) => (
                <InputRow
                  key={item.id}
                  item={item}
                  onEdit={setEditModalInput}
                  onToggle={handleToggleActive}
                  onDelete={handleDeleteInput}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                <FlaskConical size={20} strokeWidth={2} />
              </div>
              <p className="text-sm text-gray-500">
                {searchTerm || categoryFilter
                  ? 'نهاده‌ای با این فیلترها یافت نشد'
                  : 'هنوز نهاده‌ای تعریف نشده'}
              </p>
              {!searchTerm && !categoryFilter && (
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  افزودن اولین نهاده
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <InputFormModal
          item={null}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddInput}
          isEdit={false}
        />
      )}

      {/* Edit Modal */}
      {editModalInput && (
        <InputFormModal
          item={editModalInput}
          onClose={() => setEditModalInput(null)}
          onSubmit={handleSubmitEdit}
          isEdit={true}
        />
      )}
    </div>
  );
};

export default InputsManager;