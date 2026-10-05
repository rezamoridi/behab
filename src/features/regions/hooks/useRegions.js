// src/features/regions/hooks/useRegions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regionApi } from '../../../services/api/regionApi';

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
export const regionKeys = {
  all: ['regions'],
  lists: () => [...regionKeys.all, 'list'],
  list: (params) => [...regionKeys.lists(), params],
  my: () => [...regionKeys.all, 'my'],
  detail: (id) => [...regionKeys.all, 'detail', id],
  stats: (id) => [...regionKeys.all, 'stats', id],           // ✅ جدید
  compare: (params) => [...regionKeys.all, 'compare', params], // ✅ جدید
};

const REGION_STALE_TIME = 2 * 60 * 1000; // 2 min
const GC_TIME = 30 * 60 * 1000;

// ═══════════════════════════════════════════════════════════
// Queries
// ═══════════════════════════════════════════════════════════
export const useRegionsQuery = ({ activeOnly = false, enabled = true } = {}) => {
  return useQuery({
    queryKey: regionKeys.list({ activeOnly }),
    queryFn: () => regionApi.list({ activeOnly }),
    enabled,
    staleTime: REGION_STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useMyRegionsQuery = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: regionKeys.my(),
    queryFn: () => regionApi.my(),
    enabled,
    staleTime: REGION_STALE_TIME,
    gcTime: GC_TIME,
  });
};

export const useRegionQuery = (regionId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: regionKeys.detail(regionId),
    queryFn: () => regionApi.get(regionId),
    enabled: enabled && !!regionId,
    staleTime: REGION_STALE_TIME,
    gcTime: GC_TIME,
  });
};

// ═══════════════════════════════════════════════════════════
// ✅ جدید (فاز ۱۲): Stats Query
// ═══════════════════════════════════════════════════════════
export const useRegionStatsQuery = (
  regionId,
  { enabled = true } = {},
) => {
  return useQuery({
    queryKey: regionKeys.stats(regionId),
    queryFn: () => regionApi.getStats(regionId),
    enabled: enabled && !!regionId,
    staleTime: REGION_STALE_TIME,
    gcTime: GC_TIME,
  });
};

// ═══════════════════════════════════════════════════════════
// ✅ جدید (فاز ۱۲): Compare Query
// ═══════════════════════════════════════════════════════════
export const useRegionsCompareQuery = ({
  regionIds = null,
  activeOnly = false,
  enabled = true,
} = {}) => {
  const key = { regionIds, activeOnly };
  return useQuery({
    queryKey: regionKeys.compare(key),
    queryFn: () => regionApi.compare({ regionIds, activeOnly }),
    enabled,
    staleTime: REGION_STALE_TIME,
    gcTime: GC_TIME,
  });
};

// ═══════════════════════════════════════════════════════════
// Mutations
// ═══════════════════════════════════════════════════════════
export const useCreateRegionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => regionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionKeys.my() });
    },
  });
};

export const useUpdateRegionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => regionApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionKeys.my() });
      queryClient.invalidateQueries({
        queryKey: regionKeys.detail(variables.id),
      });
      // ✅ stats هم invalidate
      queryClient.invalidateQueries({
        queryKey: regionKeys.stats(variables.id),
      });
    },
  });
};

export const useDeleteRegionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => regionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionKeys.my() });
    },
  });
};

export const useAssignRegionsToUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, regionIds }) =>
      regionApi.assignRegionsToUser(userId, regionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
};

// ═══════════════════════════════════════════════════════════
// ✅ فاز ۹: ذخیره مرز منطقه از روی نقشه
// ═══════════════════════════════════════════════════════════
export const useUpdateRegionGeometryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ regionId, geojson }) =>
      regionApi.update(regionId, { geojson }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionKeys.my() });
      queryClient.invalidateQueries({
        queryKey: regionKeys.detail(variables.regionId),
      });
      queryClient.invalidateQueries({
        queryKey: regionKeys.stats(variables.regionId),
      });
    },
  });
};

// ═══════════════════════════════════════════════════════════
// Combined Hook
// ═══════════════════════════════════════════════════════════
export const useRegions = () => {
  const listQuery = useRegionsQuery({});
  const myQuery = useMyRegionsQuery({});

  const createMutation = useCreateRegionMutation();
  const updateMutation = useUpdateRegionMutation();
  const deleteMutation = useDeleteRegionMutation();

  return {
    regions: listQuery.data || [],
    myRegions: myQuery.data || [],
    isLoading: listQuery.isLoading || myQuery.isLoading,
    isFetching: listQuery.isFetching || myQuery.isFetching,

    createRegion: (data) => createMutation.mutateAsync(data),
    updateRegion: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteRegion: (id) => deleteMutation.mutateAsync(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useRegions;