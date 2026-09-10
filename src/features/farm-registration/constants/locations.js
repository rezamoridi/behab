// src/features/farm-registration/constants/locations.js
import {
  locations,
  getProvinces,
  getCounties,
  getBakhshs,
  getDehestans,
  getVillages,
} from '../../../config';

// Re-export برای استفاده در کامپوننت‌ها
export {
  getProvinces,
  getCounties,
  getBakhshs,
  getDehestans,
  getVillages,
};

// خروجی کامل برای دیباگ
export const LOCATIONS_DATA = locations;

// فقط لرستان
export const PROVINCES = getProvinces();