// src/features/sentinel/components/SentinelSettingsTab.jsx
//
// نمایش و تنظیمات نمایش asset انتخاب‌شده.
// انتخاب asset در SentinelPage انجام می‌شود.
// تاریخ/شاخص آزاد اینجا وجود ندارد — assetId خودش analysis و
// acquisition را تعیین کرده است.
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

const SentinelSettingsTab = ({
  visible,
  assetId,
  bounds,
  opacity,
  analysis,
  onVisibleChange,
  onClear,
  onOpacityChange,
}) => {
  const isActive = !!visible && !!assetId;

  return (
    <div className="p-3 space-y-3" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 18,
              height: 18,
              display: 'inline-block',
              color: '#059669',
            }}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#059669"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
          </span>
          <span className="text-[12px] font-bold text-gray-800">
            Sentinel — نمایش تصویر
          </span>
        </div>
      </div>

      {/* فعال/غیرفعال */}
      <label
        className={`flex items-center justify-between gap-2 px-1 py-2 border rounded-lg ${
          assetId
            ? 'cursor-pointer bg-gray-50 border-gray-200'
            : 'cursor-not-allowed bg-gray-100 border-gray-200 opacity-60'
        }`}
      >
        <span className="text-[12px] font-bold text-gray-800">
          فعال‌سازی لایه
        </span>
        <input
          type="checkbox"
          checked={!!visible}
          onChange={(e) => onVisibleChange?.(e.target.checked)}
          disabled={!assetId}
          className="w-4 h-4 accent-emerald-600"
        />
      </label>

      {/* Asset info */}
      {assetId ? (
        <div className="bg-white border border-emerald-200 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800">
              تصویر انتخاب‌شده
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              #{assetId}
            </span>
          </div>

          {analysis && (
            <div className="text-[10px] text-gray-700">
              شاخص:{' '}
              <span className="font-bold" dir="ltr">
                {analysis}
              </span>
            </div>
          )}

          {Array.isArray(bounds) && bounds.length === 4 && (
            <div
              className="text-[9px] text-gray-500 font-mono leading-relaxed"
              dir="ltr"
            >
              [{bounds.map((b) => Number(b).toFixed(4)).join(', ')}]
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <Link
              to="/sentinel"
              className="text-[10px] text-emerald-700 hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink size={10} />
              انتخاب تصویر دیگر
            </Link>
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] text-red-600 hover:underline"
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 leading-relaxed">
          برای نمایش، از صفحه{' '}
          <Link to="/sentinel" className="underline font-bold">
            تصاویر ماهواره‌ای
          </Link>{' '}
          یک تصویر انتخاب کنید.
        </div>
      )}

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-gray-700">
            شفافیت لایه
          </span>
          <span
            className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
            dir="ltr"
          >
            {Math.round((opacity || 0.7) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.05"
          value={opacity ?? 0.7}
          onChange={(e) => onOpacityChange?.(Number(e.target.value))}
          disabled={!isActive}
          className="w-full accent-emerald-600 cursor-pointer disabled:opacity-60"
          dir="ltr"
        />
      </div>

      {/* وضعیت */}
      {assetId && !visible && (
        <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
          تصویر انتخاب شده ولی لایه غیرفعال است.
        </div>
      )}

      {/* Attribution */}
      <div className="text-[9px] leading-relaxed text-gray-400 border-t border-gray-200 pt-2">
        Contains modified Copernicus Sentinel data (CDSE).
      </div>
    </div>
  );
};

export default SentinelSettingsTab;