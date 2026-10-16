// src/features/farm-registration/hooks/useFarmInputs.js
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { farmInputApi } from '../../../services/api/farmInputApi';

// ═══════════════════════════════════════════════════════════
// Query keys
// ═══════════════════════════════════════════════════════════
export const farmInputKeys = {
  all: ['farm-inputs'],
  byFarm: (farmId) => [...farmInputKeys.all, farmId],
};

// ═══════════════════════════════════════════════════════════
// Queries
// ═══════════════════════════════════════════════════════════
export const useFarmInputsQuery = (
  farmId,
  { enabled = true } = {}
) => {
  return useQuery({
    queryKey: farmInputKeys.byFarm(farmId),
    queryFn: async () => {
      const { data } = await farmInputApi.list(farmId);
      return data;
    },
    enabled: enabled && !!farmId,
    staleTime: 60 * 1000,
  });
};

// ═══════════════════════════════════════════════════════════
// Mutations
// ═══════════════════════════════════════════════════════════
const useInvalidate = () => {
  const qc = useQueryClient();
  return (farmId) => {
    qc.invalidateQueries({
      queryKey: farmInputKeys.byFarm(farmId),
    });
    // ✅ invalidate farm summary در داشبورد
    qc.invalidateQueries({ queryKey: ['farms'] });
  };
};

export const useAddFarmInputMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ farmId, data }) =>
      farmInputApi.add(farmId, data),
    onSuccess: (_, { farmId }) => invalidate(farmId),
  });
};

export const useReplaceFarmInputsMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ farmId, items }) =>
      farmInputApi.replaceAll(farmId, items),
    onSuccess: (_, { farmId }) => invalidate(farmId),
  });
};

export const useUpdateFarmInputMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ itemId, data, farmId }) =>
      farmInputApi.update(itemId, data).then((r) => ({
        ...r,
        farmId,
      })),
    onSuccess: (_, { farmId }) => invalidate(farmId),
  });
};

export const useDeleteFarmInputMutation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ itemId, farmId }) =>
      farmInputApi.remove(itemId),
    onSuccess: (_, { farmId }) => invalidate(farmId),
  });
};