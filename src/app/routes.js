// src/app/routes.js
import { lazy } from 'react';

// ═══════════════════════════════════════════════════════════
// Route paths
// ═══════════════════════════════════════════════════════════
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  MAP: '/map',
  FARMERS: '/farmers',
  AGRI: '/agri',
  CONVERSATIONS: '/conversations',
  SETTINGS: '/settings',
  NO_ACCESS: '/no-access',      // ✅ جدید
};

// ═══════════════════════════════════════════════════════════
// Lazy components
// ═══════════════════════════════════════════════════════════
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const MapViewPage = lazy(() => import('../pages/MapViewPage'));
const FarmersPage = lazy(() => import('../pages/FarmersPage'));
const AgriPage = lazy(() => import('../pages/AgriPage'));
const ConversationsPage = lazy(
  () => import('../pages/ConversationsPage'),
);
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NoAccessPage = lazy(() => import('../pages/NoAccessPage'));   // ✅ جدید

export const ROUTE_COMPONENTS = {
  [ROUTES.LOGIN]: LoginPage,
  [ROUTES.HOME]: DashboardPage,
  [ROUTES.MAP]: MapViewPage,
  [ROUTES.FARMERS]: FarmersPage,
  [ROUTES.AGRI]: AgriPage,
  [ROUTES.CONVERSATIONS]: ConversationsPage,
  [ROUTES.SETTINGS]: SettingsPage,
  [ROUTES.NO_ACCESS]: NoAccessPage,    // ✅ جدید
};

// ═══════════════════════════════════════════════════════════
// Route definitions — با permission داینامیک
//
// ساختار هر ردیف:
//   path: string
//   Component: React.lazy
//   permission: [resource, action] | null
//     - null → همه کاربران لاگین‌شده
//   isPublic: boolean
//   redirectTo: string | null
//     - null → fallback هوشمند (داشبورد یا no-access)
//     - string → مسیر مشخص
// ═══════════════════════════════════════════════════════════
export const ROUTE_DEFINITIONS = [
  // ─── عمومی (بدون احراز هویت) ───
  {
    path: ROUTES.LOGIN,
    Component: ROUTE_COMPONENTS[ROUTES.LOGIN],
    permission: null,
    isPublic: true,
  },

  // ─── No Access (همه لاگین‌شده‌ها) ───
  {
    path: ROUTES.NO_ACCESS,
    Component: ROUTE_COMPONENTS[ROUTES.NO_ACCESS],
    permission: null,
    isPublic: false,
  },

  // ─── داشبورد ───
  {
    path: ROUTES.HOME,
    Component: ROUTE_COMPONENTS[ROUTES.HOME],
    permission: ['dashboard', 'view'],
    isPublic: false,
    // اگر dashboard.view نداشت → مستقیم به no-access
    // (چون fallback هوشمند به داشبورد برمی‌گردد و loop می‌شود)
    redirectTo: ROUTES.NO_ACCESS,
  },

  // ─── نقشه ───
  {
    path: ROUTES.MAP,
    Component: ROUTE_COMPONENTS[ROUTES.MAP],
    permission: ['map', 'view'],
    isPublic: false,
    // ✅ fallback هوشمند:
    //   اگر داشبورد دارد → /
    //   اگر نه → /no-access
    redirectTo: null,
  },

  // ─── کشاورزان ───
  {
    path: ROUTES.FARMERS,
    Component: ROUTE_COMPONENTS[ROUTES.FARMERS],
    permission: ['farmer', 'view_own'],
    isPublic: false,
    redirectTo: null,    // fallback هوشمند
  },

  // ─── کشاورزی (محصولات + نهاده‌ها) ───
  {
    path: ROUTES.AGRI,
    Component: ROUTE_COMPONENTS[ROUTES.AGRI],
    permission: ['input', 'view'],
    isPublic: false,
    redirectTo: null,    // fallback هوشمند
  },

  // ─── گفتگو ───
  {
    path: ROUTES.CONVERSATIONS,
    Component: ROUTE_COMPONENTS[ROUTES.CONVERSATIONS],
    permission: ['sms', 'send'],
    isPublic: false,
    redirectTo: null,    // fallback هوشمند
  },

  // ─── تنظیمات ───
  {
    path: ROUTES.SETTINGS,
    Component: ROUTE_COMPONENTS[ROUTES.SETTINGS],
    permission: ['settings', 'view'],
    isPublic: false,
    redirectTo: null,    // fallback هوشمند
  },
];