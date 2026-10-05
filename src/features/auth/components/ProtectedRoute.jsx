// src/features/auth/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * ProtectedRoute — محافظت از routeها بر اساس نقش.
 *
 * استفاده در App.jsx:
 *   <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
 *     <Route path="/settings" element={<SettingsPage />} />
 *   </Route>
 */
const ProtectedRoute = ({
  allowedRoles = [],
  redirectTo = '/map',
}) => {
  const { role } = usePermissions();

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;