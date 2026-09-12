// src/features/farm-registration/hooks/useFarmsQuery.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFarms, fetchFarmById } from '../../../services/api/farmApi';

// ============================================
// Query Keys
// ============================================
export const farmKeys = {
  all: ['farms'],
  lists: () => [...farmKeys.all, 'list'],
  list: (filters) => [...farmKeys.lists(), filters],
  details: () => [...farmKeys.all, 'detail'],
  detail: (id) => [...farmKeys.details(), id],
};

// ============================================
// دریافت لیست مزارع
// ============================================
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
    select: (data) => ({
      farms: data?.data || data?.items || data?.farms || [],
      total: data?.total || data?.total_count || 0,
      totalPages: data?.total_pages || data?.pages || 1,
      raw: data,
    }),
  });
};

// ============================================
// دریافت یک مزرعه
// ============================================
export const useFarmQuery = (farmId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: farmKeys.detail(farmId),
    queryFn: () => fetchFarmById(farmId),
    enabled: enabled && !!farmId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// Query Client Helpers
// ============================================
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