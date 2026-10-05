// src/features/admin/hooks/useOrphans.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../services/api/adminApi';

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
export const orphanKeys = {
  all: ['orphans'],
  summary: () => [...orphanKeys.all, 'summary'],
  farms: (params) => [...orphanKeys.all, 'farms', params],
  farmers: (params) => [...orphanKeys.all, 'farmers', params],

  // ✅ جدید — بخش Trash
  trash: () => [...orphanKeys.all, 'trash'],
  deletedFarms: (params) => [...orphanKeys.all, 'deleted-farms', params],
  deletedFarmers: (params) => [
    ...orphanKeys.all,
    'deleted-farmers',
    params,
  ],
};

const STALE_TIME = 60 * 1000;

// ═══════════════════════════════════════════════════════════
// Queries — Orphans
// ═══════════════════════════════════════════════════════════
export const useOrphansSummaryQuery = () => {
  return useQuery({
    queryKey: orphanKeys.summary(),
    queryFn: () => adminApi.getSummary(),
    staleTime: STALE_TIME,
  });
};

export const useOrphanFarmsQuery = ({
  page = 1,
  pageSize = 20,
  search = null,
  missing = 'either',
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: orphanKeys.farms({ page, pageSize, search, missing }),
    queryFn: () =>
      adminApi.listOrphanFarms({ page, pageSize, search, missing }),
    enabled,
    staleTime: STALE_TIME,
    placeholderData: (prev) => prev,
  });
};

export const useOrphanFarmersQuery = ({
  page = 1,
  pageSize = 20,
  search = null,
  missing = 'either',
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: orphanKeys.farmers({ page, pageSize, search, missing }),
    queryFn: () =>
      adminApi.listOrphanFarmers({ page, pageSize, search, missing }),
    enabled,
    staleTime: STALE_TIME,
    placeholderData: (prev) => prev,
  });
};

// ═══════════════════════════════════════════════════════════
// Queries — Trash (Deleted)
// ═══════════════════════════════════════════════════════════
export const useTrashSummaryQuery = () => {
  return useQuery({
    queryKey: orphanKeys.trash(),
    queryFn: () => adminApi.getTrashSummary(),
    staleTime: STALE_TIME,
  });
};

export const useDeletedFarmsQuery = ({
  page = 1,
  pageSize = 20,
  search = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: orphanKeys.deletedFarms({ page, pageSize, search }),
    queryFn: () =>
      adminApi.listDeletedFarms({ page, pageSize, search }),
    enabled,
    staleTime: STALE_TIME,
    placeholderData: (prev) => prev,
  });
};

export const useDeletedFarmersQuery = ({
  page = 1,
  pageSize = 20,
  search = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: orphanKeys.deletedFarmers({ page, pageSize, search }),
    queryFn: () =>
      adminApi.listDeletedFarmers({ page, pageSize, search }),
    enabled,
    staleTime: STALE_TIME,
    placeholderData: (prev) => prev,
  });
};

// ═══════════════════════════════════════════════════════════
// Mutations — Bulk assign
// ═══════════════════════════════════════════════════════════
export const useBulkAssignRegionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ farmIds, farmerIds, regionId }) =>
      adminApi.bulkAssignRegion({ farmIds, farmerIds, regionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orphanKeys.all });
    },
  });
};

export const useBulkAssignOwnerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ farmIds, farmerIds, userId }) =>
      adminApi.bulkAssignOwner({ farmIds, farmerIds, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orphanKeys.all });
    },
  });
};

// ═══════════════════════════════════════════════════════════
// Mutations — Restore
// ═══════════════════════════════════════════════════════════
export const useRestoreFarmMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (farmId) => adminApi.restoreFarm(farmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orphanKeys.all });
    },
  });
};

export const useRestoreFarmerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (farmerId) => adminApi.restoreFarmer(farmerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orphanKeys.all });
    },
  });
};