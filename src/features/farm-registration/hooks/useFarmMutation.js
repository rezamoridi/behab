// src/features/farm-registration/hooks/useFarmMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFarm,
  updateFarm,
  deleteFarm,
  fetchFarmById,
} from "../../../services/api/farmApi";
import { farmerApi } from "../../../services/api/farmerApi";
import { farmKeys, farmerKeys } from "./farmQueryKeys";

// ═══════════════════════════════════════════════════════════
// کلید لایهٔ مرجع
// ═══════════════════════════════════════════════════════════
const REFERENCE_LAYER_KEY = ["farms", "reference-layer"];

// ═══════════════════════════════════════════════════════════
// استخراج farm از پاسخ سرور
// ═══════════════════════════════════════════════════════════
const extractFarmFromResponse = (response) => {
  if (!response) return null;
  return response.data || response.farm || response;
};

// ═══════════════════════════════════════════════════════════
// ✅ invalidateFarmsAndRelated
//
// این تابع تضمین می‌کند که:
//   ۱. همه‌ی queryهای list مزرعه refetch شوند
//      (صرف‌نظر از page/pageSize/search)
//   ۲. queryهای allFarms (analytics) آپدیت شوند
//   ۳. لایهٔ مرجع refetch شود
//
// چرا setQueryData دستی حذف شد؟
//   چون:
//   - با placeholderData تداخل می‌کند
//   - با keyهای مختلفی که MapViewPage استفاده می‌کند
//     هماهنگ نیست
//   - منبع حقیقت باید سرور باشد، نه cache دستی
// ═══════════════════════════════════════════════════════════
const invalidateFarmsAndRelated = (queryClient) => {
  // ✅ partial matching: همه‌ی queryهای زیر ['farms', 'list']
  queryClient.invalidateQueries({
    queryKey: farmKeys.lists(),
    refetchType: "active",
  });

  // ✅ analytics
  queryClient.invalidateQueries({
    queryKey: farmKeys.allFarms(),
    refetchType: "active",
  });

  // ✅ لایهٔ مرجع
  queryClient.invalidateQueries({
    queryKey: REFERENCE_LAYER_KEY,
    refetchType: "active",
  });
};

// ═══════════════════════════════════════════════════════════
// ✅ invalidateFarmers
// ═══════════════════════════════════════════════════════════
const invalidateFarmers = (queryClient) => {
  queryClient.invalidateQueries({
    queryKey: farmerKeys.all,
    refetchType: "active",
  });
};

// ═══════════════════════════════════════════════════════════
// mergeFarm: ادغام ایمن farm قدیمی + پاسخ سرور + payload
//
// ⚠️ فقط برای detail queryها استفاده می‌شود (نه list)
// ═══════════════════════════════════════════════════════════
const mergeFarm = (oldFarm, savedFarm, payload) => {
  const merged = { ...(oldFarm || {}) };

  const FARM_FIELDS = [
    "farm_id",
    "id",
    "farmer_id",
    "province",
    "county",
    "bakhsh",
    "dehestan",
    "village",
    "land_type",
    "crop",
    "crop_id",
    "crop_color",
    "irrigation_type",
    "project_name",
    "coverage_status",
    "water_source",
    "irrigation_system",
    "area_ha",
    "polygon_count",
    "region_id",
    "created_by_user_id",
  ];

  if (savedFarm) {
    for (const field of FARM_FIELDS) {
      const value = savedFarm[field];
      if (value !== undefined && value !== null) {
        merged[field] = value;
      }
    }
  }

  if (payload) {
    for (const field of FARM_FIELDS) {
      if (merged[field] === undefined || merged[field] === null) {
        const value = payload[field];
        if (value !== undefined && value !== null) {
          merged[field] = value;
        }
      }
    }
  }

  if (
    savedFarm &&
    savedFarm.geojson !== undefined &&
    savedFarm.geojson !== null
  ) {
    merged.geojson = savedFarm.geojson;
  } else if (
    payload &&
    payload.geojson !== undefined &&
    payload.geojson !== null
  ) {
    merged.geojson = payload.geojson;
  } else if (oldFarm && oldFarm.geojson !== undefined) {
    merged.geojson = oldFarm.geojson;
  }

  return merged;
};

// ═══════════════════════════════════════════════════════════
// ایجاد مزرعه (مستقل)
// ═══════════════════════════════════════════════════════════
export const useCreateFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createFarm(payload),

    onSuccess: (response, payload) => {
      const savedFarm = extractFarmFromResponse(response);

      // ✅ detail را مستقیم set کن (اگر server پاسخ کامل داد)
      if (savedFarm?.farm_id) {
        queryClient.setQueryData(
          farmKeys.detail(savedFarm.farm_id),
          savedFarm,
        );
      }

      // ✅ لیست‌ها + لایهٔ مرجع را invalidate کن
      invalidateFarmsAndRelated(queryClient);

      // ✅ کشاورزان (ممکن است کشاورز جدید ساخته شده باشد)
      invalidateFarmers(queryClient);
    },

    onError: (error) => {
      console.error("خطا در ایجاد مزرعه:", error);
    },
  });
};

// ═══════════════════════════════════════════════════════════
// ثبت کشاورز + مزرعه (اتمیک)
// ═══════════════════════════════════════════════════════════
export const useRegisterWithFarmsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ farmer, farms }) =>
      farmerApi.registerWithFarms({ farmer, farms }),

    onSuccess: (response) => {
      const createdFarm = response?.farms?.[0];

      // ✅ detail را مستقیم set کن
      if (createdFarm?.farm_id) {
        queryClient.setQueryData(
          farmKeys.detail(createdFarm.farm_id),
          createdFarm,
        );
      }

      // ✅ لیست‌ها + لایهٔ مرجع
      invalidateFarmsAndRelated(queryClient);

      // ✅ کشاورزان (کشاورز جدید ساخته شده)
      invalidateFarmers(queryClient);
    },

    onError: (error) => {
      console.error("خطا در ثبت کشاورز + مزرعه:", error);
    },
  });
};

// ═══════════════════════════════════════════════════════════
// به‌روزرسانی کامل مزرعه (فرم Edit)
// ═══════════════════════════════════════════════════════════
export const useUpdateFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ farmId, payload }) => updateFarm(farmId, payload),

    onSuccess: (response, variables) => {
      const savedFarm = extractFarmFromResponse(response);

      // ✅ detail را با merge آپدیت کن (برای UI فوری)
      queryClient.setQueryData(
        farmKeys.detail(variables.farmId),
        (oldData) => mergeFarm(oldData, savedFarm, variables.payload),
      );

      // ✅ لیست‌ها + لایهٔ مرجع را invalidate کن
      invalidateFarmsAndRelated(queryClient);

      // ✅ کشاورزان (شاید کشاورز تغییر کرده)
      invalidateFarmers(queryClient);
    },

    onError: (error) => {
      console.error("خطا در ویرایش مزرعه:", error);
    },
  });
};

// ═══════════════════════════════════════════════════════════
// ویرایش فقط هندسه مزرعه (لایه)
// ═══════════════════════════════════════════════════════════
export const useUpdateFarmGeometryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ farmId, payload }) => {
      if (!farmId) {
        throw new Error("شناسه مزرعه معتبر نیست");
      }

      // 1. خواندن داده‌های کامل فعلی
      const currentFarm = await fetchFarmById(farmId);
      if (!currentFarm) {
        throw new Error("اطلاعات مزرعه یافت نشد");
      }

      if (currentFarm.is_reference === true) {
        throw new Error("شما به این مزرعه دسترسی ندارید");
      }

      // 2. ادغام: همه فیلدهای موجود + هندسه جدید
      const mergedPayload = {
        province: currentFarm.province || null,
        county: currentFarm.county || null,
        bakhsh: currentFarm.bakhsh || null,
        dehestan: currentFarm.dehestan || null,
        village: currentFarm.village || null,

        land_type: currentFarm.land_type || null,
        crop: currentFarm.crop || null,
        crop_id: currentFarm.crop_id ?? null,
        crop_color: currentFarm.crop_color ?? null,
        irrigation_type: currentFarm.irrigation_type || null,

        geojson: payload.geojson,
        area_ha: Number(payload.area_ha) || 0,
        polygon_count: Number(payload.polygon_count) || 1,

        project_name: currentFarm.project_name || null,
        coverage_status: currentFarm.coverage_status || null,

        water_source: currentFarm.water_source || null,
        irrigation_system: currentFarm.irrigation_system || null,
      };

      const result = await updateFarm(farmId, mergedPayload);
      return result;
    },

    onSuccess: async (response, variables) => {
      // ✅ تلاش برای گرفتن canonical از سرور
      try {
        const canonical = await fetchFarmById(variables.farmId);

        if (canonical && canonical.is_reference !== true) {
          queryClient.setQueryData(
            farmKeys.detail(variables.farmId),
            canonical,
          );
        }
      } catch (err) {
        console.warn(
          "canonical refetch failed, using payload:",
          err,
        );

        // ✅ fallback: از payload استفاده کن
        queryClient.setQueryData(
          farmKeys.detail(variables.farmId),
          (oldData) => mergeFarm(oldData, null, variables.payload),
        );
      }

      // ✅ لیست‌ها + لایهٔ مرجع
      invalidateFarmsAndRelated(queryClient);
    },

    onError: (error) => {
      console.error("خطا در ویرایش هندسه:", error);
    },
  });
};

// ═══════════════════════════════════════════════════════════
// حذف مزرعه
// ═══════════════════════════════════════════════════════════
export const useDeleteFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (farmId) => deleteFarm(farmId),

    onSuccess: (_, farmId) => {
      // ✅ detail را حذف کن
      queryClient.removeQueries({
        queryKey: farmKeys.detail(farmId),
      });

      // ✅ لیست‌ها + لایهٔ مرجع
      invalidateFarmsAndRelated(queryClient);
    },

    onError: (error) => {
      console.error("خطا در حذف مزرعه:", error);
    },
  });
};

// ═══════════════════════════════════════════════════════════
// هوک ترکیبی
// ═══════════════════════════════════════════════════════════
export const useFarmMutation = () => {
  const createMutation = useCreateFarmMutation();
  const updateMutation = useUpdateFarmMutation();
  const deleteMutation = useDeleteFarmMutation();
  const updateGeometryMutation = useUpdateFarmGeometryMutation();

  return {
    createFarm: createMutation.mutateAsync,
    updateFarm: updateMutation.mutateAsync,
    deleteFarm: deleteMutation.mutateAsync,
    updateFarmGeometry: updateGeometryMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingGeometry: updateGeometryMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      updateGeometryMutation.isPending,

    error:
      createMutation.error ||
      updateMutation.error ||
      deleteMutation.error ||
      updateGeometryMutation.error,

    reset: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
      updateGeometryMutation.reset();
    },
  };
};