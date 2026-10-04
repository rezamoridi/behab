// src/features/dashboard/utils/analytics.js

/**
 * محاسبات آماری داشبورد
 */

// ============================================================
// KPI: کل
// ============================================================
export const getTotalFarms = (farms = []) => farms.length;
export const getTotalFarmers = (farmers = []) => farmers.length;

export const getTotalAreaHa = (farms = []) =>
  farms.reduce((sum, f) => sum + (Number(f.area_ha) || 0), 0);

export const getTotalWaterUsage = (farms = [], crops = []) => {
  const requirementByCrop = {};
  crops.forEach((c) => {
    if (c?.name) requirementByCrop[c.name] = Number(c.requirement) || 0;
  });
  return farms.reduce((sum, farm) => {
    const area = Number(farm.area_ha) || 0;
    const requirement = requirementByCrop[farm.crop] || 0;
    return sum + area * requirement;
  }, 0);
};

export const getActiveCropsCount = (crops = []) =>
  crops.filter((c) => c.is_active).length;

// ============================================================
// ✅ Trend helpers (مقایسه با ماه قبل)
// ============================================================
const getMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

const getCurrentAndPrevMonth = () => {
  const now = new Date();
  const currKey = `${now.getFullYear()}-${now.getMonth()}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`;
  return { currKey, prevKey };
};

/**
 * محاسبه trend: (thisMonth - lastMonth) / lastMonth * 100
 */
export const getFarmTrend = (farms = []) => {
  const { currKey, prevKey } = getCurrentAndPrevMonth();
  let curr = 0;
  let prev = 0;

  farms.forEach((farm) => {
    if (!farm.created_at) return;
    const key = getMonthKey(farm.created_at);
    if (key === currKey) curr++;
    else if (key === prevKey) prev++;
  });

  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
};

export const getFarmerTrend = (farmers = []) => {
  const { currKey, prevKey } = getCurrentAndPrevMonth();
  let curr = 0;
  let prev = 0;

  farmers.forEach((farmer) => {
    if (!farmer.created_at) return;
    const key = getMonthKey(farmer.created_at);
    if (key === currKey) curr++;
    else if (key === prevKey) prev++;
  });

  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
};

// ============================================================
// KPI: ماه جاری
// ============================================================
export const getFarmsThisMonth = (farms = []) => {
  const { currKey } = getCurrentAndPrevMonth();
  return farms.filter((f) => f.created_at && getMonthKey(f.created_at) === currKey).length;
};

export const getActiveFarmersCount = (farmers = []) =>
  farmers.filter((f) => f.password_changed_at !== null).length;

// ============================================================
// توزیع محصولات
// ============================================================
export const getCropDistribution = (farms = []) => {
  const dist = {};
  farms.forEach((farm) => {
    const crop = farm.crop || 'نامشخص';
    dist[crop] = (dist[crop] || 0) + 1;
  });
  return dist;
};

export const getAreaByCrop = (farms = []) => {
  const areaByCrop = {};
  farms.forEach((farm) => {
    const crop = farm.crop || 'نامشخص';
    areaByCrop[crop] = (areaByCrop[crop] || 0) + (Number(farm.area_ha) || 0);
  });
  return areaByCrop;
};

export const getWaterByCrop = (farms = [], crops = []) => {
  const requirementByCrop = {};
  crops.forEach((c) => {
    if (c?.name) requirementByCrop[c.name] = Number(c.requirement) || 0;
  });

  const waterByCrop = {};
  farms.forEach((farm) => {
    const crop = farm.crop || 'نامشخص';
    const area = Number(farm.area_ha) || 0;
    const requirement = requirementByCrop[crop] || 0;
    waterByCrop[crop] = (waterByCrop[crop] || 0) + area * requirement;
  });
  return waterByCrop;
};

// ============================================================
// روند ثبت ۶ ماه
// ============================================================
export const getFarmsTrend = (farms = [], months = 6) => {
  const now = new Date();
  const trend = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();

    const count = farms.filter((farm) => {
      if (!farm.created_at) return false;
      const fd = new Date(farm.created_at);
      return fd.getFullYear() === year && fd.getMonth() === month;
    }).length;

    trend.push({ date: d, count });
  }

  return trend;
};

// ============================================================
// ✅ توزیع استانی (Top N)
// ============================================================
export const getProvinceDistribution = (farms = []) => {
  const dist = {};
  farms.forEach((farm) => {
    const province = farm.province || 'نامشخص';
    if (!dist[province]) dist[province] = { count: 0, area: 0 };
    dist[province].count++;
    dist[province].area += Number(farm.area_ha) || 0;
  });
  return dist;
};

// ============================================================
// ✅ Top Crops (بیشترین مساحت)
// ============================================================
export const getTopCrops = (farms = [], limit = 5) => {
  const areaByCrop = getAreaByCrop(farms);
  return Object.entries(areaByCrop)
    .map(([name, area]) => ({ name, area }))
    .sort((a, b) => b.area - a.area)
    .slice(0, limit);
};

// ============================================================
// وضعیت کشاورزان
// ============================================================
export const getFarmerStatusBreakdown = (farmers = []) => {
  let pending = 0;
  let loggedIn = 0;
  let active = 0;

  farmers.forEach((f) => {
    if (f.password_changed_at) active++;
    else if (f.first_login_at) loggedIn++;
    else pending++;
  });

  return { pending, loggedIn, active };
};

// ============================================================
// Recent
// ============================================================
export const getRecentFarms = (farms = [], n = 5) => {
  return [...farms]
    .filter((f) => f.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, n);
};

export const getRecentFarmers = (farmers = [], n = 5) => {
  return [...farmers]
    .filter((f) => f.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, n);
};

// ============================================================
// فرمت
// ============================================================
export const formatNumber = (num, digits = 0) => {
  if (num === null || num === undefined) return '۰';
  return Number(num).toLocaleString('fa-IR', {
    maximumFractionDigits: digits,
  });
};