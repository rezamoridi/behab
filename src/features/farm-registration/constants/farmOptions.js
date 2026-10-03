// src/features/farm-registration/constants/farmOptions.js
import {
  getLandTypes,
  getWaterSources,
  getIrrigationSystems,
  getIrrigationTypes,
  getCoverageStatuses,
  getStudyAreas,
  getWaterRequirementPerHa,
} from '../../../config';

export {
  getLandTypes,
  getWaterSources,
  getIrrigationSystems,
  getIrrigationTypes,
  getCoverageStatuses,
  getStudyAreas,
  getWaterRequirementPerHa,
};


// ============================================
// Tab Configuration
// ============================================
export const FARM_FORM_TABS = [
  { id: 'location', label: 'موقعیت' },
  { id: 'farmer', label: 'کشاورز' },
  { id: 'land', label: 'زمین' },
  { id: 'water', label: 'شبکه' },
];