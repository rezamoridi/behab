// src/features/farm-registration/hooks/useFarmsQuery.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFarms, fetchFarmById } from '../../../services/api/farmApi';
import { farmerApi } from '../../../services/api/farmerApi';

// ============================================================
// Farm Keys
// ============================================================
export const farmKeys = {
  all: ['farms'],
  lists: () => [...farmKeys.all, 'list'],
  list: (filters) => [...farmKeys.lists(), filters],
  details: () => [...farmKeys.all, 'detail'],
  detail: (id) => [...farmKeys.details(), id],
};

// ============================================================
// Farmer Keys
// ============================================================
export const farmerKeys = {
  all: ['farmers'],
  lists: () => [...farmerKeys.all, 'list'],
  list: (filters) => [...farmerKeys.lists(), filters],
  details: () => [...farmerKeys.all, 'detail'],
  detail: (id) => [...farmerKeys.details(), id],
};

// ============================================================
// Farms Query
// ============================================================
export const useFarmsQuery = ({
  page = 1,
  pageSize = 20,
  search = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: farmKeys.list({ page, pageSize, search }),
    queryFn: () => fetchFarms({ page, pageSize, search }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFarmQuery = (farmId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: farmKeys.detail(farmId),
    queryFn: () => fetchFarmById(farmId),
    enabled: enabled && !!farmId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================
// Farmers Query
// ============================================================
export const useFarmersQuery = ({
  page = 1,
  pageSize = 100,
  search = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: farmerKeys.list({ page, pageSize, search }),
    queryFn: () => farmerApi.list({ page, pageSize, search }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFarmerQuery = (farmerId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: farmerKeys.detail(farmerId),
    queryFn: () => farmerApi.get(farmerId),
    enabled: enabled && !!farmerId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================
// Query Client Helpers
// ============================================================
export const useFarmQueryClient = () => {
  const queryClient = useQueryClient();
  return {
    invalidateFarms: () =>
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() }),
    invalidateFarm: (id) =>
      queryClient.invalidateQueries({ queryKey: farmKeys.detail(id) }),
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: farmKeys.all }),
    setFarmData: (id, data) =>
      queryClient.setQueryData(farmKeys.detail(id), data),

    // Farmers
    invalidateFarmers: () =>
      queryClient.invalidateQueries({ queryKey: farmerKeys.lists() }),
    invalidateFarmer: (id) =>
      queryClient.invalidateQueries({ queryKey: farmerKeys.detail(id) }),
  };
};