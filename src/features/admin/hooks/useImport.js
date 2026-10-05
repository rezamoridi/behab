// src/features/admin/hooks/useImport.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { importApi, duplicateApi } from '../../../services/api/importApi';

// ═══════════════════════════════════════════════════════════
// Import
// ═══════════════════════════════════════════════════════════
export const useImportPreviewMutation = () => {
  return useMutation({
    mutationFn: (file) => importApi.preview(file),
  });
};

export const useImportConfirmMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rows, regionId, sendSms }) =>
      importApi.confirm({ rows, regionId, sendSms }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['farms'] });
    },
  });
};

// ═══════════════════════════════════════════════════════════
// Duplicates
// ═══════════════════════════════════════════════════════════
export const duplicateKeys = {
  all: ['duplicates'],
  farmers: () => [...duplicateKeys.all, 'farmers'],
};

export const useDuplicatesQuery = () => {
  return useQuery({
    queryKey: duplicateKeys.farmers(),
    queryFn: () => duplicateApi.list(),
    staleTime: 60 * 1000,
  });
};

export const useMergeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ primaryId, mergeIds }) =>
      duplicateApi.merge({ primaryId, mergeIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: duplicateKeys.all });
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
    },
  });
};