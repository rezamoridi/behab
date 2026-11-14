// src/app/routes.js
import { lazy } from "react";

// ═══════════════════════════════════════════════════════════
// Route paths
// ═══════════════════════════════════════════════════════════
export const ROUTES = {
  LOGIN: "/login",
  LANDING: "/home", // ✅ صفحه معرفی (عمومی)
  HOME: "/", // ✅ داشبورد (نیازمند لاگین)
  MAP: "/map",
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
const LandingPage = lazy(() => import("../pages/HomePage")); // ✅ لندینگ
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const MapViewPage = lazy(() => import("../pages/MapViewPage"));
const LandsPage = lazy(() => import("../pages/LandsPage"));
const FarmersPage = lazy(() => import("../pages/FarmersPage"));
const AgriPage = lazy(() => import("../pages/AgriPage"));
const ConversationsPage = lazy(() => import("../pages/ConversationsPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const NoAccessPage = lazy(() => import("../pages/NoAccessPage"));

export const ROUTE_COMPONENTS = {
  [ROUTES.LOGIN]: LoginPage,
  [ROUTES.LANDING]: LandingPage, // ✅
  [ROUTES.HOME]: DashboardPage,
  [ROUTES.MAP]: MapViewPage,
  [ROUTES.LANDS]: LandsPage,
  [ROUTES.FARMERS]: FarmersPage,
  [ROUTES.AGRI]: AgriPage,
  [ROUTES.CONVERSATIONS]: ConversationsPage,
  [ROUTES.SETTINGS]: SettingsPage,
  [ROUTES.NO_ACCESS]: NoAccessPage,
};

// ═══════════════════════════════════════════════════════════
// Route definitions
// ═══════════════════════════════════════════════════════════
export const ROUTE_DEFINITIONS = [
  // ─── عمومی (بدون احراز هویت) ───
  {
    path: ROUTES.LANDING, // ✅ مسیر لندینگ عمومی
    Component: ROUTE_COMPONENTS[ROUTES.LANDING],
    permission: null,
    isPublic: true,
  },
  {
    path: ROUTES.LOGIN,
    Component: ROUTE_COMPONENTS[ROUTES.LOGIN],
    permission: null,
    isPublic: true,
  },

  // ─── No Access ───
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
];
