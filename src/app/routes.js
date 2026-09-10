// src/app/routes.js
export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  SETTINGS: '/settings',
  LOGIN: '/login',
};

export const PROTECTED_ROUTES = [
  ROUTES.HOME,
  ROUTES.MAP,
  ROUTES.SETTINGS,
];

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
];