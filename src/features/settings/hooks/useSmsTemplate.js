// src/features/settings/hooks/useSmsTemplate.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smsApi } from '../../../services/api/smsApi';

export const smsKeys = {
  all: ['sms'],
  templates: () => [...smsKeys.all, 'templates'],
  template: (id) => [...smsKeys.all, 'template', id],
  settings: () => [...smsKeys.all, 'settings'],
};

// ============================================
// Templates
// ============================================
export const useSmsTemplatesQuery = () => {
  return useQuery({
    queryKey: smsKeys.templates(),
    queryFn: () => smsApi.listTemplates(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSmsTemplateQuery = (id) => {
  return useQuery({
    queryKey: smsKeys.template(id),
    queryFn: () => smsApi.getTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSmsTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => smsApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.templates() });
    },
  });
};

// ============================================
// Settings
// ============================================
export const useSmsSettingsQuery = () => {
  return useQuery({
    queryKey: smsKeys.settings(),
    queryFn: () => smsApi.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateSmsSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => smsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsKeys.settings() });
    },
  });
};

// ============================================
// Combined
// ============================================
export const useSmsTemplate = () => {
  const templatesQuery = useSmsTemplatesQuery();
  const settingsQuery = useSmsSettingsQuery();
  const updateTemplateMutation = useUpdateSmsTemplateMutation();
  const updateSettingsMutation = useUpdateSmsSettingsMutation();

  return {
    templates: templatesQuery.data || [],
    settings: settingsQuery.data,
    isLoading: templatesQuery.isLoading || settingsQuery.isLoading,

    updateTemplate: async (id, data) => {
      return await updateTemplateMutation.mutateAsync({ id, data });
    },
    updateSettings: async (data) => {
      return await updateSettingsMutation.mutateAsync(data);
    },
  };
};

export default useSmsTemplate;