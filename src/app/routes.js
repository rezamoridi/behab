// src/app/routes.js
export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  SETTINGS: '/settings',
  FARMERS: '/farmers',
  CONVERSATIONS: '/conversations',
  LOGIN: '/login',
};

export const PROTECTED_ROUTES = [
  ROUTES.HOME,
  ROUTES.MAP,
  ROUTES.SETTINGS,
  ROUTES.FARMERS,
  ROUTES.CONVERSATIONS,
];

export const PUBLIC_ROUTES = [ROUTES.LOGIN];

// ✅ جدید: نقش‌های مجاز برای هر route
export const ROUTE_ROLES = {
  [ROUTES.HOME]: ['super_admin', 'dehyar'],
  [ROUTES.MAP]: ['super_admin', 'dehyar'],
  [ROUTES.SETTINGS]: ['super_admin'],
  [ROUTES.FARMERS]: ['super_admin'],
  [ROUTES.CONVERSATIONS]: ['super_admin'],
};