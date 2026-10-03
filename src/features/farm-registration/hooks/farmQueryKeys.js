// src/features/farm-registration/hooks/farmQueryKeys.js

/**
 * Shared query keys and params for farms & farmers.
 *
 * ✅ IMPORTANT: All list readers AND mutations MUST use these
 * constants — otherwise cache writes from mutations miss the
 * keys that readers use, breaking optimistic updates.
 */

// ─────────────────────────────────────────────
// ✅ Query params — single source of truth
// ─────────────────────────────────────────────

// For list views: MapViewPage, FarmPanel, DashboardTabs
export const FARM_LIST_QUERY_PARAMS = Object.freeze({
  page: 1,
  pageSize: 100,
  search: null,
});

// For analytics: needs all farms (dashboard aggregations)
export const FARM_ANALYTICS_QUERY_PARAMS = Object.freeze({
  page: 1,
  pageSize: 500,
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
  pageSize: 500,
  search: null,
});

// ─────────────────────────────────────────────
// ✅ Query keys
// ─────────────────────────────────────────────
export const farmKeys = {
  all: ['farms'],
  lists: () => [...farmKeys.all, 'list'],
  list: (filters) => [...farmKeys.lists(), filters],
  details: () => [...farmKeys.all, 'detail'],
  detail: (id) => [...farmKeys.details(), id],
};

export const farmerKeys = {
  all: ['farmers'],
  lists: () => [...farmerKeys.all, 'list'],
  list: (filters) => [...farmerKeys.lists(), filters],
  details: () => [...farmerKeys.all, 'detail'],
  detail: (id) => [...farmerKeys.details(), id],
};