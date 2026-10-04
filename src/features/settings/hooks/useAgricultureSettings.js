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
  lists: () => [...cropKeys.all, 'list'],
  list: (activeOnly) => [...cropKeys.all, 'list', activeOnly],
  detail: (id) => [...cropKeys.all, 'detail', id],
};

// ============================================
// Cache timings
// ============================================
const AGRICULTURE_STALE_TIME = 5 * 60 * 1000; // 5 min
const CROPS_STALE_TIME = 60 * 1000; // 1 min
const GC_TIME = 30 * 60 * 1000; // 30 min

// ============================================
// Default settings (برای جلوگیری از crash)
// ============================================
const DEFAULT_SETTINGS = {
  default_area_unit: 'hectare',
  default_water_unit: 'cubic_meter',
  default_map_center_lat: 35.6892,
  default_map_center_lng: 51.389,
  default_map_zoom: 6,
  default_map_layer: 'osm',
  show_saved_farms: true,
};

// ============================================
// Queries — Agriculture Settings
// ============================================
export const useAgricultureSettingsQuery = () => {
  return useQuery({
    queryKey: agricultureKeys.settings(),
    queryFn: async () => {
      const res = await settingsApi.getAgricultureSettings();
      return { ...DEFAULT_SETTINGS, ...(res.data || {}) };
    },
    staleTime: AGRICULTURE_STALE_TIME,
    gcTime: GC_TIME,
  });
};

// ============================================
// ✅ Queries — Crops — با refetch خودکار
// ============================================
export const useCropsQuery = ({ activeOnly = false } = {}) => {
  return useQuery({
    queryKey: cropKeys.list(activeOnly),
    queryFn: async () => {
      const res = await cropApi.list(activeOnly);
      return res.data || [];
    },
    staleTime: CROPS_STALE_TIME,
    gcTime: GC_TIME,
    // ✅ هر بار که mount شد، داده‌ی جدید بگیر
    refetchOnMount: true,
    // ✅ وقتی کاربر به tab برگردد
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
    staleTime: CROPS_STALE_TIME,
    gcTime: GC_TIME,
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
// ✅ Mutations — Crops
// ============================================
export const useCreateCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => cropApi.create(data),
    onSuccess: () => {
      // ✅ invalidate همه‌ی listها (activeOnly: true و false)
      queryClient.invalidateQueries({ queryKey: cropKeys.lists() });
      // ✅ force refetch فوری
      queryClient.refetchQueries({ queryKey: cropKeys.lists() });
    },
  });
};

export const useUpdateCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => cropApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cropKeys.lists() });
      queryClient.refetchQueries({ queryKey: cropKeys.lists() });
    },
  });
};

export const useDeleteCropMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cropApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cropKeys.lists() });
      queryClient.refetchQueries({ queryKey: cropKeys.lists() });
    },
  });
};

// ============================================
// Hook ترکیبی
// ============================================
export const useAgricultureSettings = () => {
  const settingsQuery = useAgricultureSettingsQuery();
  const cropsQuery = useCropsQuery({ activeOnly: false });

  const updateSettingsMutation = useUpdateAgricultureSettingsMutation();
  const addCropMutation = useCreateCropMutation();
  const updateCropMutation = useUpdateCropMutation();
  const deleteCropMutation = useDeleteCropMutation();

  return {
    settings: settingsQuery.data,
    crops: cropsQuery.data || [],

    isLoading: settingsQuery.isLoading || cropsQuery.isLoading,

    updateSettings: async (data) => {
      await updateSettingsMutation.mutateAsync(data);
    },
    addCrop: async (data) => {
      await addCropMutation.mutateAsync(data);
    },
    updateCrop: async (id, data) => {
      await updateCropMutation.mutateAsync({ id, data });
    },
    deleteCrop: async (id) => {
      await deleteCropMutation.mutateAsync(id);
    },
  };
};

export default useAgricultureSettings;