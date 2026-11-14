// src/features/sentinel/components/SentinelResults.jsx
import { useState } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';

const Thumbnail = ({ src }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <ImageIcon size={20} className="text-slate-300" strokeWidth={2.2} />
      </div>
    );
  }
  return (
    <img
      src={src} alt="preview"
      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
      onError={() => setError(true)}
    />
  );
};

const SentinelResults = ({ items = [], selectedId, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <ImageIcon size={32} className="text-slate-300 mx-auto mb-2" />
        <div className="text-sm font-bold text-slate-600">نتیجه‌ای یافت نشد</div>
        <div className="text-xs text-slate-400 mt-1">محدوده و تاریخ را تغییر دهید.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      {items.map((item) => {
        const isSelected = selectedId === item.provider_product_id;
        return (
          <button
            key={item.provider_product_id}
            type="button"
            onClick={() => onSelect?.(item)}
            className={`
              w-full flex items-center gap-3 p-2.5 rounded-lg border text-right transition-all
              ${isSelected
                ? 'bg-primary-50 border-primary-400 shadow-sm ring-1 ring-primary-300'
                : 'bg-white border-slate-200 hover:border-primary-300 hover:bg-primary-50/30'}
            `}
          >
            <Thumbnail src={item.thumbnail_url} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-xs font-bold ${isSelected ? 'text-primary-900' : 'text-slate-800'}`}>
                  {item.acquisition_at?.slice(0, 10) || '—'}
                </span>
                {item.cloud_cover != null && (
                  <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    ابر: {item.cloud_cover.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-500 font-mono truncate" dir="ltr">
                {item.provider_product_id}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SentinelResults;