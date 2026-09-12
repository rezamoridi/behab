// src/config/index.js
import locationsData from './locations.json';
import farmOptionsData from './farmOptions.json';

// ============================================
// Locations
// ============================================
export const locations = locationsData;

// ============================================
// Farm Options
// ============================================
export const farmOptions = farmOptionsData;

// ============================================
// Helper Functions - Locations
// ============================================

export const getProvinces = () =>
  locations.provinces.map((p) => ({ id: p.id, name: p.name }));

export const getCounties = (provinceName) => {
  const province = locations.provinces.find((p) => p.name === provinceName);
  return province ? province.counties.map((c) => ({ id: c.id, name: c.name })) : [];
};

export const getBakhshs = (provinceName, countyName) => {
  const province = locations.provinces.find((p) => p.name === provinceName);
  if (!province) return [];
  const county = province.counties.find((c) => c.name === countyName);
  return county ? county.bakhshs.map((b) => ({ id: b.id, name: b.name })) : [];
};

export const getDehestans = (provinceName, countyName, bakhshName) => {
  const province = locations.provinces.find((p) => p.name === provinceName);
  if (!province) return [];
  const county = province.counties.find((c) => c.name === countyName);
  if (!county) return [];
  const bakhsh = county.bakhshs.find((b) => b.name === bakhshName);
  return bakhsh ? bakhsh.dehestans.map((d) => ({ id: d.id, name: d.name })) : [];
};

export const getVillages = (provinceName, countyName, bakhshName, dehestanName) => {
  const province = locations.provinces.find((p) => p.name === provinceName);
  if (!province) return [];
  const county = province.counties.find((c) => c.name === countyName);
  if (!county) return [];
  const bakhsh = county.bakhshs.find((b) => b.name === bakhshName);
  if (!bakhsh) return [];
  const dehestan = bakhsh.dehestans.find((d) => d.name === dehestanName);
  return dehestan ? dehestan.villages.map((v) => ({ id: v.id, name: v.name })) : [];
};

// ============================================
// Helper Functions - Farm Options
// ============================================

export const getLandTypes = () => farmOptions.landTypes;
export const getCrops = () => farmOptions.crops;
export const getWaterSources = () => farmOptions.waterSources;
export const getIrrigationSystems = () => farmOptions.irrigationSystems;
export const getIrrigationTypes = () => farmOptions.irrigationTypes;
export const getCoverageStatuses = () => farmOptions.coverageStatuses;
export const getStudyAreas = () => farmOptions.studyAreas;
export const getWaterRequirementPerHa = () => farmOptions.waterRequirementPerHa;