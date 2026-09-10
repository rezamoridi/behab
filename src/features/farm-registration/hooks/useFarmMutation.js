// src/features/farm-registration/hooks/useFarmMutation.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createFarm,
  updateFarm,
  deleteFarm,
  fetchFarmById,
} from '../../../services/api/farmApi';
import { farmKeys } from './useFarmsQuery';

// ============================================
// پارامترهای لیست پیش‌فرض (باید با MapViewPage یکسان باشد)
// ============================================
const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 50,
  search: null,
};

// ============================================
// استخراج farm از پاسخ سرور
// پشتیبانی از ساختارهای مختلف:
// - response.data
// - response.farm
// - response (خودشیء)
// ============================================
const extractFarmFromResponse = (response) => {
  if (!response) return null;
  return response.data || response.farm || response;
};

// ============================================
// ✅ mergeFarm: ادغام ایمن farm قدیمی + پاسخ سرور + payload
//
// قواعد:
// 1. فیلدهای قدیمی farm حفظ می‌شوند
// 2. اگر savedFarm فیلدی را داشته باشد، جایگزین می‌شود
// 3. اگر savedFarm فیلدی را نداشته باشد ولی payload داشته باشد، از payload استفاده می‌شود
// 4. geojson هرگز با undefined جایگزین نمی‌شود (باگ B4)
// ============================================
const mergeFarm = (oldFarm, savedFarm, payload) => {
  const merged = { ...(oldFarm || {}) };

  const FARM_FIELDS = [
    'farm_id',
    'id',
    'farmer_name',
    'national_id',
    'phone_number',
    'province',
    'county',
    'bakhsh',
    'dehestan',
    'village',
    'land_type',
    'crop',
    'irrigation_type',
    'project_name',
    'coverage_status',
    'water_source',
    'irrigation_system',
    'area_ha',
    'polygon_count',
  ];

  // مرحله 1: اعمال فیلدهای savedFarm (اگر مقدار معتبری دارند)
  if (savedFarm) {
    for (const field of FARM_FIELDS) {
      const value = savedFarm[field];
      if (value !== undefined && value !== null) {
        merged[field] = value;
      }
    }
  }

  // مرحله 2: اعمال فیلدهای payload برای فیلدهایی که هنوز خالی‌اند
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

  // مرحله 3: ✅ geojson — منطق ویژه
  // اولویت: savedFarm.geojson → payload.geojson → oldFarm.geojson
  // هرگز با undefined جایگزین نمی‌شود.
  if (savedFarm && savedFarm.geojson !== undefined && savedFarm.geojson !== null) {
    merged.geojson = savedFarm.geojson;
  } else if (
    payload &&
    payload.geojson !== undefined &&
    payload.geojson !== null
  ) {
    merged.geojson = payload.geojson;
  } else if (oldFarm && oldFarm.geojson !== undefined) {
    merged.geojson = oldFarm.geojson;
  } else {
    // هیچکدام معتبر نبود — حذف نکن، فقط log کن
    console.warn('mergeFarm: no valid geojson found', {
      savedFarmHasGeo: !!savedFarm?.geojson,
      payloadHasGeo: !!payload?.geojson,
      oldFarmHasGeo: !!oldFarm?.geojson,
    });
  }

  return merged;
};

// ============================================
// ایجاد مزرعه
// ============================================
export const useCreateFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createFarm(payload),
    onSuccess: (response, payload) => {
      const savedFarm = extractFarmFromResponse(response);
      const farmForList = mergeFarm(null, savedFarm, payload);

      // ✅ درج در cache لیست
      queryClient.setQueryData(
        farmKeys.list(FARM_LIST_QUERY_PARAMS),
        (oldData) => {
          if (!oldData) return oldData;

          const existingFarms = oldData.farms || [];

          // بررسی تکراری بودن
          const exists = existingFarms.some(
            (f) => String(f.farm_id) === String(farmForList.farm_id)
          );
          if (exists) return oldData;

          return {
            ...oldData,
            farms: [farmForList, ...existingFarms],
            total: (oldData.total || 0) + 1,
          };
        }
      );

      // ✅ ذخیره detail
      if (farmForList.farm_id) {
        queryClient.setQueryData(
          farmKeys.detail(farmForList.farm_id),
          farmForList
        );
      }

      // ✅ invalidate برای همگام‌سازی نهایی با سرور
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() });
    },
  });
};

// ============================================
// به‌روزرسانی کامل مزرعه (فرم Edit)
// ============================================
export const useUpdateFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ farmId, payload }) => updateFarm(farmId, payload),
    onSuccess: (response, variables) => {
      const savedFarm = extractFarmFromResponse(response);

      // ✅ بروزرسانی cache لیست
      queryClient.setQueryData(
        farmKeys.list(FARM_LIST_QUERY_PARAMS),
        (oldData) => {
          if (!oldData) return oldData;

          const updatedFarms = (oldData.farms || []).map((farm) => {
            if (String(farm.farm_id) === String(variables.farmId)) {
              return mergeFarm(farm, savedFarm, variables.payload);
            }
            return farm;
          });

          return {
            ...oldData,
            farms: updatedFarms,
          };
        }
      );

      // ✅ بروزرسانی cache detail
      queryClient.setQueryData(
        farmKeys.detail(variables.farmId),
        (oldData) => mergeFarm(oldData, savedFarm, variables.payload)
      );

      // ✅ invalidate برای همگام‌سازی نهایی
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: farmKeys.detail(variables.farmId),
      });
    },
  });
};

// ============================================================
// ✅ ویرایش فقط هندسه مزرعه (لایه)
//
// نکات کلیدی:
// 1. payload فقط شامل geojson و area_ha و polygon_count است.
// 2. سایر فیلدها از farm فعلی سرور خوانده و ارسال می‌شوند
//    تا اطلاعات پاک نشوند (رفع باگ B9).
// 3. پس از موفقیت، دوباره farm را از سرور می‌خوانیم تا
//    cache با داده canonical پر شود (رفع باگ B5).
// 4. اگر fetch دوباره شکست خورد، به payload برمی‌گردیم.
// ============================================================
export const useUpdateFarmGeometryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ farmId, payload }) => {
      if (!farmId) {
        throw new Error('شناسه مزرعه معتبر نیست');
      }

      // 1. خواندن داده‌های کامل فعلی مزرعه
      const currentFarm = await fetchFarmById(farmId);
      if (!currentFarm) {
        throw new Error('اطلاعات مزرعه یافت نشد');
      }

      // 2. ادغام: همه‌ی فیلدهای موجود + هندسه‌ی جدید
      const mergedPayload = {
        // موقعیت
        province: currentFarm.province || null,
        county: currentFarm.county || null,
        bakhsh: currentFarm.bakhsh || null,
        dehestan: currentFarm.dehestan || null,
        village: currentFarm.village || null,

        // کشاورز
        farmer_name: currentFarm.farmer_name,
        national_id: currentFarm.national_id,
        phone_number: currentFarm.phone_number,

        // زمین
        land_type: currentFarm.land_type || null,
        crop: currentFarm.crop || null,
        irrigation_type: currentFarm.irrigation_type || null,

        // ✅ هندسه (فقط این‌ها تغییر می‌کنند)
        geojson: payload.geojson,
        area_ha: Number(payload.area_ha) || 0,
        polygon_count: Number(payload.polygon_count) || 1,

        // شبکه
        project_name: currentFarm.project_name || null,
        coverage_status: currentFarm.coverage_status || null,

        // منابع آب
        water_source: currentFarm.water_source || null,
        irrigation_system: currentFarm.irrigation_system || null,
      };

      // 3. ارسال PUT
      const result = await updateFarm(farmId, mergedPayload);
      return result;
    },

    onSuccess: async (response, variables) => {
      // ✅ مرحله کلیدی: fetch دوباره از سرور برای گرفتن canonical
      try {
        const canonical = await fetchFarmById(variables.farmId);

        if (canonical) {
          // بروزرسانی cache detail با داده canonical سرور
          queryClient.setQueryData(
            farmKeys.detail(variables.farmId),
            canonical
          );

          // بروزرسانی cache لیست
          queryClient.setQueryData(
            farmKeys.list(FARM_LIST_QUERY_PARAMS),
            (oldData) => {
              if (!oldData) return oldData;

              const updatedFarms = (oldData.farms || []).map((farm) =>
                String(farm.farm_id) === String(variables.farmId)
                  ? mergeFarm(farm, canonical, null)
                  : farm
              );

              return {
                ...oldData,
                farms: updatedFarms,
              };
            }
          );
        }
      } catch (err) {
        // Fallback: اگر fetch canonical شکست خورد، payload را اعمال کن
        console.warn(
          'canonical refetch failed, falling back to payload:',
          err
        );

        queryClient.setQueryData(
          farmKeys.detail(variables.farmId),
          (oldData) => mergeFarm(oldData, null, variables.payload)
        );

        queryClient.setQueryData(
          farmKeys.list(FARM_LIST_QUERY_PARAMS),
          (oldData) => {
            if (!oldData) return oldData;
            const updatedFarms = (oldData.farms || []).map((farm) =>
              String(farm.farm_id) === String(variables.farmId)
                ? mergeFarm(farm, null, variables.payload)
                : farm
            );
            return { ...oldData, farms: updatedFarms };
          }
        );
      }

      // invalidate برای همگام‌سازی نهایی
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: farmKeys.detail(variables.farmId),
      });
    },

    onError: (error) => {
      console.error('خطا در ویرایش هندسه:', error);
    },
  });
};

// ============================================
// حذف مزرعه
// ============================================
export const useDeleteFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (farmId) => deleteFarm(farmId),
    onSuccess: (_, farmId) => {
      // ✅ حذف از cache لیست
      queryClient.setQueryData(
        farmKeys.list(FARM_LIST_QUERY_PARAMS),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            farms: (oldData.farms || []).filter(
              (f) => String(f.farm_id) !== String(farmId)
            ),
            total: Math.max(0, (oldData.total || 1) - 1),
          };
        }
      );

      // ✅ حذف از cache detail
      queryClient.removeQueries({
        queryKey: farmKeys.detail(farmId),
      });

      // ✅ invalidate
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() });
    },
  });
};

// ============================================
// هوک ترکیبی
// ============================================
export const useFarmMutation = () => {
  const createMutation = useCreateFarmMutation();
  const updateMutation = useUpdateFarmMutation();
  const deleteMutation = useDeleteFarmMutation();
  const updateGeometryMutation = useUpdateFarmGeometryMutation();

  return {
    // Actions
    createFarm: createMutation.mutateAsync,
    updateFarm: updateMutation.mutateAsync,
    deleteFarm: deleteMutation.mutateAsync,
    updateFarmGeometry: updateGeometryMutation.mutateAsync,

    // Loading
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingGeometry: updateGeometryMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      updateGeometryMutation.isPending,

    // Errors
    error:
      createMutation.error ||
      updateMutation.error ||
      deleteMutation.error ||
      updateGeometryMutation.error,

    // Reset
    reset: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
      updateGeometryMutation.reset();
    },
  };
};