// src/features/conversations/components/SmsLogFilters.jsx
import { Search, X, Filter, FileDown, Loader2 } from 'lucide-react';
import {
  KIND_OPTIONS,
  STATUS_OPTIONS,
} from '../constants';

const SmsLogFilters = ({
  search,
  onSearchChange,
  kind,
  onKindChange,
  status,
  onStatusChange,
  onExport,
  isExporting,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="جستجوی شماره یا متن..."
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

      {/* Kind filter */}
      <select
        value={kind}
        onChange={(e) => onKindChange(e.target.value)}
        className="
          px-3 py-2 rounded-lg border border-gray-200
          text-sm bg-white cursor-pointer
          focus:border-primary-500 focus:ring-2 focus:ring-primary-100
          outline-none transition-all
        "
      >
        {KIND_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label === 'همه' ? 'نوع: همه' : opt.label}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="
          px-3 py-2 rounded-lg border border-gray-200
          text-sm bg-white cursor-pointer
          focus:border-primary-500 focus:ring-2 focus:ring-primary-100
          outline-none transition-all
        "
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.value === '' ? 'وضعیت: همه' : opt.label}
          </option>
        ))}
      </select>

      {/* Clear filters */}
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

      {/* Export */}
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          text-xs font-semibold text-sky-700
          bg-sky-50 hover:bg-sky-100
          border border-sky-200
          transition-colors cursor-pointer whitespace-nowrap
          disabled:opacity-50 disabled:cursor-wait
        "
        title="خروجی CSV"
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

export default SmsLogFilters;