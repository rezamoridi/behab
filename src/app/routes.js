// src/app/routes.js
import { lazy } from "react";

// ═══════════════════════════════════════════════════════════
// Route paths
// ═══════════════════════════════════════════════════════════
export const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  MAP: "/map",
  SENTINEL: "/sentinel", // ✅ SENTINEL
  LANDS: "/lands",
  FARMERS: "/farmers",
  AGRI: "/agri",
  CONVERSATIONS: "/conversations",
  SETTINGS: "/settings",
  NO_ACCESS: "/no-access",
};

// ═══════════════════════════════════════════════════════════
// Lazy components
// ═══════════════════════════════════════════════════════════
const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const MapViewPage = lazy(() => import("../pages/MapViewPage"));
const SentinelPage = lazy(() => import("../pages/SentinelPage")); // ✅ SENTINEL
const LandsPage = lazy(() => import("../pages/LandsPage"));
const FarmersPage = lazy(() => import("../pages/FarmersPage"));
const AgriPage = lazy(() => import("../pages/AgriPage"));
const ConversationsPage = lazy(() => import("../pages/ConversationsPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const NoAccessPage = lazy(() => import("../pages/NoAccessPage"));

export const ROUTE_COMPONENTS = {
  [ROUTES.LOGIN]: LoginPage,
  [ROUTES.HOME]: DashboardPage,
  [ROUTES.MAP]: MapViewPage,
  [ROUTES.SENTINEL]: SentinelPage, // ✅ SENTINEL
  [ROUTES.LANDS]: LandsPage,
  [ROUTES.FARMERS]: FarmersPage,
  [ROUTES.AGRI]: AgriPage,
  [ROUTES.CONVERSATIONS]: ConversationsPage,
  [ROUTES.SETTINGS]: SettingsPage,
  [ROUTES.NO_ACCESS]: NoAccessPage,
};

// ═══════════════════════════════════════════════════════════
// Route definitions — با permission داینامیک
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
    permission: ["dashboard", "view"],
    isPublic: false,
    redirectTo: ROUTES.NO_ACCESS,
  },

  // ─── نقشه ───
  {
    path: ROUTES.MAP,
    Component: ROUTE_COMPONENTS[ROUTES.MAP],
    permission: ["map", "view"],
    isPublic: false,
    redirectTo: null,
  },

  // ✅ SENTINEL — صفحه جستجو/کتابخانه/وضعیت
  {
    path: ROUTES.SENTINEL,
    Component: ROUTE_COMPONENTS[ROUTES.SENTINEL],
    permission: ["sentinel", "view"],
    isPublic: false,
    redirectTo: ROUTES.NO_ACCESS,
  },

  // ─── مدیریت زمین‌ها ───
  {
    path: ROUTES.LANDS,
    Component: ROUTE_COMPONENTS[ROUTES.LANDS],
    permission: ["map", "view"],
    isPublic: false,
    redirectTo: null,
  },

  // ─── کشاورزان ───
  {
    path: ROUTES.FARMERS,
    Component: ROUTE_COMPONENTS[ROUTES.FARMERS],
    permission: ["farmer", "view_own"],
    isPublic: false,
    redirectTo: null,
  },

  // ─── کشاورزی ───
  {
    path: ROUTES.AGRI,
    Component: ROUTE_COMPONENTS[ROUTES.AGRI],
    permission: ["input", "view"],
    isPublic: false,
    redirectTo: null,
  },

  // ─── گفتگو ───
  {
    path: ROUTES.CONVERSATIONS,
    Component: ROUTE_COMPONENTS[ROUTES.CONVERSATIONS],
    permission: ["sms", "send"],
    isPublic: false,
    redirectTo: null,
  },

  // ─── تنظیمات ───
  {
    path: ROUTES.SETTINGS,
    Component: ROUTE_COMPONENTS[ROUTES.SETTINGS],
    permission: ["settings", "view"],
    isPublic: false,
    redirectTo: null,
  },
  {
    path: ROUTES.SENTINEL,
    Component: ROUTE_COMPONENTS[ROUTES.SENTINEL],
    permission: ["sentinel", "view"],
    isPublic: false,
    redirectTo: null,
  },
];
