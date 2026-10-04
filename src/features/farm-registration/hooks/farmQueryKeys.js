// src/features/farm-registration/hooks/farmQueryKeys.js

/**
 * Shared query keys and params for farms & farmers.
 *
 * ⚠️ مهم: API سقف page_size = 100 دارد.
 * برای analytics، از fetchAll* با pagination خودکار استفاده می‌شود.
 */

// For list views: MapViewPage, FarmPanel, DashboardTabs
export const FARM_LIST_QUERY_PARAMS = Object.freeze({
  page: 1,
  pageSize: 100,
  search: null,
});

// For analytics: از fetchAll استفاده می‌کند
export const FARM_ANALYTICS_QUERY_PARAMS = Object.freeze({
  page: 1,
  pageSize: 100,   // ← API max
  search: null,
});

// For farmer list views
export const FARMER_LIST_QUERY_PARAMS = Object.freeze({
  page: 1,
  pageSize: 100,
  search: null,
});

// For farmer analytics
export const FARMER_ANALYTICS_QUERY_PARAMS = Object.freeze({
  page: 1,
  pageSize: 100,   // ← API max
  search: null,
});

export const farmKeys = {
  all: ['farms'],
  lists: () => [...farmKeys.all, 'list'],
  list: (filters) => [...farmKeys.lists(), filters],
  details: () => [...farmKeys.all, 'detail'],
  detail: (id) => [...farmKeys.details(), id],
  // ✅ کلید جداگانه برای aggregation
  allFarms: () => [...farmKeys.all, 'all'],
};

export const farmerKeys = {
  all: ['farmers'],
  lists: () => [...farmerKeys.all, 'list'],
  list: (filters) => [...farmerKeys.lists(), filters],
  details: () => [...farmerKeys.all, 'detail'],
  detail: (id) => [...farmerKeys.details(), id],
  // ✅ کلید جداگانه برای aggregation
  allFarmers: () => [...farmerKeys.all, 'all'],
};

export const QUERY_STALE_TIME = {
  analytics: 10 * 60 * 1000,
  list: 2 * 60 * 1000,
  detail: 5 * 60 * 1000,
};

export const QUERY_GC_TIME = {
  default: 30 * 60 * 1000,
};