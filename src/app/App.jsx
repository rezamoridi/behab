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
// NoAccessPage — وقتی کاربر به هیچ صفحه‌ای دسترسی ندارد
// ═══════════════════════════════════════════════════════════
const NoAccessPage = () => (
  <div
    className="min-h-screen flex items-center justify-center p-6 pt-24"
    dir="rtl"
  >
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 text-xl">
        🚫
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-2">
        دسترسی محدود
      </h2>
      <p className="text-xs text-gray-500 leading-relaxed">
        شما به هیچ بخشی از سیستم دسترسی ندارید. لطفاً با مدیر
        ارشد تماس بگیرید.
      </p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// Group routes by permission
//
// routes با permission یکسان → یک ProtectedRoute مشترک
// ═══════════════════════════════════════════════════════════
const useGroupedRoutes = () => {
  return useMemo(() => {
    const publicRoutes = [];
    const groupedProtected = new Map();

    for (const def of ROUTE_DEFINITIONS) {
      if (def.isPublic) {
        publicRoutes.push(def);
        continue;
      }

      // کلید یکتا بر اساس permission + redirectTo
      const key = JSON.stringify({
        permission: def.permission || null,
        redirectTo: def.redirectTo || null,
      });

      if (!groupedProtected.has(key)) {
        groupedProtected.set(key, {
          permission: def.permission || null,
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

// ═══════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════
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
                        const {
                          permission,
                          redirectTo,
                          routes,
                        } = group;

                        // بدون permission → همه
                        if (!permission) {
                          return routes.map(
                            ({ path, Component }) => (
                              <Route
                                key={`${idx}-${path}`}
                                path={path}
                                element={<Component />}
                              />
                            )
                          );
                        }

                        // با permission → ProtectedRoute
                        return (
                          <Route
                            key={`group-${idx}`}
                            element={
                              <ProtectedRoute
                                permission={permission}
                                redirectTo={redirectTo}
                              />
                            }
                          >
                            {routes.map(
                              ({ path, Component }) => (
                                <Route
                                  key={`${idx}-${path}`}
                                  path={path}
                                  element={<Component />}
                                />
                              )
                            )}
                          </Route>
                        );
                      })}
                    </Route>

                    {/* ─── No Access ─── */}
                    <Route
                      path="/no-access"
                      element={<NoAccessPage />}
                    />

                    {/* ─── Fallback ─── */}
                    <Route
                      path="*"
                      element={
                        <Navigate to={ROUTES.HOME} replace />
                      }
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