// src/features/dashboard/components/AquiferCharts.jsx
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from '../../settings/constants/cropColors';

// ============================================================
// فرمت اعداد فارسی
// ============================================================
const formatNumber = (value, decimals = 0) => {
  const num = Number(value) || 0;
  return num.toLocaleString('fa-IR', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
};

// ============================================================
// Card Wrapper
// ============================================================
const ChartCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
        <Icon size={15} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {subtitle && (
          <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

// ============================================================
// Tooltip کاستوم — با فرمت فارسی
// ============================================================
const PersianTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 font-vazir"
      dir="rtl"
    >
      {label && (
        <div className="text-[11px] font-semibold text-gray-700 mb-1">
          {label}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-gray-500">مقدار:</span>
        <span className="font-bold text-primary-700" dir="ltr">
          {formatNumber(value, 2)}
        </span>
        {unit && (
          <span className="text-[10px] text-gray-400">{unit}</span>
        )}
      </div>
    </div>
  );
};

// ============================================================
// AquiferCharts
// ============================================================
const AquiferCharts = ({ farms = [], getRequirement }) => {
  // ============================================================
  // داده‌های نمودار — محاسبه از farms
  // ============================================================
  const chartData = useMemo(() => {
    if (!farms.length) return { byCrop: [], byVillage: [] };

    const cropMap = new Map();
    const villageMap = new Map();

    farms.forEach((farm) => {
      const area = Number(farm.area_ha) || 0;
      const crop = farm.crop || 'نامشخص';
      const village = farm.village || 'نامشخص';

      // ─── محصول ───
      const requirement = farm.crop
        ? getRequirement(farm.crop)
        : null;
      const water =
        requirement !== null && requirement > 0
          ? area * requirement
          : 0;

      if (!cropMap.has(crop)) {
        cropMap.set(crop, {
          name: crop,
          area: 0,
          water: 0,
          count: 0,
          color: normalizeHex(farm.crop_color) || DEFAULT_FARM_COLOR,
        });
      }
      const cropEntry = cropMap.get(crop);
      cropEntry.area += area;
      cropEntry.water += water;
      cropEntry.count += 1;

      // ─── روستا ───
      if (!villageMap.has(village)) {
        villageMap.set(village, {
          name: village,
          area: 0,
          count: 0,
        });
      }
      const villageEntry = villageMap.get(village);
      villageEntry.area += area;
      villageEntry.count += 1;
    });

    const byCrop = Array.from(cropMap.values()).sort(
      (a, b) => b.area - a.area
    );

    const byVillage = Array.from(villageMap.values())
      .sort((a, b) => b.area - a.area)
      .slice(0, 8);

    return { byCrop, byVillage };
  }, [farms, getRequirement]);

  // ============================================================
  // Empty state
  // ============================================================
  if (!farms.length || chartData.byCrop.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
        <p className="text-xs text-gray-400">
          داده‌ای برای نمایش نمودار وجود ندارد
        </p>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ─── Pie: سهم محصولات از مساحت ─── */}
      <ChartCard
        icon={PieIcon}
        title="سهم محصولات از مساحت"
        subtitle={`${chartData.byCrop.length} محصول`}
      >
        <div className="h-[260px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.byCrop}
                dataKey="area"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {chartData.byCrop.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={
                  <PersianTooltip unit="هکتار" />
                }
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ─── Bar: مساحت هر محصول ─── */}
      <ChartCard
        icon={BarChart3}
        title="مساحت هر محصول"
        subtitle="هکتار"
      >
        <div className="h-[260px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.byCrop}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={<PersianTooltip unit="هکتار" />}
                cursor={{ fill: '#f9fafb' }}
              />
              <Bar dataKey="area" radius={[6, 6, 0, 0]}>
                {chartData.byCrop.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ─── Bar: آب مصرفی هر محصول ─── */}
      <ChartCard
        icon={BarChart3}
        title="آب مصرفی هر محصول"
        subtitle="متر مکعب"
      >
        <div className="h-[260px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.byCrop}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                content={<PersianTooltip unit="m³" />}
                cursor={{ fill: '#f9fafb' }}
              />
              <Bar
                dataKey="water"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ─── Bar: مساحت هر روستا ─── */}
      <ChartCard
        icon={BarChart3}
        title="مساحت هر روستا"
        subtitle={`Top ${chartData.byVillage.length} روستا`}
      >
        <div className="h-[260px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.byVillage}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={<PersianTooltip unit="هکتار" />}
                cursor={{ fill: '#f9fafb' }}
              />
              <Bar
                dataKey="area"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

export default React.memo(AquiferCharts);