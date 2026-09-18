// src/features/settings/hooks/useAgricultureSettings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, cropApi } from '../../../services/api/settingsApi';

// ============================================
// Query Keys
// ============================================
export const agricultureKeys = {
  all: ['agriculture'],
  settings: () => [...agricultureKeys.all, 'settings'],
};

export const cropKeys = {
  all: ['crops'],
  list: (activeOnly) => [...cropKeys.all, 'list', activeOnly],
  detail: (id) => [...cropKeys.all, 'detail', id],
};

// ============================================
// Queries — Agriculture Settings
// ============================================
export const useAgricultureSettingsQuery = () => {
  return useQuery({
    queryKey: agricultureKeys.settings(),
    queryFn: async () => {
      const res = await settingsApi.getAgricultureSettings();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// Queries — Crops (شامل نرخ‌ها)
// ============================================
export const useCropsQuery = ({ activeOnly = false } = {}) => {
  return useQuery({
    queryKey: cropKeys.list(activeOnly),
    queryFn: async () => {
      const res = await cropApi.list(activeOnly);
      return res.data || [];
    },
    staleTime: 60 * 1000,            
    refetchOnMount: 'always',         
    refetchOnWindowFocus: true,       
  });
};

export const useCropQuery = (id, { enabled = true } = {}) => {
  return useQuery({
    queryKey: cropKeys.detail(id),
    queryFn: async () => {
      const res = await cropApi.get(id);
      return res.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// Mutations — Agriculture Settings
// ============================================
export const useUpdateAgricultureSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsApi.updateAgricultureSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.settings() });
    },
  });
};

// ============================================
// Mutations — Crops
// ============================================
export const useCreateCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => cropApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cropKeys.all });
    },
  });
};

export const useUpdateCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => cropApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cropKeys.all });
    },
  });
};

export const useDeleteCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cropApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cropKeys.all });
    },
  });
};

// ============================================
// ✅ Hook ترکیبی
// ============================================
export const useAgricultureSettings = () => {
  const settingsQuery = useAgricultureSettingsQuery();
  const cropsQuery = useCropsQuery({ activeOnly: false });

  const updateSettingsMutation = useUpdateAgricultureSettingsMutation();
  const addCropMutation = useCreateCropMutation();
  const updateCropMutation = useUpdateCropMutation();
  const deleteCropMutation = useDeleteCropMutation();

  return {
    // Data
    settings: settingsQuery.data,
    crops: cropsQuery.data || [],

    isLoading: settingsQuery.isLoading || cropsQuery.isLoading,

    // Actions — Settings
    updateSettings: async (data) => {
      try {
        await updateSettingsMutation.mutateAsync(data);
        alert('تنظیمات با موفقیت ذخیره شد.');
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در ذخیره تنظیمات'
        );
        throw err;
      }
    },

    // Actions — Crops
    addCrop: async (data) => {
      try {
        await addCropMutation.mutateAsync(data);
        alert(`محصول "${data.name}" با موفقیت افزوده شد.`);
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در افزودن محصول'
        );
        throw err;
      }
    },

    updateCrop: async (id, data) => {
      try {
        await updateCropMutation.mutateAsync({ id, data });
        alert('محصول با موفقیت به‌روزرسانی شد.');
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در به‌روزرسانی محصول'
        );
        throw err;
      }
    },

    deleteCrop: async (id) => {
      try {
        await deleteCropMutation.mutateAsync(id);
        alert('محصول با موفقیت حذف شد.');
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در حذف محصول'
        );
        throw err;
      }
    },
  };
};

export default useAgricultureSettings;