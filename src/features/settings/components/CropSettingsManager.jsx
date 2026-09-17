// src/features/settings/components/CropSettingsManager.jsx
import React, { useState } from "react";
import {
  Plus,
  X,
  Search,
  Sprout,
  Info,
  Power,
  PowerOff,
  CircleCheck,
  CircleSlash,
  Pencil,
  Leaf,
  Trash2,
} from "lucide-react";

import {
  METRICS,
  GRID_CLASS,
  STATUS_CONFIG,
  ACTION_CONFIG,
  STATS_CONFIG,
  CropSettingsManagerSkeleton,
} from "../constants/cropSettingsConfig";
import { useCropSettings } from "../hooks/useCropSettings";

// ============================================================
// Metric Cell
// ============================================================
const MetricCell = ({ config, value }) => {
  const Icon = config.icon;
  const hasValue = value !== null && value !== undefined && value > 0;

  if (!hasValue) {
    return (
      <div className="flex items-center justify-center gap-1.5 opacity-50">
        <Icon size={12} className="text-gray-300" strokeWidth={2.2} />
        <span className="text-xs text-gray-300">—</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Icon
        size={12}
        className={config.color.split(" ")[0]}
        strokeWidth={2.4}
      />
      <span
        className="text-xs font-semibold text-gray-700 tabular-nums"
        style={{ direction: "ltr" }}
      >
        {Number(value).toLocaleString("fa-IR")}
      </span>
    </div>
  );
};

// ============================================================
// Status Pill
// ============================================================
const StatusPill = ({ isActive, hasRate }) => {
  let key = "active";
  if (!isActive) key = "inactive";
  else if (!hasRate) key = "missingRate";

  const cfg = STATUS_CONFIG[key];
  const Icon = cfg.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded
        text-[10px] font-medium ${cfg.className}
      `}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  );
};

// ============================================================
// Crop Row
// ============================================================
const CropRow = ({
  crop,
  onEditRate,
  onToggleActive,
  onDeleteCrop,
  onRename,
}) => {
  const hasRate = crop.rate !== null && crop.rate !== undefined;

  return (
    <div
      className={`
        ${GRID_CLASS}
        px-4 py-3 border-b border-gray-100 last:border-0
        transition-colors
        ${!crop.isActive ? "bg-gray-50/60" : "hover:bg-gray-50"}
      `}
    >
      {/* Name + Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${
              crop.isActive
                ? "bg-primary-50 text-primary-600"
                : "bg-gray-100 text-gray-400"
            }
          `}
        >
          <Sprout size={14} strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className={`
              text-sm font-semibold truncate
              ${crop.isActive ? "text-gray-900" : "text-gray-400 line-through"}
            `}
          >
            {crop.name}
          </span>
          <StatusPill isActive={crop.isActive} hasRate={hasRate} />
        </div>
      </div>

      {/* Metrics */}
      {METRICS.map((m) => (
        <MetricCell key={m.key} config={m} value={crop.rate?.[m.key]} />
      ))}

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onEditRate(crop)}
          className={`p-2 rounded-lg transition-colors ${ACTION_CONFIG.edit.color}`}
          title={hasRate ? "ویرایش نرخ‌ها" : "تنظیم نرخ‌ها"}
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          onClick={() => onRename(crop)}
          className={`p-2 rounded-lg transition-colors ${ACTION_CONFIG.rename.color}`}
          title={ACTION_CONFIG.rename.title}
        >
          <Leaf size={14} />
        </button>

        <button
          type="button"
          onClick={() => onToggleActive(crop)}
          className={`
            p-2 rounded-lg transition-colors
            ${
              crop.isActive
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-400 hover:bg-gray-100"
            }
          `}
          title={crop.isActive ? "غیرفعال کردن" : "فعال کردن"}
        >
          {crop.isActive ? <Power size={14} /> : <PowerOff size={14} />}
        </button>

        <button
          type="button"
          onClick={() => onDeleteCrop(crop)}
          className={`p-2 rounded-lg transition-colors ${ACTION_CONFIG.delete.color}`}
          title={ACTION_CONFIG.delete.title}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Rate Modal
// ============================================================
const RateModal = ({ crop, onClose, onSubmit }) => {
  const [form, setForm] = useState(() => {
    const initial = {};
    METRICS.forEach((m) => {
      const v = crop.rate?.[m.key];
      initial[m.key] = v != null ? String(v) : "";
    });
    return initial;
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const payload = {};
    let hasAny = false;

    METRICS.forEach((m) => {
      const v = parseFloat(form[m.key]);
      if (Number.isFinite(v) && v >= 0) {
        payload[m.key] = v;
        if (v > 0) hasAny = true;
      } else {
        payload[m.key] = 0;
      }
    });

    if (!hasAny) {
      alert("حداقل یک مقدار معتبر وارد کنید");
      return;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Sprout size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                تنظیم نرخ‌های {crop.name}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                مقادیر خالی صفر در نظر گرفته می‌شوند
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.key}>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-md ${m.color}`}
                  >
                    <Icon size={11} strokeWidth={2.4} />
                  </span>
                  {m.label}
                  <span className="text-gray-400 font-normal">({m.unit})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form[m.key]}
                  onChange={(e) => handleChange(m.key, e.target.value)}
                  placeholder="0"
                  className="
                    w-full px-3.5 py-2.5 rounded-lg border border-gray-200
                    text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                    outline-none transition-all
                  "
                  style={{ direction: "ltr" }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Name Modal
// ============================================================
const NameModal = ({ title, initialValue, onClose, onSubmit, submitLabel }) => {
  const [value, setValue] = useState(initialValue || "");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Sprout size={16} strokeWidth={2.2} />
            </div>
            <h4 className="text-sm font-bold text-gray-900">{title}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            نام محصول
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onSubmit(value.trim());
            }}
            placeholder="مثال: گلرنگ"
            className="
              w-full px-3.5 py-2.5 rounded-lg border border-gray-200
              text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
              outline-none transition-all
            "
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => value.trim() && onSubmit(value.trim())}
            disabled={!value.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {submitLabel || "ذخیره"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Stats Bar
// ============================================================
const StatsBar = ({ stats }) => (
  <div className="grid grid-cols-3 gap-2">
    {STATS_CONFIG.map((item, i) => {
      const Icon = item.icon;
      const color = item.getColor
        ? item.getColor(stats[item.key])
        : item.color;

      return (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-gray-100"
        >
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${color}`}
          >
            <Icon size={15} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] text-gray-500">{item.label}</div>
            <div className="text-base font-bold text-gray-800 leading-none mt-0.5">
              {stats[item.key]}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ============================================================
// Legend Modal
// ============================================================
const Legend = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          relative flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-xs font-semibold transition-all border whitespace-nowrap
          bg-white text-indigo-700 border-indigo-200
          hover:bg-indigo-50 hover:border-indigo-300
        "
        aria-label="راهنما"
      >
        <Info size={14} strokeWidth={2.4} />
        <span>راهنما</span>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white animate-pulse" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2.5 px-5 py-4 bg-indigo-50/60 border-b border-indigo-100 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700">
                  <Info size={16} strokeWidth={2.4} />
                </span>
                <div>
                  <div className="text-sm font-bold text-indigo-800">
                    راهنمای نمادها
                  </div>
                  <div className="text-[11px] text-indigo-500 mt-0.5">
                    مفهوم آیکون‌ها و دکمه‌های این صفحه
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto">
              {/* Metrics */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px flex-1 bg-indigo-100" />
                  <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">
                    نرخ‌های مصرفی
                  </span>
                  <span className="h-px flex-1 bg-indigo-100" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {METRICS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.key}
                        className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ${m.color}`}
                        >
                          <Icon size={14} strokeWidth={2.4} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-700 leading-tight">
                            {m.label}
                          </div>
                          <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                            {m.unit}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px flex-1 bg-indigo-100" />
                  <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">
                    وضعیت
                  </span>
                  <span className="h-px flex-1 bg-indigo-100" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium flex-shrink-0 ${STATUS_CONFIG.active.className}`}
                    >
                      <CircleCheck size={12} strokeWidth={2.4} />
                      {STATUS_CONFIG.active.label}
                    </span>
                    <span className="text-xs text-gray-600 pt-1">
                      نرخ آب، کود یا سم برای این محصول تعریف شده است
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium flex-shrink-0 ${STATUS_CONFIG.missingRate.className}`}
                    >
                      <CircleSlash size={12} strokeWidth={2.4} />
                      {STATUS_CONFIG.missingRate.label}
                    </span>
                    <span className="text-xs text-gray-600 pt-1">
                      محصول فعال است ولی نرخی برایش تنظیم نشده
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium flex-shrink-0 ${STATUS_CONFIG.inactive.className}`}
                    >
                      <CircleSlash size={12} strokeWidth={2.4} />
                      {STATUS_CONFIG.inactive.label}
                    </span>
                    <span className="text-xs text-gray-600 pt-1">
                      در فرم ثبت مزرعه نمایش داده نمی‌شود
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px flex-1 bg-indigo-100" />
                  <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">
                    عملیات
                  </span>
                  <span className="h-px flex-1 bg-indigo-100" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.values(ACTION_CONFIG).map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-lg ${action.legendBg}`}
                        >
                          <Icon size={14} strokeWidth={2.4} />
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {action.legend}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 py-3 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================
// Main Component
// ============================================================
const CropSettingsManager = () => {
  const {
    crops,
    filteredCrops,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    rateModalCrop,
    setRateModalCrop,
    addModalOpen,
    setAddModalOpen,
    renameModalCrop,
    setRenameModalCrop,
    handleAddCrop,
    handleRename,
    handleToggleActive,
    handleDeleteCrop,
    handleSubmitRate,
  } = useCropSettings();

  // ============================================
  // Loading
  // ============================================
  if (isLoading) {
    return <CropSettingsManagerSkeleton />;
  }

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-4" dir="rtl">
      {/* Stats */}
      <StatsBar stats={stats} />

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Sprout size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">محصولات</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                مدیریت محصولات و نرخ‌های مصرفی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            <Legend />

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
              محصول
            </button>
          </div>
        </div>

        {/* Header Row */}
        <div
          className={`
            ${GRID_CLASS}
            px-4 py-2.5 bg-gray-50/70 border-b border-gray-100
            text-[10px] font-semibold text-gray-500 uppercase tracking-wide
          `}
        >
          <div>نام محصول</div>
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                className="flex items-center justify-center gap-1"
              >
                <Icon size={11} strokeWidth={2.4} />
                <span>{m.label}</span>
              </div>
            );
          })}
          <div className="text-center">عملیات</div>
        </div>

        {/* Body Rows */}
        {filteredCrops.length > 0 ? (
          filteredCrops.map((crop) => (
            <CropRow
              key={crop.id}
              crop={crop}
              onEditRate={setRateModalCrop}
              onToggleActive={handleToggleActive}
              onDeleteCrop={handleDeleteCrop}
              onRename={setRenameModalCrop}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <Sprout size={20} strokeWidth={2} />
            </div>
            <p className="text-sm text-gray-500">
              {searchTerm
                ? "محصولی با این نام یافت نشد"
                : "هنوز محصولی تعریف نشده"}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                افزودن اولین محصول
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {rateModalCrop && (
        <RateModal
          crop={rateModalCrop}
          onClose={() => setRateModalCrop(null)}
          onSubmit={handleSubmitRate}
        />
      )}

      {addModalOpen && (
        <NameModal
          title="افزودن محصول جدید"
          initialValue=""
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddCrop}
          submitLabel="افزودن"
        />
      )}

      {renameModalCrop && (
        <NameModal
          title={`تغییر نام «${renameModalCrop.name}»`}
          initialValue={renameModalCrop.name}
          onClose={() => setRenameModalCrop(null)}
          onSubmit={handleRename}
          submitLabel="ذخیره"
        />
      )}
    </div>
  );
};

export default CropSettingsManager;