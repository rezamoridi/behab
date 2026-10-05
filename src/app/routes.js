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