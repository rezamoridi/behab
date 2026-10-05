// src/features/conversations/hooks/useSmsLogs.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsLogApi } from '../../../services/api/smsLogApi';

export const smsLogKeys = {
  all: ['sms-logs'],
  lists: () => [...smsLogKeys.all, 'list'],
  list: (filters) => [...smsLogKeys.lists(), filters],
  stats: (filters) => [...smsLogKeys.all, 'stats', filters],
  detail: (id) => [...smsLogKeys.all, 'detail', id],
};

// ============================================
// List
// ============================================
export const useSmsLogsQuery = ({
  page = 1,
  pageSize = 20,
  search = null,
  kind = null,
  status = null,
  phone = null,
  fromDate = null,
  toDate = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: smsLogKeys.list({
      page, pageSize, search, kind, status, phone, fromDate, toDate,
    }),
    queryFn: () =>
      smsLogApi.list({
        page, pageSize, search, kind, status, phone, fromDate, toDate,
      }),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
};

// ============================================
// Detail
// ============================================
export const useSmsLogQuery = (logId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: smsLogKeys.detail(logId),
    queryFn: () => smsLogApi.get(logId),
    enabled: enabled && !!logId,
    staleTime: 60 * 1000,
  });
};

// ============================================
// Stats
// ============================================
export const useSmsStatsQuery = ({
  fromDate = null,
  toDate = null,
  enabled = true,
} = {}) => {
  return useQuery({
    queryKey: smsLogKeys.stats({ fromDate, toDate }),
    queryFn: () => smsLogApi.stats({ fromDate, toDate }),
    enabled,
    staleTime: 60 * 1000,
  });
};

// ============================================
// Mutations
// ============================================
export const useDeleteSmsLogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId) => smsLogApi.delete(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsLogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...smsLogKeys.all, 'stats'] });
    },
  });
};

export const useResendSmsLogMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId) => smsLogApi.resend(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsLogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...smsLogKeys.all, 'stats'] });
    },
  });
};