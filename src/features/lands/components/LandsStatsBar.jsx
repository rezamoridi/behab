// src/features/lands/components/LandsStatsBar.jsx
import {
  MapPin,
  Ruler,
  Sprout,
  Users,
  Layers,
  Home,
  AlertCircle,
  UserX,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// StatPill
// ═══════════════════════════════════════════════════════════
const StatPill = ({ icon: Icon, label, value, unit, color, onClick }) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2
        bg-white rounded-lg border border-gray-200
        ${onClick ? 'hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-colors' : ''}
        text-right
      `}
    >
      <span
        className={`
          w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0
          ${color}
        `}
      >
        <Icon size={13} strokeWidth={2.4} />
      </span>
      <span className="flex items-baseline gap-1">
        <span className="text-sm font-bold text-gray-800" dir="ltr">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] text-gray-400">{unit}</span>
        )}
        <span className="text-[10px] text-gray-500 mr-1">{label}</span>
      </span>
    </Wrapper>
  );
};

// ═══════════════════════════════════════════════════════════
// LandsStatsBar
// ═══════════════════════════════════════════════════════════
const LandsStatsBar = ({ stats, onFilterMissingRegion, onFilterMissingOwner }) => {
  const formatNumber = (n, digits = 0) =>
    Number(n || 0).toLocaleString('fa-IR', {
      maximumFractionDigits: digits,
    });

  return (
    <div
      className="flex items-center gap-2 flex-wrap"
      dir="rtl"
    >
      {/* زمین‌ها */}
      <StatPill
        icon={MapPin}
        label="زمین"
        value={formatNumber(stats.total)}
        color="text-emerald-700 bg-emerald-50"
      />

      {/* مساحت */}
      <StatPill
        icon={Ruler}
        label="هکتار"
        value={formatNumber(stats.totalArea, 2)}
        color="text-blue-700 bg-blue-50"
      />

      {/* با محصول */}
      <StatPill
        icon={Sprout}
        label="با محصول"
        value={formatNumber(stats.withCrop)}
        color="text-amber-700 bg-amber-50"
      />

      {/* با کشاورز */}
      <StatPill
        icon={Users}
        label="با کشاورز"
        value={formatNumber(stats.withFarmer)}
        color="text-violet-700 bg-violet-50"
      />

      {/* منطقه */}
      <StatPill
        icon={Layers}
        label="منطقه"
        value={formatNumber(stats.regions)}
        color="text-purple-700 bg-purple-50"
      />

      {/* روستا */}
      <StatPill
        icon={Home}
        label="روستا"
        value={formatNumber(stats.villages)}
        color="text-sky-700 bg-sky-50"
      />

      {/* بدون منطقه — کلیک‌پذیر */}
      {stats.missingRegion > 0 && (
        <StatPill
          icon={AlertCircle}
          label="بدون منطقه"
          value={formatNumber(stats.missingRegion)}
          color="text-orange-700 bg-orange-50"
          onClick={onFilterMissingRegion}
        />
      )}

      {/* بدون مالک — کلیک‌پذیر */}
      {stats.missingOwner > 0 && (
        <StatPill
          icon={UserX}
          label="بدون مالک"
          value={formatNumber(stats.missingOwner)}
          color="text-red-700 bg-red-50"
          onClick={onFilterMissingOwner}
        />
      )}

      {/* نمایش فیلتر */}
      {stats.filtered !== stats.total && (
        <span className="text-[11px] text-gray-500 px-2">
          نمایش {formatNumber(stats.filtered)} از {formatNumber(stats.total)}
        </span>
      )}
    </div>
  );
};

export default LandsStatsBar;