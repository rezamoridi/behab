// src/app/App.jsx
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedLayout from './ProtectedLayout';
import ErrorBoundary from '../shared/components/ErrorBoundary/ErrorBoundary';
import LoadingSpinner from '../shared/components/LoadingSpinner/LoadingSpinner';
import { AuthProvider } from '../context/AuthContext';
import { QueryProvider } from '../providers/QueryProvider';
import { ToastProvider } from '../shared/components/Toast/ToastProvider';
import { ConfirmDialogProvider } from '../shared/components/ConfirmDialog/ConfirmDialogProvider';

// ── Lazy-loaded pages ──
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const MapViewPage = lazy(() => import('../pages/MapViewPage'));
const FarmersPage = lazy(() => import('../pages/FarmersPage'));
const ConversationsPage = lazy(() => import('../pages/ConversationsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

const App = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <BrowserRouter>
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedLayout />}>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/map" element={<MapViewPage />} />
                      <Route path="/farmers" element={<FarmersPage />} />
                      <Route
                        path="/conversations"
                        element={<ConversationsPage />}
                      />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
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