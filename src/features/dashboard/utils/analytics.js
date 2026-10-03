// src/features/dashboard/utils/analytics.js

/**
 * محاسبات آماری داشبورد
 * همه توابع pure هستند و از داده‌های API استفاده می‌کنند.
 */

// ============================================================
// KPI: کل مزارع
// ============================================================
export const getTotalFarms = (farms = []) => {
  return farms.length;
};

// ============================================================
// KPI: کل کشاورزان
// ============================================================
export const getTotalFarmers = (farmers = []) => {
  return farmers.length;
};

// ============================================================
// KPI: مساحت کل (هکتار)
// ============================================================
export const getTotalAreaHa = (farms = []) => {
  return farms.reduce((sum, f) => sum + (Number(f.area_ha) || 0), 0);
};

// ============================================================
// KPI: آب مصرفی سالانه (m³)
// آب = مساحت × نیاز آبی محصول
// ============================================================
export const getTotalWaterUsage = (farms = [], crops = []) => {
  const requirementByCrop = {};
  crops.forEach((c) => {
    if (c?.name) {
      requirementByCrop[c.name] = Number(c.requirement) || 0;
    }
  });

  return farms.reduce((sum, farm) => {
    const area = Number(farm.area_ha) || 0;
    const cropName = farm.crop;
    const requirement = requirementByCrop[cropName] || 0;
    return sum + area * requirement;
  }, 0);
};

// ============================================================
// KPI: تعداد محصولات فعال
// ============================================================
export const getActiveCropsCount = (crops = []) => {
  return crops.filter((c) => c.is_active).length;
};

// ============================================================
// KPI: مزارع این ماه
// ============================================================
export const getFarmsThisMonth = (farms = []) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return farms.filter((farm) => {
    if (!farm.created_at) return false;
    const d = new Date(farm.created_at);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;
};

// ============================================================
// KPI: کشاورزان فعال (پسورد عوض کرده‌اند)
// ============================================================
export const getActiveFarmersCount = (farmers = []) => {
  return farmers.filter((f) => f.password_changed_at !== null).length;
};

// ============================================================
// توزیع محصولات (برای نمودار دایره‌ای)
// ============================================================
export const getCropDistribution = (farms = []) => {
  const distribution = {};
  farms.forEach((farm) => {
    const crop = farm.crop || 'نامشخص';
    distribution[crop] = (distribution[crop] || 0) + 1;
  });
  return distribution;
};

// ============================================================
// مساحت به تفکیک محصول
// ============================================================
export const getAreaByCrop = (farms = []) => {
  const areaByCrop = {};
  farms.forEach((farm) => {
    const crop = farm.crop || 'نامشخص';
    areaByCrop[crop] = (areaByCrop[crop] || 0) + (Number(farm.area_ha) || 0);
  });
  return areaByCrop;
};

// ============================================================
// آب مصرفی به تفکیک محصول
// ============================================================
export const getWaterByCrop = (farms = [], crops = []) => {
  const requirementByCrop = {};
  crops.forEach((c) => {
    if (c?.name) {
      requirementByCrop[c.name] = Number(c.requirement) || 0;
    }
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
// روند ثبت مزارع (۶ ماه اخیر)
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

    trend.push({
      date: d,
      count,
    });
  }

  return trend;
};

// ============================================================
// توزیع استانی
// ============================================================
export const getProvinceDistribution = (farms = []) => {
  const dist = {};
  farms.forEach((farm) => {
    const province = farm.province || 'نامشخص';
    dist[province] = (dist[province] || 0) + 1;
  });
  return dist;
};

// ============================================================
// وضعیت دعوت کشاورزان
// ============================================================
export const getFarmerStatusBreakdown = (farmers = []) => {
  let pending = 0; // دعوت شده ولی لاگین نکرده
  let loggedIn = 0; // لاگین کرده ولی پسورد عوض نکرده
  let active = 0; // پسورد عوض کرده

  farmers.forEach((f) => {
    if (f.password_changed_at) {
      active++;
    } else if (f.first_login_at) {
      loggedIn++;
    } else {
      pending++;
    }
  });

  return { pending, loggedIn, active };
};

// ============================================================
// آخرین N مزرعه
// ============================================================
export const getRecentFarms = (farms = [], n = 5) => {
  return [...farms]
    .filter((f) => f.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, n);
};

// ============================================================
// آخرین N کشاورز
// ============================================================
export const getRecentFarmers = (farmers = [], n = 5) => {
  return [...farmers]
    .filter((f) => f.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, n);
};

// ============================================================
// فرمت اعداد فارسی
// ============================================================
export const formatNumber = (num, digits = 0) => {
  if (num === null || num === undefined) return '۰';
  return Number(num).toLocaleString('fa-IR', {
    maximumFractionDigits: digits,
  });
};