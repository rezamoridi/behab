// src/features/settings/components/RegionComparisonChart.jsx
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Loader2,
  BarChart3,
  X,
  Ruler,
  Wheat,
  Droplets,
  Users,
} from 'lucide-react';
import { useRegionsCompareQuery } from '../../regions/hooks/useRegions';

// ============================================================
// Color palette
// ============================================================
const BAR_COLORS = [
  '#7C3AED',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#8B5CF6',
  '#EF4444',
];

// ============================================================
// Metric config
// ============================================================
const METRICS = [
  {
    id: 'total_area_ha',
    label: 'مساحت کل',
    unit: 'هکتار',
    icon: Ruler,
    color: 'amber',
  },
  {
    id: 'farm_count',
    label: 'تعداد مزارع',
    unit: 'زمین',
    icon: Wheat,
    color: 'primary',
  },
  {
    id: 'farmer_count',
    label: 'تعداد کشاورزان',
    unit: 'نفر',
    icon: Users,
    color: 'emerald',
  },
  {
    id: 'total_water_m3',
    label: 'آب مصرفی',
    unit: 'm³',
    icon: Droplets,
    color: 'sky',
  },
];

const formatNumber = (val) =>
  Number(val || 0).toLocaleString('fa-IR', {
    maximumFractionDigits: 0,
  });

const formatDecimal = (val, digits = 2) =>
  Number(val || 0).toLocaleString('fa-IR', {
    maximumFractionDigits: digits,
  });

// ============================================================
// Chart
// ============================================================
const RegionComparisonChart = ({ onClose }) => {
  const { data, isLoading } = useRegionsCompareQuery({
    activeOnly: true,
  });

  const items = data?.items || [];

  // داده برای نمودارها
  const chartData = useMemo(() => {
    return items.map((item, i) => ({
      name: item.region_name,
      id: item.region_id,
      color: BAR_COLORS[i % BAR_COLORS.length],
      total_area_ha: item.total_area_ha,
      farm_count: item.farm_count,
      farmer_count: item.farmer_count,
      total_water_m3: item.total_water_m3,
    }));
  }, [items]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <BarChart3 size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                مقایسه مناطق
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {items.length.toLocaleString('fa-IR')} منطقه فعال
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2
                size={24}
                className="text-violet-600 animate-spin"
              />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              هیچ منطقه فعالی برای مقایسه وجود ندارد
            </div>
          ) : (
            <div className="space-y-5">
              {METRICS.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`
                          w-7 h-7 rounded-lg flex items-center justify-center
                          ${
                            metric.color === 'amber'
                              ? 'bg-amber-50 text-amber-600'
                              : metric.color === 'emerald'
                                ? 'bg-emerald-50 text-emerald-600'
                                : metric.color === 'sky'
                                  ? 'bg-sky-50 text-sky-600'
                                  : 'bg-primary-50 text-primary-600'
                          }
                        `}
                      >
                        <Icon size={13} strokeWidth={2.4} />
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {metric.label}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({metric.unit})
                      </span>
                    </div>

                    <div style={{ height: 160, width: '100%' }} dir="ltr">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{
                            top: 4,
                            right: 12,
                            left: 4,
                            bottom: 4,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="rgba(148,163,184,0.15)"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            tickFormatter={formatNumber}
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            axisLine={{
                              stroke: 'rgba(148,163,184,0.3)',
                            }}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            width={100}
                          />
                          <Tooltip
                            contentStyle={{
                              fontFamily: 'Vazirmatn, sans-serif',
                              fontSize: 12,
                              direction: 'rtl',
                              backgroundColor:
                                'rgba(255,255,255,0.98)',
                              border: '1px solid #e2e8f0',
                              borderRadius: 8,
                              padding: '8px 12px',
                            }}
                            formatter={(value) => [
                              formatNumber(value),
                              metric.unit,
                            ]}
                          />
                          <Bar
                            dataKey={metric.id}
                            radius={[0, 6, 6, 0]}
                            maxBarSize={20}
                          >
                            {chartData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}

              {/* Summary table */}
              <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
                <div className="text-xs font-bold text-gray-700 mb-3">
                  خلاصه مقایسه
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-2 px-2 font-semibold text-gray-500">
                        منطقه
                      </th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-500">
                        مسئولان
                      </th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-500">
                        کشاورزان
                      </th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-500">
                        مزارع
                      </th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-500">
                        مساحت (ha)
                      </th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-500">
                        آب (m³)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr
                        key={item.region_id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor:
                                  BAR_COLORS[i % BAR_COLORS.length],
                              }}
                            />
                            <span className="font-medium text-gray-800 truncate">
                              {item.region_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center tabular-nums">
                          {formatNumber(item.user_count)}
                        </td>
                        <td className="py-2 px-2 text-center tabular-nums">
                          {formatNumber(item.farmer_count)}
                        </td>
                        <td className="py-2 px-2 text-center tabular-nums">
                          {formatNumber(item.farm_count)}
                        </td>
                        <td
                          className="py-2 px-2 text-center tabular-nums font-semibold text-amber-700"
                          dir="ltr"
                        >
                          {formatDecimal(item.total_area_ha, 1)}
                        </td>
                        <td
                          className="py-2 px-2 text-center tabular-nums font-semibold text-sky-700"
                          dir="ltr"
                        >
                          {formatNumber(item.total_water_m3 / 1000)}K
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionComparisonChart;