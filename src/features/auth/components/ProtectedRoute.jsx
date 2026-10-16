// src/features/auth/components/ProtectedRoute.jsx — بازنویسی کامل
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../../../shared/components/LoadingSpinner/LoadingSpinner';

/**
 * ProtectedRoute — با fallback هوشمند
 *
 * اگر کاربر به permission اصلی دسترسی نداشت:
 *   ۱. اگر به داشبورد دسترسی دارد → `/`
 *   ۲. اگر نه → `/no-access`
 *
 * props:
 *   permission: [resource, action] | null
 *   redirectTo: مسیر دلخواه (اختیاری). اگر null باشد،
 *               از fallback هوشمند استفاده می‌شود.
 */
const ProtectedRoute = ({
  permission = null,
  redirectTo = null,
}) => {
  const { can, isLoadingPermissions } = usePermissions();

  // ⏳ منتظر fetch permissions
  if (isLoadingPermissions) {
    return <LoadingSpinner fullScreen />;
  }

  // بدون permission → دسترسی آزاد
  if (!permission) {
    return <Outlet />;
  }

  const [resource, action] = permission;

  // ✅ دسترسی دارد
  if (can(resource, action)) {
    return <Outlet />;
  }

  // ❌ دسترسی ندارد → fallback
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Fallback هوشمند:
  // اگر به داشبورد دسترسی دارد → داشبورد
  // وگرنه → no-access
  const hasDashboard = can('dashboard', 'view');
  if (hasDashboard) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/no-access" replace />;
};

export default ProtectedRoute;