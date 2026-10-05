// src/features/settings/components/ImportData.jsx
import { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

import {
  useImportPreviewMutation,
  useImportConfirmMutation,
} from "../../admin/hooks/useImport";
import { importApi } from "../../../services/api/importApi";
import { useRegionsQuery } from "../../regions/hooks/useRegions";
import { useToast } from "../../../shared/components/Toast/ToastProvider";
import { useConfirm } from "../../../shared/components/ConfirmDialog/ConfirmDialogProvider";

// ============================================================
// Step indicators
// ============================================================
const STEPS = [
  { id: 1, label: "دانلود Template" },
  { id: 2, label: "آپلود فایل" },
  { id: 3, label: "پیش‌نمایش" },
  { id: 4, label: "نتیجه" },
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
                  ? "bg-primary-600 text-white shadow-sm"
                  : isDone
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-gray-100 text-gray-400"
              }
            `}
          >
            <span className="text-[10px]">
              {isDone ? "✓" : step.id.toLocaleString("fa-IR")}
            </span>
            <span>{step.label}</span>
          </div>
          {idx < STEPS.length - 1 && (
            <ArrowRight
              size={12}
              className={isDone ? "text-emerald-500" : "text-gray-300"}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ============================================================
// Row Status Badge
// ============================================================
const RowStatusBadge = ({ row }) => {
  if (row.status === "valid") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
        <CheckCircle2 size={10} />
        جدید
      </span>
    );
  }
  if (row.status === "warning") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
        <AlertTriangle size={10} />
        موجود
      </span>
    );
  }
  if (row.status === "invalid") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
        <AlertCircle size={10} />
        خطا
      </span>
    );
  }
  return null;
};

// ============================================================
// Main
// ============================================================
const ImportData = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(null);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [sendSms, setSendSms] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const previewMutation = useImportPreviewMutation();
  const confirmMutation = useImportConfirmMutation();
  const { data: regions = [] } = useRegionsQuery({ activeOnly: true });

  // ─── Download Template ───
  const handleDownloadTemplate = async () => {
    try {
      const response = await importApi.downloadTemplate();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "import-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Template دانلود شد", "موفق");
      setStep(2);
    } catch (err) {
      toast.error("خطا در دانلود Template", "خطا");
    }
  };

  // ─── Upload ───
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("فقط فایل .xlsx پذیرفته می‌شود", "خطا");
      return;
    }

    try {
      const result = await previewMutation.mutateAsync(file);
      setPreview(result);
      setStep(3);
    } catch (err) {
      const msg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "خطا در پردازش فایل";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg), "خطا");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ─── Confirm Import ───
  const handleConfirm = async () => {
    if (!preview) return;

    // ✅ فیلتر raw_rows بر اساس status
    const validRawRows = preview.raw_rows.filter((_, idx) => {
      const row = preview.rows[idx];
      return row?.status === "valid" || row?.status === "warning";
    });

    if (validRawRows.length === 0) {
      toast.warning("هیچ سطر معتبری برای import وجود ندارد", "توجه");
      return;
    }

    const ok = await confirm({
      title: "تأیید Import",
      message: `${validRawRows.length.toLocaleString("fa-IR")} سطر معتبر import می‌شود.\nآیا مطمئن هستید؟`,
      confirmText: "import کن",
      cancelText: "انصراف",
      variant: "primary",
    });
    if (!ok) return;

    try {
      const result = await confirmMutation.mutateAsync({
        rows: validRawRows,
        regionId: selectedRegionId ? Number(selectedRegionId) : null,
        sendSms,
      });

      setImportResult(result);
      setStep(4);
      toast.success(
        `${result.success_count.toLocaleString("fa-IR")} سطر با موفقیت پردازش شد`,
        "import موفق",
      );
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "خطا در import";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg), "خطا");
    }
  };

  // ─── Reset ───
  const handleReset = () => {
    setStep(1);
    setPreview(null);
    setImportResult(null);
    setSelectedRegionId("");
    setSendSms(false);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <StepIndicator current={step} />

      {/* ─── Step 1: دانلود Template ─── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet size={28} strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              دانلود Template
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              ابتدا فایل Template را دانلود کنید، آن را با داده‌های کشاورزان و
              مزارع پر کنید، سپس آپلود کنید.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="
                inline-flex items-center gap-2 px-5 py-2.5
                bg-primary-600 text-white rounded-lg
                text-sm font-semibold
                hover:bg-primary-700 transition-colors
              "
            >
              <Download size={15} />
              دانلود Template
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: آپلود ─── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center max-w-md mx-auto">
            <div
              className="
                border-2 border-dashed border-gray-300 rounded-2xl
                p-8 mb-4
                hover:border-primary-400 hover:bg-primary-50/30
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
              disabled={previewMutation.isPending}
              className="
                inline-flex items-center gap-2 px-5 py-2.5
                bg-primary-600 text-white rounded-lg
                text-sm font-semibold
                hover:bg-primary-700 transition-colors
                disabled:opacity-50
              "
            >
              {previewMutation.isPending ? (
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

            <button
              type="button"
              onClick={handleReset}
              className="block mx-auto mt-3 text-xs text-gray-500 hover:text-gray-700"
            >
              ← بازگشت
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Preview ─── */}
      {step === 3 && preview && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="text-[10px] text-gray-500 mb-0.5">کل سطرها</div>
              <div className="text-lg font-bold text-gray-900">
                {preview.total_rows.toLocaleString("fa-IR")}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3">
              <div className="text-[10px] text-emerald-600 mb-0.5">
                معتبر (جدید)
              </div>
              <div className="text-lg font-bold text-emerald-700">
                {preview.valid_rows.toLocaleString("fa-IR")}
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-3">
              <div className="text-[10px] text-amber-600 mb-0.5">
                هشدار (موجود)
              </div>
              <div className="text-lg font-bold text-amber-700">
                {preview.warning_rows.toLocaleString("fa-IR")}
              </div>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-3">
              <div className="text-[10px] text-red-600 mb-0.5">خطا</div>
              <div className="text-lg font-bold text-red-700">
                {preview.invalid_rows.toLocaleString("fa-IR")}
              </div>
            </div>
          </div>

          {/* Unknown headers */}
          {preview.unknown_headers?.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>ستون‌های ناشناخته:</strong>{" "}
                {preview.unknown_headers.join("، ")}
                <br />
                این ستون‌ها نادیده گرفته می‌شوند.
              </div>
            </div>
          )}

          {/* Row list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-800">
                پیش‌نمایش سطرها
              </span>
              <span className="text-[11px] text-gray-500">
                {preview.rows.length.toLocaleString("fa-IR")} سطر
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="border-b border-gray-200">
                    <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500 uppercase">
                      سطر
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500 uppercase">
                      نام
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500 uppercase">
                      کد ملی
                    </th>
                    <th className="text-right px-3 py-2 font-semibold text-[10px] text-gray-500 uppercase">
                      تلفن
                    </th>
                    <th className="text-center px-3 py-2 font-semibold text-[10px] text-gray-500 uppercase">
                      وضعیت
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        row.status === "invalid"
                          ? "bg-red-50/40"
                          : row.status === "warning"
                            ? "bg-amber-50/40"
                            : ""
                      }
                    >
                      <td className="px-3 py-2 text-gray-400">
                        {row.row_number}
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {row.farmer_name || "—"}
                      </td>
                      <td
                        className="px-3 py-2 font-mono text-gray-600"
                        dir="ltr"
                      >
                        {row.national_id || "—"}
                      </td>
                      <td
                        className="px-3 py-2 font-mono text-gray-600"
                        dir="ltr"
                      >
                        {row.phone_number || "—"}
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                منطقه‌ی پیش‌فرض (اختیاری)
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="
                  w-full px-3.5 py-2.5 rounded-lg border border-gray-300
                  text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                  outline-none cursor-pointer
                "
              >
                <option value="">— بدون منطقه —</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-gray-500">
                اگر انتخاب کنید، به همه‌ی رکوردهای جدید این منطقه اختصاص می‌یابد
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendSms}
                onChange={(e) => setSendSms(e.target.checked)}
                className="w-4 h-4 rounded accent-primary-600"
              />
              <span className="text-xs text-gray-700">
                ارسال پیامک دعوت برای کشاورزان جدید
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              ← بازگشت
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={
                confirmMutation.isPending ||
                preview.valid_rows + preview.warning_rows === 0
              }
              className="
                inline-flex items-center gap-2 px-5 py-2.5
                bg-primary-600 text-white rounded-lg
                text-sm font-semibold
                hover:bg-primary-700 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {confirmMutation.isPending ? (
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
        </>
      )}

      {/* ─── Step 4: نتیجه ─── */}
      {step === 4 && importResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center max-w-md mx-auto mb-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} strokeWidth={2} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Import کامل شد
            </h3>
            <p className="text-xs text-gray-500">
              {importResult.total_processed.toLocaleString("fa-IR")} سطر
              پردازش شد
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 text-center">
              <div className="text-[10px] text-emerald-600 mb-0.5">
                موفق
              </div>
              <div className="text-lg font-bold text-emerald-700">
                {importResult.success_count.toLocaleString("fa-IR")}
              </div>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
              <div className="text-[10px] text-red-600 mb-0.5">ناموفق</div>
              <div className="text-lg font-bold text-red-700">
                {importResult.failed_count.toLocaleString("fa-IR")}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 text-center">
              <div className="text-[10px] text-blue-600 mb-0.5">
                کشاورز جدید
              </div>
              <div className="text-lg font-bold text-blue-700">
                {importResult.created_farmers.toLocaleString("fa-IR")}
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-3 text-center">
              <div className="text-[10px] text-purple-600 mb-0.5">
                مزرعه ساخته‌شده
              </div>
              <div className="text-lg font-bold text-purple-700">
                {importResult.created_farms.toLocaleString("fa-IR")}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {importResult.warnings?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-800">
                  هشدارها (
                  {importResult.warnings.length.toLocaleString("fa-IR")})
                </span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {importResult.warnings.map((warn, i) => (
                  <div
                    key={i}
                    className="text-[11px] text-amber-700 bg-white rounded-md px-2 py-1.5"
                  >
                    <span className="font-bold">
                      سطر {warn.row_number}:
                    </span>{" "}
                    {warn.warning || warn.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {importResult.errors?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={13} className="text-red-600" />
                <span className="text-xs font-bold text-red-800">
                  خطاها (
                  {importResult.errors.length.toLocaleString("fa-IR")})
                </span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {importResult.errors.map((err, i) => (
                  <div
                    key={i}
                    className="text-[11px] text-red-700 bg-white rounded-md px-2 py-1.5"
                  >
                    <span className="font-bold">
                      سطر {err.row_number}:
                    </span>{" "}
                    {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              Import جدید
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportData;