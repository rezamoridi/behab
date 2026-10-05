// src/features/auth/hooks/usePermissions.js
import { useMemo } from 'react';
import { useAuth } from '../../../context/useAuth';

// ═══════════════════════════════════════════════════════════
// Permission map per role
// ═══════════════════════════════════════════════════════════
const ROLE_PERMISSIONS = {
  super_admin: new Set(['*']),

  manager: new Set([
    // Dashboard
    'dashboard:view_region',

    // Map
    'map:view',
    'map:draw',
    'map:snap',
    'map:regions_view',

    // Farm — region-scoped
    'farm:create',
    'farm:view',
    'farm:edit_region',
    'farm:delete_region',

    // Farmer — region-scoped
    'farmer:create',
    'farmer:view_region',
    'farmer:edit_region',
    'farmer:delete_region',
    'farmer:resend_invitation',

    // Crop — read-only
    'crop:view',

    // Region — view own
    'region:view_own',

    // Profile
    'profile:view',
    'profile:edit',
  ]),

  dehyar: new Set([
    'dashboard:view_own',
    'map:view',
    'map:draw',
    'map:snap',
    'farm:create',
    'farm:view',
    'farm:edit_own',
    'farm:delete_own',
    'farmer:create',
    'farmer:view_own',
    'farmer:edit_own',
    'farmer:delete_own',
    'farmer:resend_invitation',
    'crop:view',
    'region:view_own',
    'profile:view',
    'profile:edit',
  ]),

  // ✅ جدید: اپراتور میدانی — فقط ثبت، بدون ویرایش/حذف
  operator: new Set([
    'dashboard:view_region',
    'map:view',
    'map:draw',
    'map:snap',

    // فقط ثبت مزرعه/کشاورز
    'farm:create',
    'farm:view',
    // ❌ بدون farm:edit_*
    // ❌ بدون farm:delete_*

    'farmer:create',
    'farmer:view_region',
    // ❌ بدون farmer:edit_*
    // ❌ بدون farmer:delete_*
    // ❌ بدون farmer:resend_invitation

    'crop:view',
    'region:view_own',
    'profile:view',
    'profile:edit',
  ]),
};

// ═══════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════
export const usePermissions = () => {
  const { user } = useAuth();

  const role = user?.role || 'dehyar';

  const permissionSet = useMemo(
    () => ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.dehyar,
    [role],
  );

  const isSuperAdmin = role === 'super_admin';
  const isManager = role === 'manager';
  const isDehyar = role === 'dehyar';
  const isOperator = role === 'operator';   // ✅

  const can = (permission) => {
    if (!permission) return false;
    if (permissionSet.has('*')) return true;
    if (permissionSet.has(permission)) return true;

    const [resource] = permission.split(':');
    if (permissionSet.has(`${resource}:*`)) return true;

    return false;
  };

  const canAll = (permissions = []) =>
    permissions.every((p) => can(p));

  const canAny = (permissions = []) =>
    permissions.some((p) => can(p));

  /**
   * بررسی مالکیت — آیا این resource در scope کاربر است؟
   * - super_admin: همیشه true
   * - manager/operator: بر اساس region_ids
   * - dehyar: بر اساس region_ids یا created_by_user_id
   */
  const isOwner = (resource) => {
    if (isSuperAdmin) return true;
    if (!resource || !user?.id) return false;

    // اگر resource region دارد
    if (resource.region_id != null) {
      const userRegionIds = user?.region_ids || [];
      return userRegionIds.includes(resource.region_id);
    }

    // fallback: مالکیت
    return resource.created_by_user_id === user.id;
  };

  return {
    role,
    user,
    can,
    canAll,
    canAny,
    isOwner,
    isSuperAdmin,
    isManager,
    isDehyar,
    isOperator,   // ✅
    // برای استفاده در UI
    isRegionScoped: isManager || isDehyar || isOperator,
  };
};

export default usePermissions;