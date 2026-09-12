// src/pages/DashboardPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  RefreshCw,
  Map as MapIcon,
  Plus,
  Wheat,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { fetchFarms } from '../services/api/farmApi';

// ============================================
// Farm Card
// ============================================
const FarmCard = ({ farm }) => {
  if (!farm) return null;

  const area = Number(farm.area_ha) || 0;

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
        <Wheat size={22} className="text-primary-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate">
          {farm.farmer_name || 'بدون نام'}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          شناسه: {farm.farm_id || '---'}
        </div>
        <div className="text-xs text-primary-700 mt-0.5">
          📐 {area.toFixed(2)} هکتار
        </div>
      </div>

      {farm.crop && (
        <div className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium whitespace-nowrap">
          {farm.crop}
        </div>
      )}
    </div>
  );
};

// ============================================
// Farm List Skeleton
// ============================================
const FarmListSkeleton = ({ count = 5 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-pulse"
      >
        <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 w-3/5 rounded bg-gray-200" />
          <div className="h-3 w-2/5 rounded bg-gray-200" />
          <div className="h-3 w-1/3 rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// Dashboard Page
// ============================================
const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch farms with TanStack Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['farms', { page: 1, pageSize: 20, search: debouncedSearch }],
    queryFn: () =>
      fetchFarms({
        page: 1,
        pageSize: 20,
        search: debouncedSearch || null,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const farms = useMemo(() => {
    if (!data) return [];
    return data.data || data.items || data.farms || [];
  }, [data]);

  const totalFarms = useMemo(() => {
    if (!data) return 0;
    return data.total || data.total_count || farms.length;
  }, [data, farms]);

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6 font-vazir" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wheat className="text-primary-600" />
          مزارع
        </h1>

        <div className="flex gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجوی مزرعه..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                pr-9 pl-3 py-2 w-52
                border border-gray-200 rounded-lg
                text-sm font-vazir
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                outline-none transition-all duration-200
              "
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="
              px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
              text-sm font-medium flex items-center gap-2
              hover:bg-gray-300 transition-colors duration-200
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={16}
              className={isFetching ? 'animate-spin' : ''}
            />
            بروزرسانی
          </button>

          {/* Map */}
          <button
            onClick={() => navigate('/map')}
            className="
              px-4 py-2 bg-blue-600 text-white rounded-lg
              text-sm font-medium flex items-center gap-2
              hover:bg-blue-700 transition-colors duration-200
            "
          >
            <MapIcon size={16} />
            رفتن به نقشه
          </button>

          {/* Create */}
          <button
            onClick={() => navigate('/map')}
            className="
              px-4 py-2 bg-primary-600 text-white rounded-lg
              text-sm font-medium flex items-center gap-2
              hover:bg-primary-700 transition-colors duration-200
            "
          >
            <Plus size={16} />
            ثبت مزرعه جدید
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {isLoading && <FarmListSkeleton count={5} />}

        {isError && (
          <div className="p-6 text-center bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle
              size={32}
              className="mx-auto text-red-600 mb-2"
            />
            <div className="text-red-700 font-medium mb-3">
              {error?.message || 'خطا در دریافت لیست مزارع'}
            </div>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {!isLoading && !isError && farms.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-3">🌾</div>
            <div className="text-gray-500 text-sm">
              {debouncedSearch
                ? 'هیچ مزرعه‌ای با این مشخصات یافت نشد'
                : 'هیچ مزرعه‌ای ثبت نشده است'}
            </div>
          </div>
        )}

        {!isLoading &&
          !isError &&
          farms.map((farm) => (
            <FarmCard key={farm.farm_id || farm.id} farm={farm} />
          ))}
      </div>

      {/* Footer */}
      {!isLoading && !isError && farms.length > 0 && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-500 text-center">
          مجموع: {totalFarms} مزرعه
        </div>
      )}
    </div>
  );
};

export default DashboardPage;