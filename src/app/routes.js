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
  CONVERSATIONS: '/conversations',
  SETTINGS: '/settings',
};

// ═══════════════════════════════════════════════════════════
// نقش‌های مجاز برای هر route
//
// ⚠️ قاعده:
//   - HOME و MAP: همه نقش‌ها
//   - FARMERS: super_admin + manager + operator
//     (dehyar از داک پنهان است ولی دسترسی مستقیم محدود به scope خودش)
//   - SETTINGS و CONVERSATIONS: فقط super_admin
// ═══════════════════════════════════════════════════════════
export const ROUTE_ROLES = {
  [ROUTES.HOME]: ['super_admin', 'manager', 'dehyar', 'operator'],
  [ROUTES.MAP]: ['super_admin', 'manager', 'dehyar', 'operator'],
  [ROUTES.FARMERS]: ['super_admin', 'manager', 'operator'],
  [ROUTES.CONVERSATIONS]: ['super_admin'],
  [ROUTES.SETTINGS]: ['super_admin'],
};

// ═══════════════════════════════════════════════════════════
// Lazy-loaded page components
//
// هر route → کامپوننت آن
// ═══════════════════════════════════════════════════════════
const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const MapViewPage = lazy(() => import('../pages/MapViewPage'));
const FarmersPage = lazy(() => import('../pages/FarmersPage'));
const ConversationsPage = lazy(() => import('../pages/ConversationsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));

export const ROUTE_COMPONENTS = {
  [ROUTES.LOGIN]: LoginPage,
  [ROUTES.HOME]: DashboardPage,
  [ROUTES.MAP]: MapViewPage,
  [ROUTES.FARMERS]: FarmersPage,
  [ROUTES.CONVERSATIONS]: ConversationsPage,
  [ROUTES.SETTINGS]: SettingsPage,
};

// ═══════════════════════════════════════════════════════════
// Route definitions
//
// ساختار هر ردیف:
//   {
//     path: string,           ← مسیر
//     Component: React.lazy,  ← کامپوننت
//     roles: string[] | null, ← نقش‌های مجاز (null = همه لاگین‌شده‌ها)
//     isPublic: boolean,      ← بدون احراز هویت
//     redirectTo: string,     ← مسیر fallback اگر نقش مجاز نبود
//   }
//
// ⚠️ این تنها منبع حقیقت برای مسیرهاست.
// ═══════════════════════════════════════════════════════════
export const ROUTE_DEFINITIONS = [
  // ─── عمومی (بدون احراز هویت) ───
  {
    path: ROUTES.LOGIN,
    Component: ROUTE_COMPONENTS[ROUTES.LOGIN],
    roles: null,
    isPublic: true,
  },

  // ─── محافظت‌شده (همه نقش‌ها) ───
  {
    path: ROUTES.HOME,
    Component: ROUTE_COMPONENTS[ROUTES.HOME],
    roles: ROUTE_ROLES[ROUTES.HOME],
    isPublic: false,
  },
  {
    path: ROUTES.MAP,
    Component: ROUTE_COMPONENTS[ROUTES.MAP],
    roles: ROUTE_ROLES[ROUTES.MAP],
    isPublic: false,
  },

  // ─── محافظت‌شده (super_admin + manager + operator) ───
  {
    path: ROUTES.FARMERS,
    Component: ROUTE_COMPONENTS[ROUTES.FARMERS],
    roles: ROUTE_ROLES[ROUTES.FARMERS],
    isPublic: false,
    redirectTo: ROUTES.MAP,
  },

  // ─── محافظت‌شده (فقط super_admin) ───
  {
    path: ROUTES.CONVERSATIONS,
    Component: ROUTE_COMPONENTS[ROUTES.CONVERSATIONS],
    roles: ROUTE_ROLES[ROUTES.CONVERSATIONS],
    isPublic: false,
    redirectTo: ROUTES.MAP,
  },
  {
    path: ROUTES.SETTINGS,
    Component: ROUTE_COMPONENTS[ROUTES.SETTINGS],
    roles: ROUTE_ROLES[ROUTES.SETTINGS],
    isPublic: false,
    redirectTo: ROUTES.MAP,
  },
];