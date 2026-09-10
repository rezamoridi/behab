// src/features/settings/hooks/useProfileSettings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../../services/api/settingsApi';

// ============================================
// Query Keys
// ============================================
export const profileKeys = {
  all: ['profile'],
  detail: () => [...profileKeys.all, 'detail'],
};

// ============================================
// دریافت پروفایل
// ============================================
export const useProfileQuery = () => {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const response = await settingsApi.getProfile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================
// به‌روزرسانی پروفایل
// ============================================
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await settingsApi.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
    },
  });
};

// ============================================
// تغییر رمز عبور
// ============================================
export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (passwords) => settingsApi.changePassword(passwords),
  });
};

// ============================================
// Hook ترکیبی
// ============================================
export const useProfileSettings = () => {
  const profileQuery = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();
  const passwordMutation = useChangePasswordMutation();

  const updateProfile = async (data) => {
    try {
      await updateMutation.mutateAsync(data);
      alert('اطلاعات با موفقیت ذخیره شد.');
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
          err?.message ||
          'خطا در ذخیره اطلاعات'
      );
      throw err;
    }
  };

  const changePassword = async (passwords) => {
    try {
      await passwordMutation.mutateAsync(passwords);
      alert('رمز عبور با موفقیت تغییر یافت.');
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
          err?.message ||
          'خطا در تغییر رمز عبور'
      );
      throw err;
    }
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile,
    changePassword,
    isUpdating: updateMutation.isPending,
    isChangingPassword: passwordMutation.isPending,
  };
};