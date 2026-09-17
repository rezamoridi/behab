// src/features/settings/hooks/useAgricultureSettings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi, cropApi } from '../../../services/api/settingsApi';

// ============================================
// Query Keys
// ============================================
export const agricultureKeys = {
  all: ['agriculture'],
  settings: () => [...agricultureKeys.all, 'settings'],
  waterRates: () => [...agricultureKeys.all, 'water-rates'],
  cropRates: () => [...agricultureKeys.all, 'crop-rates'],
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
// Queries — Water Rates
// ============================================
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

// ✅ نرخ‌های محصولات — از همون /water-rates استفاده می‌کنه
export const useCropWaterRatesQuery = () => {
  return useQuery({
    queryKey: agricultureKeys.cropRates(),
    queryFn: async () => {
      const res = await settingsApi.getWaterRates();
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ گرفتن نرخ یک محصول خاص از cache
export const useCropWaterRate = (crop) => {
  const { data: rates = [], ...rest } = useWaterRatesQuery();

  const rate = crop ? rates.find((r) => r.crop === crop) : null;

  return {
    ...rest,
    rate,
    requirement: rate?.requirement ?? null,
    price: rate?.price ?? 0,
  };
};

// ============================================
// Queries — Crops
// ============================================
export const useCropsQuery = ({ activeOnly = false } = {}) => {
  return useQuery({
    queryKey: cropKeys.list(activeOnly),
    queryFn: async () => {
      const res = await cropApi.list(activeOnly);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

export const useUpdateCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => cropApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cropKeys.all });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

export const useDeleteCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cropApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cropKeys.all });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

// ============================================
// Mutations — Water Rates
// ============================================
export const useCreateWaterRateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsApi.createWaterRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

export const useUpdateWaterRateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crop, data }) => settingsApi.updateWaterRate(crop, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

export const useDeleteWaterRateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (crop) => settingsApi.deleteWaterRate(crop),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agricultureKeys.waterRates() });
      queryClient.invalidateQueries({ queryKey: agricultureKeys.cropRates() });
    },
  });
};

// ============================================
// ✅ Hook ترکیبی — همه چیز از این یک hook
// ============================================
export const useAgricultureSettings = () => {
  const settingsQuery = useAgricultureSettingsQuery();
  const waterRatesQuery = useWaterRatesQuery();
  const cropRatesQuery = useCropWaterRatesQuery();
  const cropsQuery = useCropsQuery({ activeOnly: false });

  const updateSettingsMutation = useUpdateAgricultureSettingsMutation();
  const addWaterRateMutation = useCreateWaterRateMutation();
  const updateWaterRateMutation = useUpdateWaterRateMutation();
  const deleteWaterRateMutation = useDeleteWaterRateMutation();
  const addCropMutation = useCreateCropMutation();
  const updateCropMutation = useUpdateCropMutation();
  const deleteCropMutation = useDeleteCropMutation();

  return {
    // ============================================
    // Data
    // ============================================
    settings: settingsQuery.data,
    waterRates: waterRatesQuery.data || [],
    cropWaterRates: cropRatesQuery.data || [],
    crops: cropsQuery.data || [],

    isLoading:
      settingsQuery.isLoading ||
      waterRatesQuery.isLoading ||
      cropRatesQuery.isLoading ||
      cropsQuery.isLoading,

    // ============================================
    // Actions — Agriculture Settings
    // ============================================
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

    // ============================================
    // Actions — Crops (محصولات)
    // ============================================
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

    // ============================================
    // Actions — Water Rates (نرخ محصولات)
    // ============================================
    addWaterRate: async (data) => {
      try {
        await addWaterRateMutation.mutateAsync(data);
        alert('نرخ آب با موفقیت افزوده شد.');
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در افزودن نرخ آب'
        );
        throw err;
      }
    },

    updateWaterRate: async (crop, data) => {
      try {
        await updateWaterRateMutation.mutateAsync({ crop, data });
        alert(`نرخ آب محصول "${crop}" با موفقیت به‌روزرسانی شد.`);
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در ویرایش نرخ آب'
        );
        throw err;
      }
    },

    deleteWaterRate: async (crop) => {
      try {
        await deleteWaterRateMutation.mutateAsync(crop);
        alert(`نرخ آب محصول "${crop}" با موفقیت حذف شد.`);
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در حذف نرخ آب'
        );
        throw err;
      }
    },

    // ============================================
    // Aliases (سازگاری با SettingsPage فعلی)
    // ============================================
    updateCropWaterRate: async (crop, data) => {
      try {
        await updateWaterRateMutation.mutateAsync({ crop, data });
        alert(`نرخ آب محصول "${crop}" با موفقیت به‌روزرسانی شد.`);
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در به‌روزرسانی نرخ آب محصول'
        );
        throw err;
      }
    },

    addCropWaterRate: async (data) => {
      try {
        await addWaterRateMutation.mutateAsync(data);
        alert(`نرخ آب محصول "${data.crop}" با موفقیت افزوده شد.`);
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در افزودن نرخ آب محصول'
        );
        throw err;
      }
    },

    deleteCropWaterRate: async (crop) => {
      try {
        await deleteWaterRateMutation.mutateAsync(crop);
        alert(`نرخ آب محصول "${crop}" با موفقیت حذف شد.`);
      } catch (err) {
        alert(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در حذف نرخ آب محصول'
        );
        throw err;
      }
    },
  };
};

export default useAgricultureSettings;