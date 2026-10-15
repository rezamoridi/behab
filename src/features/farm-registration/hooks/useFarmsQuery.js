// src/features/farm-registration/hooks/useFarmsQuery.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchFarms,
  fetchAllFarms,
  fetchFarmById,
  fetchReferenceLayer,
} from '../../../services/api/farmApi';
import { farmerApi } from '../../../services/api/farmerApi';
import {
  farmKeys,
  farmerKeys,
  QUERY_STALE_TIME,
  QUERY_GC_TIME,
} from './farmQueryKeys';

export { farmKeys, farmerKeys } from './farmQueryKeys';

// ═══════════════════════════════════════════════════════════
// Farms — list (paginated)
// ═══════════════════════════════════════════════════════════
export const useFarmsQuery = ({
  page = 1,
  pageSize = 20,
  search = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: farmKeys.list({
      page,
      pageSize,
      search,
    }),
    queryFn: () =>
      fetchFarms({
        page,
        pageSize,
        search,
      }),
    enabled,
    staleTime: QUERY_STALE_TIME.analytics,
    gcTime: QUERY_GC_TIME.default,
    placeholderData: (prev) => prev,
  });
};

// ═══════════════════════════════════════════════════════════
// Farms — ALL (auto-paginated برای analytics)
// ═══════════════════════════════════════════════════════════
export const useAllFarmsQuery = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: farmKeys.allFarms(),
    queryFn: () =>
      fetchAllFarms({
        maxItems: 2000,
      }),
    enabled,
    staleTime: QUERY_STALE_TIME.analytics,
    gcTime: QUERY_GC_TIME.default,
  });
};

// ═══════════════════════════════════════════════════════════
// Farm — detail
// ═══════════════════════════════════════════════════════════
export const useFarmQuery = (farmId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: farmKeys.detail(farmId),
    queryFn: () => fetchFarmById(farmId),
    enabled: enabled && !!farmId,
    staleTime: QUERY_STALE_TIME.detail,
    gcTime: QUERY_GC_TIME.default,
  });
};

// ═══════════════════════════════════════════════════════════
// Reference Layer — مزارع دیگران (کم‌اطلاعات)
// ═══════════════════════════════════════════════════════════
export const useReferenceLayerQuery = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: ['farms', 'reference-layer'],
    queryFn: () => fetchReferenceLayer(),
    enabled,
    staleTime: QUERY_STALE_TIME.analytics,
    gcTime: QUERY_GC_TIME.default,
  });
};

// ═══════════════════════════════════════════════════════════
// Farmers — list
// ═══════════════════════════════════════════════════════════
export const useFarmersQuery = ({
  page = 1,
  pageSize = 100,
  search = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: farmerKeys.list({
      page,
      pageSize,
      search,
    }),
    queryFn: () =>
      farmerApi.list({
        page,
        pageSize,
        search,
      }),
    enabled,
    staleTime: QUERY_STALE_TIME.analytics,
    gcTime: QUERY_GC_TIME.default,
    placeholderData: (prev) => prev,
  });
};

// ═══════════════════════════════════════════════════════════
// Farmers — ALL (auto-paginated)
// ═══════════════════════════════════════════════════════════
export const useAllFarmersQuery = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: farmerKeys.allFarmers(),
    queryFn: () =>
      farmerApi.listAll({
        maxItems: 2000,
      }),
    enabled,
    staleTime: QUERY_STALE_TIME.analytics,
    gcTime: QUERY_GC_TIME.default,
  });
};

// ═══════════════════════════════════════════════════════════
// Farmer — detail
// ═══════════════════════════════════════════════════════════
export const useFarmerQuery = (
  farmerId,
  { enabled = true } = {},
) => {
  return useQuery({
    queryKey: farmerKeys.detail(farmerId),
    queryFn: () => farmerApi.get(farmerId),
    enabled: enabled && !!farmerId,
    staleTime: QUERY_STALE_TIME.detail,
    gcTime: QUERY_GC_TIME.default,
  });
};

// ═══════════════════════════════════════════════════════════
// ✅ Query Client Helpers
//
// ⚠️ نکته: invalidateFarms از partial matching استفاده می‌کند،
// پس همه‌ی queryهای ['farms', 'list', {...}] invalidate می‌شوند،
// صرف‌نظر از پارامترها.
// ═══════════════════════════════════════════════════════════
export const useFarmQueryClient = () => {
  const queryClient = useQueryClient();

  return {
    invalidateFarms: () =>
      queryClient.invalidateQueries({
        queryKey: farmKeys.lists(),
        refetchType: 'active',
      }),

    invalidateFarm: (id) =>
      queryClient.invalidateQueries({
        queryKey: farmKeys.detail(id),
        refetchType: 'active',
      }),

    invalidateAll: () =>
      queryClient.invalidateQueries({
        queryKey: farmKeys.all,
        refetchType: 'active',
      }),

    invalidateReferenceLayer: () =>
      queryClient.invalidateQueries({
        queryKey: ['farms', 'reference-layer'],
        refetchType: 'active',
      }),

    setFarmData: (id, data) =>
      queryClient.setQueryData(farmKeys.detail(id), data),

    invalidateFarmers: () =>
      queryClient.invalidateQueries({
        queryKey: farmerKeys.lists(),
        refetchType: 'active',
      }),

    invalidateFarmer: (id) =>
      queryClient.invalidateQueries({
        queryKey: farmerKeys.detail(id),
        refetchType: 'active',
      }),
  };
};