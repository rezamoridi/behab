// src/features/farm-registration/components/FarmImportExportBar.jsx
import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';

import { farmImportExportApi } from '../../../services/api/farmImportExportApi';
import { useToast } from '../../../shared/components/Toast/ToastProvider';

const FarmImportExportBar = ({
  onImportClick,
  filters = {},
  compact = false,
}) => {
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] =
    useState(false);

  // ── Export Excel ──
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await farmImportExportApi.export({
        regionId: filters.region_id ?? null,
        villageId: filters.village_id ?? null,
        crop: filters.crop ?? null,
        search: filters.search ?? null,
        includeInputs: true,
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `farms-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('خروجی Excel دانلود شد', 'موفق');
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در خروجی';
      toast.error(
        typeof msg === 'string' ? msg : JSON.stringify(msg),
        'خطا'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // ── دانلود Template ──
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const response =
        await farmImportExportApi.downloadTemplate();

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'farms-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Template دانلود شد', 'موفق');
    } catch (err) {
      toast.error('خطا در دانلود Template', 'خطا');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" dir="rtl">
      {/* Template */}
      <button
        type="button"
        onClick={handleDownloadTemplate}
        disabled={isDownloadingTemplate}
        className="
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-xs font-semibold text-slate-700
          bg-white hover:bg-gray-50
          border border-gray-200 hover:border-gray-300
          transition-colors cursor-pointer whitespace-nowrap
          disabled:opacity-50 disabled:cursor-wait
        "
        title="دانلود فایل نمونه"
      >
        {isDownloadingTemplate ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={13} />
        )}
        {!compact && <span>Template</span>}
      </button>

      {/* Import */}
      <button
        type="button"
        onClick={onImportClick}
        className="
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-xs font-semibold text-indigo-700
          bg-indigo-50 hover:bg-indigo-100
          border border-indigo-200 hover:border-indigo-300
          transition-colors cursor-pointer whitespace-nowrap
        "
        title="ورود گروهی از Excel"
      >
        <Upload size={13} />
        {!compact && <span>ورود</span>}
      </button>

      {/* Export */}
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-xs font-semibold text-emerald-700
          bg-emerald-50 hover:bg-emerald-100
          border border-emerald-200 hover:border-emerald-300
          transition-colors cursor-pointer whitespace-nowrap
          disabled:opacity-50 disabled:cursor-wait
        "
        title="خروجی Excel"
      >
        {isExporting ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Download size={13} />
        )}
        {!compact && <span>خروجی</span>}
      </button>
    </div>
  );
};

export default FarmImportExportBar;