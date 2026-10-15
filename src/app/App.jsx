// src/app/App.jsx
import { Suspense, useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import ProtectedLayout from './ProtectedLayout';
import ErrorBoundary from '../shared/components/ErrorBoundary/ErrorBoundary';
import LoadingSpinner from '../shared/components/LoadingSpinner/LoadingSpinner';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { QueryProvider } from '../providers/QueryProvider';
import { ToastProvider } from '../shared/components/Toast/ToastProvider';
import { ConfirmDialogProvider } from '../shared/components/ConfirmDialog/ConfirmDialogProvider';

import { ROUTE_DEFINITIONS, ROUTES } from './routes';

// ═══════════════════════════════════════════════════════════
// ساخت route های محافظت‌شده بر اساس roles
//
// هر گروه از route ها که roles یکسان دارند → یک ProtectedRoute
// والد مشترک می‌گیرند (تا کد تکراری نباشد).
// ═══════════════════════════════════════════════════════════
const useGroupedRoutes = () => {
  return useMemo(() => {
    const publicRoutes = [];
    // Map از roles-serialized → { roles, redirectTo, routes }
    const groupedProtected = new Map();

    for (const def of ROUTE_DEFINITIONS) {
      if (def.isPublic) {
        publicRoutes.push(def);
        continue;
      }

      // ساخت کلید یکتا بر اساس roles + redirectTo
      const key = JSON.stringify({
        roles: def.roles || null,
        redirectTo: def.redirectTo || null,
      });

      if (!groupedProtected.has(key)) {
        groupedProtected.set(key, {
          roles: def.roles || null,
          redirectTo: def.redirectTo || ROUTES.MAP,
          routes: [],
        });
      }

      groupedProtected.get(key).routes.push(def);
    }

    return {
      publicRoutes,
      protectedGroups: Array.from(groupedProtected.values()),
    };
  }, []);
};

const App = () => {
  const { publicRoutes, protectedGroups } = useGroupedRoutes();

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* ─── عمومی ─── */}
                    {publicRoutes.map(({ path, Component }) => (
                      <Route
                        key={path}
                        path={path}
                        element={<Component />}
                      />
                    ))}

                    {/* ─── محافظت‌شده ─── */}
                    <Route element={<ProtectedLayout />}>
                      {protectedGroups.map((group, idx) => {
                        const { roles, redirectTo, routes } = group;

                        // گروه بدون محدودیت نقش → همه لاگین‌شده‌ها
                        if (!roles || roles.length === 0) {
                          return routes.map(({ path, Component }) => (
                            <Route
                              key={`${idx}-${path}`}
                              path={path}
                              element={<Component />}
                            />
                          ));
                        }

                        // گروه با محدودیت نقش → ProtectedRoute
                        return (
                          <Route
                            key={`group-${idx}`}
                            element={
                              <ProtectedRoute
                                allowedRoles={roles}
                                redirectTo={redirectTo}
                              />
                            }
                          >
                            {routes.map(({ path, Component }) => (
                              <Route
                                key={`${idx}-${path}`}
                                path={path}
                                element={<Component />}
                              />
                            ))}
                          </Route>
                        );
                      })}
                    </Route>

                    {/* ─── fallback ─── */}
                    <Route
                      path="*"
                      element={<Navigate to={ROUTES.HOME} replace />}
                    />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ConfirmDialogProvider>
          </ToastProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;