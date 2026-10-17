// src/features/lands/hooks/useLands.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchFarms } from '../../../services/api/farmApi';
import {
  farmKeys,
  QUERY_STALE_TIME,
  QUERY_GC_TIME,
} from '../../farm-registration/hooks/farmQueryKeys';
import { LANDS_PAGE_SIZE } from '../constants';

// ═══════════════════════════════════════════════════════════
// useLands — لیست مزارع با فیلترهای client-side
//
// چرا client-side؟
//   API فقط page/page_size/search می‌گیرد.
//   فیلتر محصول/منطقه/روستا/بدون‌مالک باید client-side باشد.
// ═══════════════════════════════════════════════════════════
export const useLands = ({
  page = 1,
  search = '',
  sortBy = 'newest',
  missingFilter = 'either',
  cropFilter = '',
  regionFilter = '',
  villageFilter = '',
} = {}) => {
  const query = useQuery({
    queryKey: farmKeys.list({
      page,
      pageSize: LANDS_PAGE_SIZE,
      search: search || null,
    }),
    queryFn: () =>
      fetchFarms({
        page,
        pageSize: LANDS_PAGE_SIZE,
        search: search || null,
      }),
    staleTime: QUERY_STALE_TIME.list,
    gcTime: QUERY_GC_TIME.default,
    placeholderData: (prev) => prev,
  });

  // ✅ نرمال‌سازی: بک‌اند گاهی `farms`، گاهی `items` برمی‌گرداند
  const rawFarms = useMemo(
    () => query.data?.farms || query.data?.items || [],
    [query.data],
  );

  const totalRaw = useMemo(
    () => query.data?.total || rawFarms.length,
    [query.data, rawFarms],
  );

  // ═══════════════════════════════════════════════════════════
  // فیلترهای client-side + sort
  // ═══════════════════════════════════════════════════════════
  const farms = useMemo(() => {
    let list = rawFarms;

    // ─── missing filter ───
    if (missingFilter === 'region') {
      list = list.filter((f) => !f.region_id);
    } else if (missingFilter === 'owner') {
      list = list.filter(
        (f) => !f.current_owner_id && !f.created_by_user_id,
      );
    } else if (missingFilter === 'both') {
      list = list.filter(
        (f) =>
          !f.region_id &&
          !f.current_owner_id &&
          !f.created_by_user_id,
      );
    }

    // ─── crop filter ───
    if (cropFilter) {
      list = list.filter((f) => f.crop === cropFilter);
    }

    // ─── region filter ───
    if (regionFilter) {
      list = list.filter(
        (f) => String(f.region_id) === String(regionFilter),
      );
    }

    // ─── village filter ───
    if (villageFilter) {
      list = list.filter(
        (f) =>
          String(f.village_id) === String(villageFilter) ||
          f.village === villageFilter,
      );
    }

    // ─── sort ───
    const sorted = [...list];
    if (sortBy === 'newest') {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
    } else if (sortBy === 'oldest') {
      sorted.sort(
        (a, b) =>
          new Date(a.created_at || 0) - new Date(b.created_at || 0),
      );
    } else if (sortBy === 'area_desc') {
      sorted.sort(
        (a, b) => (Number(b.area_ha) || 0) - (Number(a.area_ha) || 0),
      );
    } else if (sortBy === 'area_asc') {
      sorted.sort(
        (a, b) => (Number(a.area_ha) || 0) - (Number(b.area_ha) || 0),
      );
    }

    return sorted;
  }, [
    rawFarms,
    missingFilter,
    cropFilter,
    regionFilter,
    villageFilter,
    sortBy,
  ]);

  // ═══════════════════════════════════════════════════════════
  // آمار
  //
  // از rawFarms استفاده می‌شود (نه farms) — چون آمار باید
  // کل زمین‌ها را نشان دهد، نه فقط فیلترشده‌ها.
  // ═══════════════════════════════════════════════════════════
  const stats = useMemo(() => {
    let totalArea = 0;
    let withCrop = 0;
    let withFarmer = 0;
    let missingRegion = 0;
    let missingOwner = 0;
    const regions = new Set();
    const villages = new Set();

    rawFarms.forEach((f) => {
      totalArea += Number(f.area_ha) || 0;
      if (f.crop) withCrop++;
      if (f.farmer_id) withFarmer++;
      if (f.region_id) regions.add(f.region_id);
      else missingRegion++;
      if (f.current_owner_id || f.created_by_user_id) {
        // owner هست
      } else {
        missingOwner++;
      }
      if (f.village) villages.add(f.village);
    });

    return {
      total: rawFarms.length,
      totalArea,
      withCrop,
      withFarmer,
      regions: regions.size,
      villages: villages.size,
      missingRegion,
      missingOwner,
      filtered: farms.length,
    };
  }, [rawFarms, farms]);

  return {
    // raw (برای آمار)
    rawFarms,
    totalRaw,

    // filtered
    farms,
    total: farms.length,

    // stats
    stats,

    // query state
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// ═══════════════════════════════════════════════════════════
// useLandsFilters — state مدیریت فیلترها + debounce
// ═══════════════════════════════════════════════════════════
export const useLandsFilters = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [missingFilter, setMissingFilter] = useState('either');
  const [cropFilter, setCropFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [villageFilter, setVillageFilter] = useState('');

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [
    missingFilter,
    cropFilter,
    regionFilter,
    villageFilter,
    sortBy,
  ]);

  const resetFilters = useCallback(() => {
    setPage(1);
    setSearch('');
    setDebouncedSearch('');
    setSortBy('newest');
    setMissingFilter('either');
    setCropFilter('');
    setRegionFilter('');
    setVillageFilter('');
  }, []);

  const hasActiveFilters =
    !!debouncedSearch ||
    missingFilter !== 'either' ||
    !!cropFilter ||
    !!regionFilter ||
    !!villageFilter;

  return {
    page,
    setPage,
    search,
    setSearch,
    debouncedSearch,
    setDebouncedSearch,
    sortBy,
    setSortBy,
    missingFilter,
    setMissingFilter,
    cropFilter,
    setCropFilter,
    regionFilter,
    setRegionFilter,
    villageFilter,
    setVillageFilter,
    hasActiveFilters,
    resetFilters,
  };
};

export default useLands;