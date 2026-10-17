// src/features/lands/components/LandsFiltersBar.jsx
import {
  Search,
  X,
  FileDown,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { SORT_OPTIONS, FILTER_OPTIONS } from '../constants';
import { useActiveCrops } from '../../settings/hooks/useActiveCrops';
import { useRegionsQuery } from '../../regions/hooks/useRegions';
import { useVillagesQuery } from '../../villages/hooks/useVillages';

const LandsFiltersBar = ({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  missingFilter,
  onMissingFilterChange,
  cropFilter,
  onCropFilterChange,
  regionFilter,
  onRegionFilterChange,
  villageFilter,
  onVillageFilterChange,
  onClearFilters,
  onExport,
  isExporting,
  onRefresh,
  isFetching,
  hasActiveFilters,
}) => {
  const { crops: dbCrops = [] } = useActiveCrops();
  const { data: regions = [] } = useRegionsQuery({ activeOnly: true });
  const { data: villages = [] } = useVillagesQuery({ activeOnly: true });

  return (
    <div
      className="flex flex-col md:flex-row md:items-center gap-2"
      dir="rtl"
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="جستجوی کشاورز یا کد ملی..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pr-9 pl-8 py-2 rounded-lg
            border border-gray-200 text-sm bg-white
            focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
          "
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              p-1 rounded-md text-gray-400
              hover:bg-gray-100 hover:text-gray-600
            "
            aria-label="پاک کردن جستجو"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="
          px-3 py-2 rounded-lg border border-gray-200
          text-sm bg-white cursor-pointer
          focus:border-primary-500 focus:ring-2 focus:ring-primary-100
          outline-none transition-all
        "
        title="مرتب‌سازی"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Missing (بدون منطقه/مالک) */}
      <select
        value={missingFilter}
        onChange={(e) => onMissingFilterChange(e.target.value)}
        className="
          px-3 py-2 rounded-lg border border-gray-200
          text-sm bg-white cursor-pointer
          focus:border-primary-500 focus:ring-2 focus:ring-primary-100
          outline-none transition-all
        "
        title="وضعیت منطقه/مالک"
      >
        {FILTER_OPTIONS.missing.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.value === 'either' ? 'وضعیت: همه' : opt.label}
          </option>
        ))}
      </select>

      {/* Crop */}
      {dbCrops.length > 0 && (
        <select
          value={cropFilter}
          onChange={(e) => onCropFilterChange(e.target.value)}
          className="
            px-3 py-2 rounded-lg border border-gray-200
            text-sm bg-white cursor-pointer
            focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
          "
          title="محصول"
        >
          <option value="">محصول: همه</option>
          {dbCrops.map((crop) => (
            <option key={crop.id} value={crop.name}>
              {crop.name}
            </option>
          ))}
        </select>
      )}

      {/* Region */}
      {regions.length > 0 && (
        <select
          value={regionFilter}
          onChange={(e) => onRegionFilterChange(e.target.value)}
          className="
            px-3 py-2 rounded-lg border border-gray-200
            text-sm bg-white cursor-pointer
            focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
          "
          title="منطقه"
        >
          <option value="">منطقه: همه</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      )}

      {/* Village */}
      {villages.length > 0 && (
        <select
          value={villageFilter}
          onChange={(e) => onVillageFilterChange(e.target.value)}
          className="
            px-3 py-2 rounded-lg border border-gray-200
            text-sm bg-white cursor-pointer
            focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            outline-none transition-all
          "
          title="روستا"
        >
          <option value="">روستا: همه</option>
          {villages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="
            flex items-center gap-1.5 px-3 py-2 rounded-lg
            text-xs font-semibold text-red-600
            bg-red-50 hover:bg-red-100
            border border-red-200
            transition-colors cursor-pointer whitespace-nowrap
          "
          title="پاک کردن فیلترها"
        >
          <X size={12} />
          <span>پاک کردن</span>
        </button>
      )}

      {/* Refresh */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        className="
          p-2 rounded-lg bg-white border border-gray-200
          text-gray-500 hover:bg-gray-50 hover:text-gray-700
          transition-colors disabled:opacity-50
        "
        title="بروزرسانی"
      >
        <RefreshCw
          size={14}
          className={isFetching ? 'animate-spin' : ''}
        />
      </button>

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-xs font-semibold text-emerald-700
          bg-emerald-50 hover:bg-emerald-100
          border border-emerald-200
          transition-colors cursor-pointer whitespace-nowrap
          disabled:opacity-50 disabled:cursor-wait
        "
        title="خروجی Excel"
      >
        {isExporting ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileDown size={13} />
        )}
        <span>خروجی</span>
      </button>
    </div>
  );
};

export default LandsFiltersBar;