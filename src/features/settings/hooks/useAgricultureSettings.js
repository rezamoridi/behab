// src/features/settings/hooks/useAgricultureSettings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/api/settingsApi';

// ============================================
// Query Keys
// ============================================
export const agricultureKeys = {
  all: ['agriculture'],
  settings: () => [...agricultureKeys.all, 'settings'],
  waterRates: () => [...agricultureKeys.all, 'water-rates'],
  cropRates: () => [...agricultureKeys.all, 'crop-rates'],
};

// ============================================
// Queries
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

export const useWaterRatesQuery = () => {
  return useQuery({
    queryKey: agricultureKeys.waterRates(),
    queryFn: async () => {
      const res = await settingsApi.getWaterRates();
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCropWaterRatesQuery = () => {
  return useQuery({
    queryKey: agricultureKeys.cropRates(),
    queryFn: async () => {
      try {
        const res = await settingsApi.getCropWaterRates();
        return res.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// Mutations - Agriculture Settings
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
// Mutations - Water Rates
// ============================================
export const useCreateWaterRateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => settingsApi.createWaterRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
    },
  });
};

export const useUpdateWaterRateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateWaterRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
    },
  });
};

export const useDeleteWaterRateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => settingsApi.deleteWaterRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
    },
  });
};

// ============================================
// Mutations - Crop Water Rates
// ============================================
export const useUpdateCropWaterRateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ crop, data }) =>
      settingsApi.updateCropWaterRate(crop, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

export const useCreateCropWaterRateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => settingsApi.createWaterRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

export const useDeleteCropWaterRateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (crop) => settingsApi.deleteWaterRate(crop),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

// ============================================
// Hook ترکیبی
// ============================================
export const useAgricultureSettings = () => {
  const settingsQuery = useAgricultureSettingsQuery();
  const waterRatesQuery = useWaterRatesQuery();
  const cropRatesQuery = useCropWaterRatesQuery();

  const updateSettingsMutation = useUpdateAgricultureSettingsMutation();
  const addWaterRateMutation = useCreateWaterRateMutation();
  const updateWaterRateMutation = useUpdateWaterRateMutation();
  const deleteWaterRateMutation = useDeleteWaterRateMutation();
  const updateCropRateMutation = useUpdateCropWaterRateMutation();
  const addCropRateMutation = useCreateCropWaterRateMutation();
  const deleteCropRateMutation = useDeleteCropWaterRateMutation();

  return {
    // Data
    settings: settingsQuery.data,
    waterRates: waterRatesQuery.data || [],
    cropWaterRates: cropRatesQuery.data || [],

    // Loading
    isLoading:
      settingsQuery.isLoading ||
      waterRatesQuery.isLoading ||
      cropRatesQuery.isLoading,

    // Actions
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

    addWaterRate: async (data) => {
      try {
        await addWaterRateMutation.mutateAsync(data);
        alert('تعرفه با موفقیت افزوده شد.');
      } catch (err) {
        alert(err?.message || 'خطا در افزودن تعرفه');
        throw err;
      }
    },

    updateWaterRate: async (id, data) => {
      try {
        await updateWaterRateMutation.mutateAsync({ id, data });
        alert('تعرفه با موفقیت ویرایش شد.');
      } catch (err) {
        alert(err?.message || 'خطا در ویرایش تعرفه');
        throw err;
      }
    },

    deleteWaterRate: async (id) => {
      try {
        await deleteWaterRateMutation.mutateAsync(id);
        alert('تعرفه با موفقیت حذف شد.');
      } catch (err) {
        alert(err?.message || 'خطا در حذف تعرفه');
        throw err;
      }
    },

    updateCropWaterRate: async (crop, data) => {
      try {
        await updateCropRateMutation.mutateAsync({ crop, data });
        alert(`نرخ آب محصول "${crop}" با موفقیت به‌روزرسانی شد.`);
      } catch (err) {
        alert(err?.message || 'خطا در به‌روزرسانی نرخ آب محصول');
        throw err;
      }
    },

    addCropWaterRate: async (data) => {
      try {
        await addCropRateMutation.mutateAsync(data);
        alert(`محصول "${data.crop}" با موفقیت افزوده شد.`);
      } catch (err) {
        alert(err?.message || 'خطا در افزودن محصول');
        throw err;
      }
    },

    deleteCropWaterRate: async (crop) => {
      try {
        await deleteCropRateMutation.mutateAsync(crop);
        alert(`محصول "${crop}" با موفقیت حذف شد.`);
      } catch (err) {
        alert(err?.message || 'خطا در حذف محصول');
        throw err;
      }
    },
  };
};