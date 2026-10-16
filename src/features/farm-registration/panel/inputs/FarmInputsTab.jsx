// src/features/farm-registration/panel/inputs/FarmInputsTab.jsx
import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  FlaskConical,
  Loader2,
  Info,
  Package,
  Save,
  AlertCircle,
} from 'lucide-react';

import { useInputs } from '../../../agri/hooks/useInputs';
import {
  useFarmInputsQuery,
  useReplaceFarmInputsMutation,
} from '../../hooks/useFarmInputs';
import { useToast } from '../../../../shared/components/Toast/ToastProvider';

// ═══════════════════════════════════════════════════════════
// InputRow
// ═══════════════════════════════════════════════════════════
const InputRow = ({
  row,
  idx,
  allInputs,
  disabled,
  onChange,
  onRemove,
}) => {
  const selectedInput = allInputs.find(
    (i) => i.id === Number(row.input_id)
  );
  const qty = Number(row.quantity) || 0;
  const unitPrice = Number(selectedInput?.price || 0);
  const lineCost = qty * unitPrice;

  const formatFa = (n, digits = 0) =>
    Number(n || 0).toLocaleString('fa-IR', {
      maximumFractionDigits: digits,
    });

  return (
    <div
      className="
        grid grid-cols-[1fr_120px_140px_40px] gap-2 items-start
        p-3 rounded-lg border border-gray-200 bg-white
      "
    >
      {/* نهاده */}
      <div>
        <label className="block text-[10px] text-gray-500 mb-1">
          نهاده
        </label>
        <select
          value={row.input_id || ''}
          onChange={(e) =>
            onChange(idx, 'input_id', e.target.value)
          }
          disabled={disabled}
          className="
            w-full px-3 py-2 rounded-lg border border-gray-200
            text-xs bg-white cursor-pointer
            focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
          "
        >
          <option value="">— انتخاب —</option>
          {allInputs.map((inp) => (
            <option key={inp.id} value={inp.id}>
              {inp.name}
              {selectedInput?.unit
                ? ''
                : ''}{' '}
              ({formatFa(inp.price)} تومان)
            </option>
          ))}
        </select>
      </div>

      {/* مقدار */}
      <div>
        <label className="block text-[10px] text-gray-500 mb-1">
          مقدار{' '}
          {selectedInput && (
            <span className="text-gray-400">
              ({selectedInput.unit})
            </span>
          )}
        </label>
        <input
          type="number"
          min="0"
          step="any"
          value={row.quantity}
          onChange={(e) =>
            onChange(idx, 'quantity', e.target.value)
          }
          disabled={disabled}
          className="
            w-full px-3 py-2 rounded-lg border border-gray-200
            text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
          "
          style={{ direction: 'ltr' }}
        />
      </div>

      {/* هزینه */}
      <div>
        <label className="block text-[10px] text-gray-500 mb-1">
          هزینه (تومان)
        </label>
        <div
          className="
            w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200
            text-xs font-semibold text-emerald-700 text-right tabular-nums
          "
          dir="ltr"
        >
          {lineCost > 0 ? formatFa(lineCost) : '—'}
        </div>
      </div>

      {/* حذف */}
      <div className="pt-5">
        <button
          type="button"
          onClick={() => onRemove(idx)}
          disabled={disabled}
          className="
            p-2 rounded-lg text-red-500 hover:bg-red-50
            transition-colors disabled:opacity-50
          "
          title="حذف سطر"
          aria-label="حذف سطر"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// FarmInputsTab
// ═══════════════════════════════════════════════════════════
const FarmInputsTab = ({ farmId, isEditing = false }) => {
  const toast = useToast();

  // ── لیست همهٔ نهاده‌ها (برای انتخاب) ──
  const { inputs: allInputs, isLoading: inputsLoading } =
    useInputs();

  // ── لیست نهاده‌های این مزرعه ──
  const {
    data: farmInputsData,
    isLoading: farmInputsLoading,
  } = useFarmInputsQuery(farmId, {
    enabled: !!farmId,
  });

  // ── mutation ──
  const replaceMutation = useReplaceFarmInputsMutation();

  // ── state محلی: rows ──
  const [rows, setRows] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // ── همگام‌سازی اولیه از سرور ──
  useEffect(() => {
    if (initialized) return;
    if (farmInputsLoading || inputsLoading) return;
    if (!farmInputsData) return;

    setRows(
      (farmInputsData.items || []).map((it) => ({
        input_id: it.input_id,
        quantity: it.quantity,
        notes: it.notes || '',
      }))
    );
    setInitialized(true);
  }, [
    initialized,
    farmInputsLoading,
    inputsLoading,
    farmInputsData,
  ]);

  // ── محاسبهٔ هزینهٔ کل ──
  const totalCost = useMemo(() => {
    return rows.reduce((sum, row) => {
      const inp = allInputs.find(
        (i) => i.id === Number(row.input_id)
      );
      if (!inp) return sum;
      const qty = Number(row.quantity) || 0;
      return sum + qty * Number(inp.price || 0);
    }, 0);
  }, [rows, allInputs]);

  // ── افزودن سطر ──
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { input_id: '', quantity: '', notes: '' },
    ]);
  };

  // ── حذف سطر ──
  const handleRemoveRow = (idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── تغییر سطر ──
  const handleRowChange = (idx, field, value) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      )
    );
  };

  // ── ذخیره ──
  const handleSave = async () => {
    const validRows = rows
      .filter(
        (r) => r.input_id && Number(r.quantity) > 0
      )
      .map((r) => ({
        input_id: Number(r.input_id),
        quantity: Number(r.quantity),
        notes: r.notes?.trim() || null,
      }));

    try {
      await replaceMutation.mutateAsync({
        farmId,
        items: validRows,
      });
      toast.success(
        'نهاده‌های مزرعه ذخیره شد',
        'ذخیره شد'
      );
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ذخیره';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا'
      );
    }
  };

  // ── Loading ──
  if (farmInputsLoading || inputsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          size={24}
          className="text-primary-600 animate-spin"
        />
      </div>
    );
  }

  // ── بدون farmId ──
  if (!farmId) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <Package size={22} />
        </div>
        <p className="text-sm text-gray-500">
          برای ثبت نهاده، ابتدا زمین را ذخیره کنید.
        </p>
      </div>
    );
  }

  const activeInputs = allInputs.filter((i) => i.is_active);

  const formatFa = (n, digits = 0) =>
    Number(n || 0).toLocaleString('fa-IR', {
      maximumFractionDigits: digits,
    });

  return (
    <div className="space-y-4">
      {/* ── Info banner ── */}
      <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 leading-relaxed">
        <Info
          size={13}
          className="text-emerald-600 flex-shrink-0 mt-0.5"
        />
        <div>
          نهاده‌های مصرفی این مزرعه را وارد کنید. هزینه بر اساس
          قیمت فعلی نهاده‌ها محاسبه می‌شود.
        </div>
      </div>

      {/* ── لیست سطرها ── */}
      <div className="space-y-2">
        {rows.length === 0 && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Package
              size={20}
              className="text-gray-300 mx-auto mb-2"
            />
            <p className="text-xs text-gray-400">
              هنوز نهاده‌ای اضافه نشده
            </p>
          </div>
        )}

        {rows.map((row, idx) => (
          <InputRow
            key={idx}
            row={row}
            idx={idx}
            allInputs={activeInputs}
            disabled={replaceMutation.isPending}
            onChange={handleRowChange}
            onRemove={handleRemoveRow}
          />
        ))}
      </div>

      {/* ── دکمه افزودن ── */}
      <button
        type="button"
        onClick={handleAddRow}
        disabled={replaceMutation.isPending}
        className="
          w-full flex items-center justify-center gap-2
          py-2.5 px-3 rounded-lg
          border border-dashed border-gray-300
          text-xs font-semibold text-gray-600
          hover:bg-gray-50 hover:border-gray-400
          transition-colors cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <Plus size={14} />
        افزودن نهاده
      </button>

      {/* ── خلاصه هزینه ── */}
      {rows.length > 0 && (
        <div className="p-4 bg-gradient-to-l from-emerald-50 to-white border border-emerald-200 rounded-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-300/50 flex items-center justify-center">
                <FlaskConical
                  size={16}
                  className="text-emerald-700"
                  strokeWidth={2.4}
                />
              </div>
              <div>
                <div className="text-[10px] text-emerald-600">
                  هزینهٔ کل نهاده‌ها
                </div>
                <div
                  className="text-lg font-bold text-emerald-800 tabular-nums"
                  dir="ltr"
                >
                  {formatFa(totalCost)}
                  <span className="text-[10px] text-emerald-600 mr-1">
                    تومان
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                replaceMutation.isPending || !farmId
              }
              className="
                inline-flex items-center gap-1.5
                px-4 py-2 rounded-lg
                bg-emerald-600 text-white
                text-xs font-bold
                hover:bg-emerald-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {replaceMutation.isPending ? (
                <>
                  <Loader2
                    size={13}
                    className="animate-spin"
                  />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save size={13} />
                  ذخیره
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── هشدار زمانی که هیچ سطر معتبری نیست ── */}
      {rows.length > 0 &&
        rows.every(
          (r) => !r.input_id || Number(r.quantity) <= 0
        ) && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
            <AlertCircle
              size={12}
              className="flex-shrink-0 mt-0.5"
            />
            <span>
              برای ذخیره، حداقل یک نهاده با مقدار بزرگ‌تر از
              صفر لازم است.
            </span>
          </div>
        )}
    </div>
  );
};

export default FarmInputsTab;