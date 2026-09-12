// src/features/farm-registration/hooks/useFarmsQuery.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFarms, fetchFarmById } from '../../../services/api/farmApi';

export const farmKeys = {
  all: ['farms'],
  lists: () => [...farmKeys.all, 'list'],
  list: (filters) => [...farmKeys.lists(), filters],
  details: () => [...farmKeys.all, 'detail'],
  detail: (id) => [...farmKeys.details(), id],
};

// ✅ بدون select — fetchFarms خودش نرمال می‌کند
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
  };
};