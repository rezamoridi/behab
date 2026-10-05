// src/features/settings/hooks/useUsersManagement.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/api/settingsApi';

// ═══════════════════════════════════════════════════════
// Keys
// ═══════════════════════════════════════════════════════
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (params) => [...userKeys.lists(), params],
  stats: (id) => [...userKeys.all, 'stats', id],
  details: (id) => [...userKeys.all, 'details', id],
};

const STALE_TIME = 60 * 1000;

// ═══════════════════════════════════════════════════════
// Queries
// ═══════════════════════════════════════════════════════
export const useUsersQuery = () => {
  return useQuery({
    queryKey: userKeys.list({}),
    queryFn: async () => {
      const res = await settingsApi.getUsers();
      return res.data?.items || res.data || [];
    },
    staleTime: STALE_TIME,
  });
};

export const useUserStatsQuery = (userId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: userKeys.stats(userId),
    queryFn: async () => {
      const res = await settingsApi.getUserStats(userId);
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: STALE_TIME,
  });
};

export const useUserDetailsQuery = (userId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: userKeys.details(userId),
    queryFn: async () => {
      const res = await settingsApi.getUserDetails(userId);
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: STALE_TIME,
  });
};

// ═══════════════════════════════════════════════════════
// Mutations
// ═══════════════════════════════════════════════════════
const invalidateAll = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: userKeys.all });
};

export const useCreateUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsApi.createUser(data),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateUser(id, data),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useDeleteUserMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => settingsApi.deleteUser(id),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useChangeRoleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => settingsApi.changeUserRole(id, role),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useToggleActiveMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }) =>
      settingsApi.toggleUserActive(id, is_active),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateRegionsMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, region_ids }) =>
      settingsApi.updateUserRegions(id, region_ids),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ id, new_password }) =>
      settingsApi.resetUserPassword(id, new_password),
  });
};

export const useBulkActiveMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ user_ids, is_active }) =>
      settingsApi.bulkToggleActive(user_ids, is_active),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useBulkRoleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ user_ids, role }) =>
      settingsApi.bulkChangeRole(user_ids, role),
    onSuccess: () => invalidateAll(qc),
  });
};