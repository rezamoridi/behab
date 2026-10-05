// src/features/dashboard/components/ManagerRegionsBar.jsx
import { Layers } from 'lucide-react';
import { useMyRegionsQuery } from '../../regions/hooks/useRegions';

const ManagerRegionsBar = () => {
  const { data: regions = [], isLoading } = useMyRegionsQuery({});

  if (isLoading) {
    return (
      <div className="h-12 rounded-2xl bg-white/40 animate-pulse" />
    );
  }

  if (regions.length === 0) {
    return (
      <div
        className="
          flex items-center gap-3 px-4 py-3 rounded-2xl
          bg-amber-50/70 border border-amber-200
        "
        dir="rtl"
      >
        <Layers size={14} className="text-amber-600" />
        <span className="text-xs font-medium text-amber-800">
          هنوز منطقه‌ای به شما اختصاص داده نشده — با مدیر ارشد تماس بگیرید
        </span>
      </div>
    );
  }

  return (
    <div
      className="
        flex items-center gap-3 flex-wrap
        px-4 py-3 rounded-2xl
        bg-blue-50/70 backdrop-blur-xl
        border border-blue-200
      "
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
          <Layers size={14} className="text-blue-700" strokeWidth={2.4} />
        </div>
        <span className="text-xs font-bold text-blue-900">
          مناطق تحت مدیریت شما:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {regions.map((r) => (
          <span
            key={r.id}
            className="
              inline-flex items-center gap-1
              px-2.5 py-1 rounded-lg
              bg-white text-blue-800
              border border-blue-200
              text-xs font-bold
            "
          >
            {r.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ManagerRegionsBar;