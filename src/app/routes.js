// src/app/routes.js
export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  SETTINGS: '/settings',
  FARMERS: '/farmers', // ✅ جدید
  LOGIN: '/login',
};

export const PROTECTED_ROUTES = [
  ROUTES.HOME,
  ROUTES.MAP,
  ROUTES.SETTINGS,
  ROUTES.FARMERS, // ✅ جدید
];

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
];