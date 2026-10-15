// src/features/villages/hooks/useVillages.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { villageApi } from '../../../services/api/villageApi';

// ═══════════════════════════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════════════════════════
export const villageKeys = {
  all: ['villages'],
  lists: () => [...villageKeys.all, 'list'],
  list: (filters) => [...villageKeys.lists(), filters],
  details: () => [...villageKeys.all, 'detail'],
  detail: (id) => [...villageKeys.details(), id],
  mine: () => [...villageKeys.all, 'my'],
};

// ═══════════════════════════════════════════════════════════
// Queries
// ═══════════════════════════════════════════════════════════
export const useVillagesQuery = ({
  activeOnly = false,
  regionId = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: villageKeys.list({ activeOnly, regionId }),
    queryFn: () => villageApi.list({ activeOnly, regionId }),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useMyVillagesQuery = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: villageKeys.mine(),
    queryFn: () => villageApi.my(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useVillageQuery = (villageId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: villageKeys.detail(villageId),
    queryFn: () => villageApi.get(villageId),
    enabled: enabled && !!villageId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// ═══════════════════════════════════════════════════════════
// Mutations
// ═══════════════════════════════════════════════════════════
export const useCreateVillageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => villageApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: villageKeys.all });
    },
  });
};

export const useUpdateVillageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => villageApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: villageKeys.all });
      queryClient.invalidateQueries({
        queryKey: villageKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteVillageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => villageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: villageKeys.all });
    },
  });
};

export const useAssignVillagesToUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, villageIds }) =>
      villageApi.assignVillagesToUser(userId, villageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: villageKeys.all });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', 'me'] });
    },
  });
};

export const useAssignUsersToVillageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ villageId, userIds }) =>
      villageApi.assignUsersToVillage(villageId, userIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: villageKeys.all });
      queryClient.invalidateQueries({
        queryKey: villageKeys.detail(variables.villageId),
      });
    },
  });
};

// ═══════════════════════════════════════════════════════════
// Combined
// ═══════════════════════════════════════════════════════════
export const useVillages = (options = {}) => {
  const villagesQuery = useVillagesQuery(options);
  const createMutation = useCreateVillageMutation();
  const updateMutation = useUpdateVillageMutation();
  const deleteMutation = useDeleteVillageMutation();

  return {
    villages: villagesQuery.data || [],
    isLoading: villagesQuery.isLoading,

    createVillage: (data) => createMutation.mutateAsync(data),
    updateVillage: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteVillage: (id) => deleteMutation.mutateAsync(id),

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useVillages;