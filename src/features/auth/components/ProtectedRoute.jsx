// src/features/auth/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../../../context/useAuth';
import LoadingSpinner from '../../../shared/components/LoadingSpinner/LoadingSpinner';
import { ROUTES } from '../../../app/routes';

/**
 * ProtectedRoute — با fallback هوشمند
 *
 * اگر کاربر لاگین نباشد → به صفحه ورود (/login)
 * اگر لاگین باشد ولی به permission اصلی دسترسی نداشته باشد:
 *   ۱. اگر به داشبورد دسترسی دارد → /
 *   ۲. اگر نه → /no-access
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
  const { isAuthenticated } = useAuth();
  const { can, isLoadingPermissions } = usePermissions();

  // ⏳ منتظر fetch permissions (فقط اگر کاربر لاگین باشد)
  if (isAuthenticated && isLoadingPermissions) {
    return <LoadingSpinner fullScreen />;
  }

  // 🚫 کاربر لاگین نیست → هدایت به صفحه ورود
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
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
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Navigate to={ROUTES.NO_ACCESS} replace />;
};

export default ProtectedRoute;