// src/features/auth/hooks/usePermissions.js
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import apiClient from '../../../services/api/apiClient';

// ═══════════════════════════════════════════════════════════
// Query Key
// ═══════════════════════════════════════════════════════════
export const permissionKeys = {
  all: ['permissions'],
  me: () => [...permissionKeys.all, 'me'],
};

// ═══════════════════════════════════════════════════════════
// Query — GET /users/me/permissions
//
// backend permissions نقش را برمی‌گرداند.
// با هر تغییر role از پنل، این query باید invalidate شود.
// ═══════════════════════════════════════════════════════════
export const useMyPermissionsQuery = ({ enabled = true } = {}) => {
  return useQuery({
    queryKey: permissionKeys.me(),
    queryFn: async () => {
      const response = await apiClient.get('/users/me/permissions');
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000,
  });
};

// ═══════════════════════════════════════════════════════════
// Hook اصلی
// ═══════════════════════════════════════════════════════════
export const usePermissions = () => {
  const { user } = useAuth();
  const { data: permsData, isLoading: isLoadingPerms } =
    useMyPermissionsQuery({ enabled: !!user });

  const role = user?.role || permsData?.role || 'dehyar';
  const isSuperAdmin = role === 'super_admin';
  const isManager = role === 'manager';
  const isDehyar = role === 'dehyar';
  const isOperator = role === 'operator';

  // ── permissions از backend ──
  const permissionsMap = useMemo(() => {
    if (!permsData?.permissions) return {};
    return permsData.permissions;
  }, [permsData]);

  // ═══════════════════════════════════════════════════════════
  // can(resource, action) — بررسی مجوز پایه
  //
  // مثال:
  //   can('farm', 'create')
  //   can('farm', 'edit_own')
  //   can('farmer', 'view_own')
  // ═══════════════════════════════════════════════════════════
  const can = useCallback(
    (resource, action) => {
      if (!resource || !action) return false;

      // super_admin → همه چیز
      if (isSuperAdmin) return true;

      // wildcard بررسی
      if (
        permissionsMap['*'] &&
        Array.isArray(permissionsMap['*']) &&
        (permissionsMap['*'].includes('*') ||
          permissionsMap['*'].includes(action))
      ) {
        return true;
      }

      const resourcePerms = permissionsMap[resource];
      if (!Array.isArray(resourcePerms)) return false;

      if (resourcePerms.includes('*')) return true;
      return resourcePerms.includes(action);
    },
    [isSuperAdmin, permissionsMap],
  );

  // ═══════════════════════════════════════════════════════════
  // canMany — هر دو شکل را پشتیبانی می‌کند:
  //   canMany([['farm', 'create'], ['farmer', 'create']])
  //   canMany(['farm:create', 'farmer:create'])
  // ═══════════════════════════════════════════════════════════
  const canMany = useCallback(
    (items = []) =>
      items.every((item) => {
        if (Array.isArray(item)) {
          return can(item[0], item[1]);
        }
        if (typeof item === 'string') {
          const [resource, action] = item.split(':');
          return can(resource, action);
        }
        return false;
      }),
    [can],
  );

  const canAny = useCallback(
    (items = []) =>
      items.some((item) => {
        if (Array.isArray(item)) {
          return can(item[0], item[1]);
        }
        if (typeof item === 'string') {
          const [resource, action] = item.split(':');
          return can(resource, action);
        }
        return false;
      }),
    [can],
  );

  // ═══════════════════════════════════════════════════════════
  // isOwnerOf(resource)
  //
  // مالکیت محض — بر اساس created_by_user_id
  //   - super_admin → همیشه true
  //   - بقیه → created_by_user_id === user.id
  // ═══════════════════════════════════════════════════════════
  const isOwnerOf = useCallback(
    (resource) => {
      if (!resource) return false;
      if (isSuperAdmin) return true;
      if (!user?.id) return false;

      return (
        resource.created_by_user_id != null &&
        resource.created_by_user_id === user.id
      );
    },
    [isSuperAdmin, user?.id],
  );

  // ═══════════════════════════════════════════════════════════
  // canViewFullData(resource)
  //
  // آیا کاربر دادهٔ کامل را می‌بیند؟
  //   - super_admin: بله
  //   - صاحب: بله
  //   - بقیه: بستگی به grant دارد — که فرانت نمی‌داند
  //     (بک‌اند تصمیم می‌گیرد و دادهٔ کامل یا لایه برمی‌گرداند)
  //
  // ⚠️ این تابع صرفاً یک hint UI است. تصمیم نهایی در backend.
  // ═══════════════════════════════════════════════════════════
  const canViewFullData = useCallback(
    (resource) => isOwnerOf(resource),
    [isOwnerOf],
  );

  // ═══════════════════════════════════════════════════════════
  // canViewReferenceLayer()
  // ═══════════════════════════════════════════════════════════
  const canViewReferenceLayer = useCallback(
    () => can('farm', 'view_reference_layer'),
    [can],
  );

  // ═══════════════════════════════════════════════════════════
  // نام قدیمی — backward compatibility
  // ═══════════════════════════════════════════════════════════
  const isOwner = isOwnerOf;

  return {
    role,
    user,

    // ✅ جدید: can(resource, action)
    can,
    canMany,
    canAny,

    // مالکیت
    isOwnerOf,
    canViewFullData,
    canViewReferenceLayer,

    // backward compatibility
    isOwner,

    // نقش‌ها
    isSuperAdmin,
    isManager,
    isDehyar,
    isOperator,

    // Loading
    isLoadingPermissions: isLoadingPerms,

    // Permissions خام (برای دیباگ)
    permissionsMap,

    // نشانهٔ سازگاری
    isRegionScoped: isManager || isDehyar || isOperator,
  };
};

export default usePermissions;