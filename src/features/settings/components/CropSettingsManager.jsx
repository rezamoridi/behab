// src/features/settings/components/CropSettingsManager.jsx
import { useState } from "react";
import {
  Plus,
  Search,
  Sprout,
  Info,
  Power,
  PowerOff,
  CircleSlash,
  Pencil,
  Trash2,
  AlertCircle,
  Palette,
  Droplet,
  CloudRain,
  Tractor,
  Leaf,
  Wallet,
} from "lucide-react";

import Modal from "../../../shared/components/Modal/Modal";
import { useToast } from "../../../shared/components/Toast/ToastProvider";

import {
  METRICS,
  GRID_CLASS,
  STATUS_CONFIG,
  ACTION_CONFIG,
  STATS_CONFIG,
  FORM_SECTIONS,
} from "../constants/cropSettingsConfig";
import { CropSettingsManagerSkeleton } from "../constants/cropSettingsSkeletons";

import {
  CROP_COLOR_PALETTE,
  DEFAULT_FARM_COLOR,
  normalizeHex,
  isValidHexColor,
  withAlpha,
  getIrrigationStyle,
} from "../constants/cropColors";
import { useCropSettings } from "../hooks/useCropSettings";

// ============================================================
// ColorPicker
// ============================================================
const ColorPicker = ({ value, onChange, disabled = false }) => {
  const safeValue = normalizeHex(value) || DEFAULT_FARM_COLOR;
  const [customInput, setCustomInput] = useState(safeValue);

  const handlePaletteClick = (color) => {
    if (disabled) return;
    onChange(color);
    setCustomInput(color);
  };

  const handleColorInput = (e) => {
    const v = e.target.value;
    setCustomInput(v);
    const normalized = normalizeHex(v);
    if (normalized) onChange(normalized);
  };

  const handleTextInput = (e) => {
    const v = e.target.value;
    setCustomInput(v);
    const normalized = normalizeHex(v);
    if (normalized) onChange(normalized);
  };

  const isCustomValid = isValidHexColor(customInput);

  return (
    <div className="space-y-2.5">
      {/* پالت */}
      <div className="flex flex-wrap gap-1.5">
        {CROP_COLOR_PALETTE.map((c) => {
          const isActive = safeValue.toUpperCase() === c.toUpperCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => handlePaletteClick(c)}
              disabled={disabled}
              className={`
                w-7 h-7 rounded-full border-2 transition-all
                ${
                  isActive
                    ? "border-gray-800 scale-110 shadow-md"
                    : "border-white shadow"
                }
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-110 cursor-pointer"
                }
              `}
              style={{ backgroundColor: c }}
              title={c}
              aria-label={`انتخاب رنگ ${c}`}
              aria-pressed={isActive}
            />
          );
        })}
      </div>

      {/* ورودی دستی */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safeValue}
          onChange={handleColorInput}
          disabled={disabled}
          className="
            w-10 h-9 rounded-lg border border-gray-200 cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            flex-shrink-0
          "
          title="انتخاب رنگ دلخواه"
        />
        <input
          type="text"
          value={customInput}
          onChange={handleTextInput}
          disabled={disabled}
          placeholder="#RRGGBB"
          maxLength={7}
          className={`
            flex-1 min-w-0 px-3 py-2 rounded-lg border text-xs font-mono
            outline-none transition-all
            ${
              isCustomValid
                ? "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                : "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            }
            ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
          `}
          style={{ direction: "ltr" }}
        />
        {!isCustomValid && (
          <span className="text-[10px] text-red-600 whitespace-nowrap flex-shrink-0">
            نامعتبر
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Irrigation Badge
// ============================================================
const IrrigationBadge = ({ type }) => {
  const style = getIrrigationStyle(type);
  const Icon = type === "دیم" ? CloudRain : Droplet;
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded
        text-[10px] font-semibold border
        ${style.bg} ${style.text} ${style.border}
      `}
    >
      <Icon size={9} strokeWidth={2.6} />
      {type || "آبی"}
    </span>
  );
};

// ============================================================
// Metric Cell
// ============================================================
const MetricCell = ({ config, value }) => {
  const Icon = config.icon;
  const hasValue = value !== null && value !== undefined && Number(value) > 0;

  if (!hasValue) {
    return (
      <div className="flex items-center justify-center gap-1 opacity-40">
        <Icon size={11} className="text-gray-300" strokeWidth={2.2} />
        <span className="text-[11px] text-gray-300">—</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Icon
        size={11}
        className={config.color.split(" ")[0]}
        strokeWidth={2.4}
      />
      <span
        className="text-[11px] font-semibold text-gray-700 tabular-nums"
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
  if (!isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-medium">
        <CircleSlash size={9} />
        غیرفعال
      </span>
    );
  }

  if (!hasRate) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
        <AlertCircle size={9} />
        نرخ تعریف نشده
      </span>
    );
  }

  return null;
};

// ============================================================
// Crop Row
// ============================================================
const CropRow = ({ crop, onEdit, onToggleActive, onDeleteCrop }) => {
  const color = normalizeHex(crop.color) || DEFAULT_FARM_COLOR;

  const hasRate = [
    "requirement",
    "nitrogen",
    "phosphate",
    "potassium",
    "seed_rate",
    "crop_yield",
    "price",
  ].some((k) => Number(crop[k]) > 0);

  const tableMetrics = METRICS.filter((m) => m.key !== "price");
  const priceMetric = METRICS.find((m) => m.key === "price");

  return (
    <div
      className={`
        ${GRID_CLASS}
        px-4 py-3 border-b border-gray-100 last:border-0
        transition-colors
        ${!crop.is_active ? "bg-gray-50/60" : "hover:bg-gray-50"}
      `}
    >
      {/* Name + Color + Irrigation + Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border"
          style={{
            backgroundColor: withAlpha(color, 0.15),
            borderColor: withAlpha(color, 0.4),
          }}
          title={`رنگ لایه: ${color}`}
        >
          <span
            className="w-3.5 h-3.5 rounded-full shadow-inner"
            style={{ backgroundColor: color }}
          />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`
                text-sm font-semibold truncate
                ${
                  crop.is_active
                    ? "text-gray-900"
                    : "text-gray-400 line-through"
                }
              `}
              title={crop.name}
            >
              {crop.name}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <IrrigationBadge type={crop.irrigation_type} />
            <StatusPill isActive={crop.is_active} hasRate={hasRate} />
          </div>
        </div>
      </div>

      {/* Metrics */}
      {tableMetrics.map((m) => (
        <MetricCell key={m.key} config={m} value={crop[m.key]} />
      ))}

      {/* Price */}
      {priceMetric && <MetricCell config={priceMetric} value={crop.price} />}

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onEdit(crop)}
          className={`p-2 rounded-lg transition-colors ${ACTION_CONFIG.edit.color}`}
          title={ACTION_CONFIG.edit.title}
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          onClick={() => onToggleActive(crop)}
          className={`
            p-2 rounded-lg transition-colors
            ${
              crop.is_active
                ? "text-green-600 hover:bg-green-50"
                : "text-gray-400 hover:bg-gray-100"
            }
          `}
          title={crop.is_active ? "غیرفعال کردن" : "فعال کردن"}
        >
          {crop.is_active ? <Power size={14} /> : <PowerOff size={14} />}
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
// Section Header
// ============================================================
const SectionHeader = ({ icon: Icon, title, hint }) => (
  <div className="flex items-center gap-2">
    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary-50 text-primary-600 flex-shrink-0">
      <Icon size={13} strokeWidth={2.4} />
    </span>
    <span className="text-xs font-bold text-gray-800">{title}</span>
    {hint && (
      <span className="text-[10px] text-gray-400 font-normal mr-auto truncate">
        {hint}
      </span>
    )}
    <span className="h-px flex-1 bg-gray-100" />
  </div>
);

// ============================================================
// Number Field
// ============================================================
const NumberField = ({ field, value, onChange, disabled }) => {
  const Icon = field.icon;
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
        <span
          className={`flex items-center justify-center w-5 h-5 rounded-md ${field.color} flex-shrink-0`}
        >
          <Icon size={11} strokeWidth={2.4} />
        </span>
        <span className="truncate">{field.label}</span>
        <span className="text-gray-400 font-normal whitespace-nowrap">
          ({field.unit})
        </span>
      </label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value ?? ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder="—"
        disabled={disabled}
        className="
          w-full px-3.5 py-2.5 rounded-lg border border-gray-200
          text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
          outline-none transition-all disabled:bg-gray-50
        "
        style={{ direction: "ltr" }}
      />
    </div>
  );
};

// ============================================================
// Irrigation Radio Group
// ============================================================
const IrrigationRadio = ({ value, onChange, disabled }) => {
  const options = [
    { value: "آبی", label: "آبی", Icon: Droplet },
    { value: "دیم", label: "دیم", Icon: CloudRain },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(({ value: v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            disabled={disabled}
            className={`
              flex items-center justify-center gap-2
              px-3 py-2.5 rounded-lg border-2
              text-sm font-semibold transition-all
              ${
                active
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-pressed={active}
          >
            <Icon size={14} strokeWidth={2.4} />
            {label}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================
// Edit Modal
// ============================================================
const EditModal = ({ crop, onClose, onSubmit }) => {
  const toast = useToast();
  const initialColor = normalizeHex(crop.color) || DEFAULT_FARM_COLOR;

  const [form, setForm] = useState(() => {
    const initial = {
      name: crop.name || "",
      irrigation_type: crop.irrigation_type || "آبی",
      color: initialColor,
    };
    [
      "requirement",
      "nitrogen",
      "phosphate",
      "potassium",
      "seed_rate",
      "crop_yield",
      "price",
      "machinery_primary_tillage",
      "machinery_secondary_tillage",
      "machinery_planting",
      "machinery_spraying",
      "machinery_fertilizing",
      "machinery_harvesting",
    ].forEach((k) => {
      const v = crop[k];
      initial[k] = v != null ? String(v) : "";
    });
    return initial;
  });

  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "name" && nameError) setNameError("");
  };

  const handleSubmit = async () => {
    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setNameError("نام محصول الزامی است");
      return;
    }
    if (trimmedName.length < 2) {
      setNameError("نام محصول باید حداقل ۲ حرف باشد");
      return;
    }

    // ... existing payload logic

    const nameChanged = trimmedName !== crop.name;
    const irrigationChanged =
      form.irrigation_type !== (crop.irrigation_type || "آبی");
    const colorChanged = safeColor !== initialColor;
    const anyNumericChanged = numericKeys.some((k) => {
      const original = crop[k];
      const next = payload[k];
      const origNum = original == null ? null : Number(original);
      return origNum !== next;
    });

    if (
      !nameChanged &&
      !irrigationChanged &&
      !colorChanged &&
      !anyNumericChanged
    ) {
      // ✅ جایگزین alert
      toast.warning("تغییری اعمال نشده است", "توجه");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="ویرایش محصول"
      subtitle="اطلاعات پایه، نیازهای زراعی، اقتصادی و ماشین‌آلات"
      icon={Pencil}
      headerBg="bg-emerald-50/60"
      headerColor="text-emerald-700"
      maxWidth="max-w-2xl"
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
            ذخیره تغییرات
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {FORM_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className="space-y-3">
              <SectionHeader
                icon={SectionIcon}
                title={section.title}
                hint={section.hint}
              />

              {/* Basic */}
              {section.id === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-primary-50 text-primary-600 flex-shrink-0">
                        <Sprout size={11} strokeWidth={2.4} />
                      </span>
                      نام محصول
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="مثال: گندم"
                      disabled={isSubmitting}
                      className={`
                        w-full px-3.5 py-2.5 rounded-lg border text-sm
                        focus:ring-2 outline-none transition-all
                        ${
                          nameError
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-200 focus:border-primary-500 focus:ring-primary-100"
                        }
                      `}
                      autoFocus
                    />
                    {nameError && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-sky-50 text-sky-600 flex-shrink-0">
                        <Droplet size={11} strokeWidth={2.4} />
                      </span>
                      نوع آبیاری
                      <span className="text-gray-400 font-normal">
                        (کلید طبیعی با نام)
                      </span>
                    </label>
                    <IrrigationRadio
                      value={form.irrigation_type}
                      onChange={(v) => handleChange("irrigation_type", v)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
                      <span
                        className="flex items-center justify-center w-5 h-5 rounded-md border flex-shrink-0"
                        style={{
                          backgroundColor: withAlpha(form.color, 0.2),
                          borderColor: withAlpha(form.color, 0.5),
                        }}
                      >
                        <Palette
                          size={11}
                          strokeWidth={2.4}
                          style={{ color: form.color }}
                        />
                      </span>
                      رنگ نمایش لایه روی نقشه
                    </label>
                    <ColorPicker
                      key={`color-picker-edit-${form.color}`}
                      value={form.color}
                      onChange={(c) => handleChange("color", c)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Agronomy */}
              {section.id === "agronomy" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <NumberField
                      key={field.key}
                      field={field}
                      value={form[field.key]}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}

              {/* Economic */}
              {section.id === "economic" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <NumberField
                      key={field.key}
                      field={field}
                      value={form[field.key]}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}

              {/* Machinery */}
              {section.id === "machinery" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <NumberField
                      key={field.key}
                      field={field}
                      value={form[field.key]}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

// ============================================================
// Add Crop Modal
// ============================================================
const AddCropModal = ({ onClose, onSubmit }) => {
  const [value, setValue] = useState("");
  const [color, setColor] = useState(CROP_COLOR_PALETTE[0]);
  const [irrigationType, setIrrigationType] = useState("آبی");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError("نام محصول باید حداقل ۲ حرف باشد");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit({
        name: trimmed,
        color: normalizeHex(color) || DEFAULT_FARM_COLOR,
        irrigation_type: irrigationType,
      });
    } catch (e) {
      setError(e?.message || "خطا در افزودن محصول");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="افزودن محصول جدید"
      subtitle="محصول جدید برای استفاده در مزارع"
      icon={Plus}
      headerBg="bg-emerald-50/60"
      headerColor="text-emerald-700"
      maxWidth="max-w-md"
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
            onClick={handleAdd}
            disabled={value.trim().length < 2 || isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            افزودن
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            نام محصول
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim().length >= 2) {
                handleAdd();
              }
            }}
            placeholder="مثال: گندم"
            disabled={isSubmitting}
            className="
              w-full px-3.5 py-2.5 rounded-lg border border-gray-200
              text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
              outline-none transition-all
            "
            autoFocus
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
            <Droplet size={12} strokeWidth={2.4} />
            نوع آبیاری
          </label>
          <IrrigationRadio
            value={irrigationType}
            onChange={setIrrigationType}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
            <Palette size={12} strokeWidth={2.4} />
            رنگ نمایش لایه
          </label>
          <ColorPicker
            key={`color-picker-add-${color}`}
            value={color}
            onChange={setColor}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <p className="text-[11px] text-gray-500">
          بعد از افزودن، می‌توانید نیازهای زراعی، قیمت و ماشین‌آلات را تنظیم
          کنید.
        </p>
      </div>
    </Modal>
  );
};

// ============================================================
// Stats Bar
// ============================================================
const StatsBar = ({ stats }) => (
  <div className="grid grid-cols-3 gap-2">
    {STATS_CONFIG.map((item, i) => {
      const Icon = item.icon;
      const color = item.getColor ? item.getColor(stats[item.key]) : item.color;

      return (
        <div
          key={i}
          className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-gray-100"
        >
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-lg ${color} flex-shrink-0`}
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

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="راهنمای نمادها"
        subtitle="مفهوم آیکون‌ها و دکمه‌های این صفحه"
        icon={Info}
        headerBg="bg-indigo-50/60"
        headerColor="text-indigo-700"
        maxWidth="max-w-2xl"
        footer={
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            متوجه شدم
          </button>
        }
      >
        <div className="space-y-5">
          {/* Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px flex-1 bg-indigo-100" />
              <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">
                نرخ‌های مصرفی
              </span>
              <span className="h-px flex-1 bg-indigo-100" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {METRICS.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.key}
                    className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-lg ${m.color} flex-shrink-0`}
                    >
                      <Icon size={14} strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-gray-700 leading-tight truncate">
                        {m.label}
                      </div>
                      <div className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">
                        {m.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Irrigation type */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px flex-1 bg-indigo-100" />
              <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">
                نوع آبیاری
              </span>
              <span className="h-px flex-1 bg-indigo-100" />
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-3">
                <IrrigationBadge type="آبی" />
                <span className="text-xs text-gray-600 pt-1">
                  محصول با نیاز آبی بالا — نرخ‌های مصرفی معمولاً بیشتر است.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <IrrigationBadge type="دیم" />
                <span className="text-xs text-gray-600 pt-1">
                  محصول وابسته به بارش — نرخ آب صفر یا خیلی کم است.
                </span>
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px flex-1 bg-indigo-100" />
              <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide">
                رنگ لایه
              </span>
              <span className="h-px flex-1 bg-indigo-100" />
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                <Palette size={15} strokeWidth={2.4} />
              </span>
              <p className="text-xs text-gray-600 pt-1.5">
                رنگ انتخاب‌شده برای هر محصول، روی لایه‌ی آن محصول در نقشه اعمال
                می‌شود. مزارعی که محصول ندارند با رنگ خاکستری پیش‌فرض نمایش داده
                می‌شوند.
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
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
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium flex-shrink-0 ${STATUS_CONFIG.missingRate.className}`}
                >
                  <AlertCircle size={12} strokeWidth={2.4} />
                  {STATUS_CONFIG.missingRate.label}
                </span>
                <span className="text-xs text-gray-600 pt-1">
                  محصول فعال است ولی هنوز نرخی برایش تنظیم نشده
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-50 text-sky-600">
                  <Pencil size={14} strokeWidth={2.4} />
                </span>
                <span className="text-xs font-medium text-gray-700">
                  ویرایش محصول
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600">
                  <Power size={14} strokeWidth={2.4} />
                </span>
                <span className="text-xs font-medium text-gray-700">
                  فعال / غیرفعال
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500">
                  <Trash2 size={14} strokeWidth={2.4} />
                </span>
                <span className="text-xs font-medium text-gray-700">
                  حذف محصول
                </span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ============================================================
// Main Component
// ============================================================
const CropSettingsManager = () => {
  const {
    filteredCrops,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    editModalCrop,
    setEditModalCrop,
    addModalOpen,
    setAddModalOpen,
    handleAddCrop,
    handleToggleActive,
    handleDeleteCrop,
    handleSubmitEdit,
  } = useCropSettings();

  if (isLoading) {
    return <CropSettingsManagerSkeleton />;
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
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <Sprout size={16} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">محصولات</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                مدیریت محصولات، رنگ لایه، نیازهای زراعی و ماشین‌آلات
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
          {METRICS.filter((m) => m.key !== "price").map((m) => {
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
          <div className="flex items-center justify-center gap-1">
            <Wallet size={11} strokeWidth={2.4} />
            <span>قیمت</span>
          </div>
          <div className="text-center">عملیات</div>
        </div>

        {/* Body Rows */}
        {filteredCrops.length > 0 ? (
          filteredCrops.map((crop) => (
            <CropRow
              key={crop.id}
              crop={crop}
              onEdit={setEditModalCrop}
              onToggleActive={handleToggleActive}
              onDeleteCrop={handleDeleteCrop}
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
      {editModalCrop && (
        <EditModal
          crop={editModalCrop}
          onClose={() => setEditModalCrop(null)}
          onSubmit={handleSubmitEdit}
        />
      )}

      {addModalOpen && (
        <AddCropModal
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddCrop}
        />
      )}
    </div>
  );
};

export default CropSettingsManager;
