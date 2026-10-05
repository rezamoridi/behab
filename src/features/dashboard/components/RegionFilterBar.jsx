// src/features/dashboard/components/RegionFilterBar.jsx
import { Layers, X, Loader2 } from 'lucide-react';
import { useRegionsQuery } from '../../regions/hooks/useRegions';

const RegionFilterBar = ({
  selectedRegionId,
  onRegionChange,
  onClear,
  isLoading = false,
}) => {
  const { data: regions = [], isLoading: regionsLoading } = useRegionsQuery({
    activeOnly: true,
  });

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);
  const hasFilter = selectedRegionId != null;

  return (
    <div
      className="
        flex items-center gap-3 flex-wrap
        px-4 py-3 rounded-2xl
        bg-white/60 backdrop-blur-xl
        border border-white/70
        shadow-[0_4px_20px_rgba(31,38,135,0.06)]
        transition-colors
        ${hasFilter ? 'ring-2 ring-purple-300/60' : ''}
      "
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            transition-colors
            ${
              hasFilter
                ? 'bg-purple-500/20 text-purple-700 border border-purple-300/40'
                : 'bg-gray-100 text-gray-500'
            }
          `}
        >
          <Layers size={14} strokeWidth={2.4} />
        </div>
        <span className="text-xs font-bold text-slate-700">
          فیلتر منطقه
        </span>
      </div>

      <div className="flex-1 min-w-[220px] relative">
        <select
          value={selectedRegionId ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            onRegionChange(val === '' ? null : Number(val));
          }}
          disabled={regionsLoading || isLoading}
          className={`
            w-full px-3.5 py-2 rounded-xl text-sm font-medium
            border transition-all cursor-pointer
            outline-none appearance-none
            ${
              hasFilter
                ? 'bg-purple-50 border-purple-300 text-purple-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                : 'bg-white border-gray-200 text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
            }
            ${regionsLoading || isLoading ? 'opacity-60 cursor-wait' : ''}
          `}
        >
          <option value="">— همه مناطق —</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
              {region.user_count > 0
                ? ` (${region.user_count.toLocaleString('fa-IR')} مسئول)`
                : ''}
            </option>
          ))}
        </select>

        {/* آیکون dropdown سفارشی */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 size={14} className="text-purple-500 animate-spin" />
          ) : (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={hasFilter ? 'text-purple-600' : 'text-gray-400'}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
      </div>

      {hasFilter && (
        <>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200">
            <span className="text-[10px] text-purple-500">فعال:</span>
            <span className="text-xs font-bold text-purple-800">
              {selectedRegion?.name || '—'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClear}
            disabled={isLoading}
            className="
              flex items-center gap-1.5
              px-3 py-2 rounded-xl
              text-xs font-bold text-purple-700
              bg-purple-50 hover:bg-purple-100
              border border-purple-300/60 hover:border-purple-400
              transition-colors cursor-pointer
              disabled:opacity-50 disabled:cursor-wait
            "
            title="پاک کردن فیلتر"
          >
            <X size={12} />
            <span>پاک کردن</span>
          </button>
        </>
      )}
    </div>
  );
};

export default RegionFilterBar;