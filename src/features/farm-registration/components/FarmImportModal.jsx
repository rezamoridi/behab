// src/features/farm-registration/components/FarmImportModal.jsx
import { useState, useRef, useMemo } from 'react';
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';

import { farmImportExportApi } from '../../../services/api/farmImportExportApi';
import { useRegionsQuery } from '../../regions/hooks/useRegions';
import { useVillagesQuery } from '../../villages/hooks/useVillages';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ── Step indicator ──
const STEPS = [
  { id: 1, label: 'آپلود' },
  { id: 2, label: 'پیش‌نمایش' },
  { id: 3, label: 'نتیجه' },
];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
    {STEPS.map((step, idx) => {
      const isActive = step.id === current;
      const isDone = step.id < current;
      return (
        <div key={step.id} className="flex items-center gap-2">
          <div
            className={`
              flex items-center justify-center gap-1.5
              px-3 py-1.5 rounded-lg text-[11px] font-bold
              transition-all
              ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : isDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-400'
              }
            `}
          >
            <span className="text-[10px]">
              {isDone ? '✓' : step.id.toLocaleString('fa-IR')}
            </span>
            <span>{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <ArrowLeft
              size={12}
              className={
                isDone ? 'text-emerald-500' : 'text-gray-300'
              }
            />
          )}
        </div>
      );
    })}
  </div>
);

// ── Row badge ──
const RowStatusBadge = ({ row }) => {
  if (row.status === 'valid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
        <CheckCircle2 size={10} />
        جدید
      </span>
    );
  }
  if (row.status === 'warning') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
        <AlertTriangle size={10} />
        موجود
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
      <AlertCircle size={10} />
      خطا
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════
const FarmImportModal = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const confirm = useConfirm();

  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState(null);

  // Options
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [sendSms, setSendSms] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);

  const { data: regions = [] } = useRegionsQuery({
    activeOnly: true,
  });

  const { data: villages = [] } = useVillagesQuery({
    activeOnly: true,
  });

  const filteredVillages = useMemo(() => {
    if (!selectedRegionId) return villages;
    return villages.filter(
      (v) =>
        v.region_id == null ||
        String(v.region_id) === String(selectedRegionId)
    );
  }, [villages, selectedRegionId]);

  // ── انتخاب فایل ──
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      toast.error('فقط فایل .xlsx پذیرفته می‌شود', 'خطا');
      return;
    }

    setIsUploading(true);
    try {
      const response = await farmImportExportApi.preview(file);
      setPreview(response.data);
      setStep(2);
    } catch (err) {
      const msg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در پردازش فایل';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── تأیید import ──
  const handleConfirm = async () => {
    if (!preview) return;

    // فیلتر سطرهای معتبر
    const validRawRows = preview.raw_rows.filter((_, idx) => {
      const row = preview.rows[idx];
      return (
        row?.status === 'valid' || row?.status === 'warning'
      );
    });

    if (validRawRows.length === 0) {
      toast.warning(
        'هیچ سطر معتبری برای import وجود ندارد',
        'توجه'
      );
      return;
    }

    const ok = await confirm({
      title: 'تأیید ورود گروهی',
      message: `${validRawRows.length.toLocaleString(
        'fa-IR'
      )} سطر معتبر import می‌شود.\nآیا مطمئن هستید؟`,
      confirmText: 'import کن',
      cancelText: 'انصراف',
      variant: 'primary',
    });
    if (!ok) return;

    setIsImporting(true);
    try {
      const response = await farmImportExportApi.confirm({
        rows: validRawRows,
        regionId: selectedRegionId
          ? Number(selectedRegionId)
          : null,
        villageId: selectedVillageId
          ? Number(selectedVillageId)
          : null,
        sendSms,
        updateExisting,
      });
      setResult(response.data);
      setStep(3);
      toast.success(
        `${response.data.success_count.toLocaleString(
          'fa-IR'
        )} سطر پردازش شد`,
        'ورود موفق'
      );
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در import';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا'
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPreview(null);
    setResult(null);
    setSelectedRegionId('');
    setSelectedVillageId('');
    setSendSms(false);
    setUpdateExisting(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                ورود گروهی مزارع
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                از فایل Excel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading || isImporting}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <StepIndicator current={step} />

          {/* ─── Step 1: آپلود ─── */}
          {step === 1 && (
            <div className="text-center max-w-md mx-auto py-6">
              <div
                className="
                  border-2 border-dashed border-gray-300 rounded-2xl
                  p-8 mb-4
                  hover:border-indigo-400 hover:bg-indigo-50/30
                  transition-colors cursor-pointer
                "
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload
                  size={32}
                  className="text-gray-400 mx-auto mb-3"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  فایل Excel را انتخاب کنید
                </p>
                <p className="text-[11px] text-gray-400">
                  فقط .xlsx — حداکثر ۱۰۰۰ سطر
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xlsm"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="
                  inline-flex items-center gap-2 px-5 py-2.5
                  bg-indigo-600 text-white rounded-lg
                  text-sm font-semibold
                  hover:bg-indigo-700 transition-colors
                  disabled:opacity-50
                "
              >
                {isUploading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    انتخاب فایل
                  </>
                )}
              </button>
            </div>
          )}

          {/* ─── Step 2: پیش‌نمایش ─── */}
          {step === 2 && preview && (
            <div className="space-y-4">
              {/* خلاصه */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="text-[10px] text-gray-500 mb-0.5">
                    کل
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {preview.total_rows.toLocaleString('fa-IR')}
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3">
                  <div className="text-[10px] text-emerald-600 mb-0.5">
                    معتبر
                  </div>
                  <div className="text-lg font-bold text-emerald-700">
                    {preview.valid_rows.toLocaleString('fa-IR')}
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-3">
                  <div className="text-[10px] text-amber-600 mb-0.5">
                    موجود
                  </div>
                  <div className="text-lg font-bold text-amber-700">
                    {preview.warning_rows.toLocaleString('fa-IR')}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-3">
                  <div className="text-[10px] text-red-600 mb-0.5">
                    خطا
                  </div>
                  <div className="text-lg font-bold text-red-700">
                    {preview.invalid_rows.toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>

              {/* ستون‌های ناشناخته */}
              {preview.unknown_headers?.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <AlertTriangle
                    size={14}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <strong>ستون‌های ناشناخته:</strong>{' '}
                    {preview.unknown_headers.join('، ')}
                  </div>
                </div>
              )}

              {/* جدول */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">
                    پیش‌نمایش سطرها
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {preview.rows.length.toLocaleString('fa-IR')} سطر
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b border-gray-200">
                        <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500">
                          سطر
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500">
                          نام
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500">
                          کد ملی
                        </th>
                        <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500">
                          محصول
                        </th>
                        <th className="text-center px-3 py-2 font-semibold text-[10px] text-gray-500">
                          وضعیت
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.rows.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            row.status === 'invalid'
                              ? 'bg-red-50/40'
                              : row.status === 'warning'
                                ? 'bg-amber-50/40'
                                : ''
                          }
                        >
                          <td className="px-3 py-2 text-gray-400">
                            {row.row_number}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-700">
                            {row.farmer_name || '—'}
                          </td>
                          <td
                            className="px-3 py-2 font-mono text-gray-600"
                            dir="ltr"
                          >
                            {row.national_id || '—'}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.crop || '—'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <RowStatusBadge row={row} />
                            {(row.error || row.warning) && (
                              <div className="text-[9px] text-gray-500 mt-1 max-w-[200px] mx-auto text-right">
                                {row.error || row.warning}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Options */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Region */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      منطقه (اختیاری)
                    </label>
                    <select
                      value={selectedRegionId}
                      onChange={(e) => {
                        setSelectedRegionId(e.target.value);
                        setSelectedVillageId('');
                      }}
                      disabled={isImporting}
                      className="
                        w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                        text-sm bg-white cursor-pointer
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                        outline-none
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

                  {/* Village */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      روستا (اختیاری)
                    </label>
                    <select
                      value={selectedVillageId}
                      onChange={(e) =>
                        setSelectedVillageId(e.target.value)
                      }
                      disabled={isImporting}
                      className="
                        w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                        text-sm bg-white cursor-pointer
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                        outline-none
                      "
                    >
                      <option value="">— بدون روستا —</option>
                      {filteredVillages.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendSms}
                    onChange={(e) =>
                      setSendSms(e.target.checked)
                    }
                    disabled={isImporting}
                    className="w-4 h-4 rounded accent-primary-600"
                  />
                  <span className="text-xs text-gray-700">
                    ارسال پیامک دعوت برای کشاورزان جدید
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) =>
                      setUpdateExisting(e.target.checked)
                    }
                    disabled={isImporting}
                    className="w-4 h-4 rounded accent-primary-600"
                  />
                  <span className="text-xs text-gray-700">
                    به‌روزرسانی کشاورزان موجود
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isImporting}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                >
                  ← بازگشت
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={
                    isImporting ||
                    preview.valid_rows + preview.warning_rows ===
                      0
                  }
                  className="
                    inline-flex items-center gap-2 px-5 py-2.5
                    bg-indigo-600 text-white rounded-lg
                    text-sm font-semibold
                    hover:bg-indigo-700 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isImporting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      در حال import...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      تأیید و import
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: نتیجه ─── */}
          {step === 3 && result && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  ورود گروهی کامل شد
                </h3>
                <p className="text-xs text-gray-500">
                  {result.total_processed.toLocaleString('fa-IR')}{' '}
                  سطر پردازش شد
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 text-center">
                  <div className="text-[10px] text-emerald-600 mb-0.5">
                    موفق
                  </div>
                  <div className="text-lg font-bold text-emerald-700">
                    {result.success_count.toLocaleString('fa-IR')}
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
                  <div className="text-[10px] text-red-600 mb-0.5">
                    ناموفق
                  </div>
                  <div className="text-lg font-bold text-red-700">
                    {result.failed_count.toLocaleString('fa-IR')}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 text-center">
                  <div className="text-[10px] text-blue-600 mb-0.5">
                    کشاورز جدید
                  </div>
                  <div className="text-lg font-bold text-blue-700">
                    {result.created_farmers.toLocaleString('fa-IR')}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl border border-purple-200 p-3 text-center">
                  <div className="text-[10px] text-purple-600 mb-0.5">
                    مزرعه ساخته‌شده
                  </div>
                  <div className="text-lg font-bold text-purple-700">
                    {result.created_farms.toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>

              {/* Errors / Warnings */}
              {result.errors?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle size={13} className="text-red-600" />
                    <span className="text-xs font-bold text-red-800">
                      خطاها ({result.errors.length.toLocaleString('fa-IR')})
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {result.errors.map((err, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-red-700 bg-white rounded-md px-2 py-1.5"
                      >
                        <span className="font-bold">
                          سطر {err.row_number}:
                        </span>{' '}
                        {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Import جدید
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmImportModal;