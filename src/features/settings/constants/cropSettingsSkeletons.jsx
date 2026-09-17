// src/features/settings/constants/cropSettingsSkeletons.jsx
import { METRICS, GRID_CLASS } from "./cropSettingsConfig";

export const StatsBarSkeleton = () => (
  <div className="grid grid-cols-3 gap-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-xl border border-gray-100"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="h-2.5 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mt-1.5" />
        </div>
      </div>
    ))}
  </div>
);

export const CropRowSkeleton = () => (
  <div
    className={`${GRID_CLASS} px-4 py-3 border-b border-gray-100 last:border-0`}
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-3.5 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>

    {METRICS.map((_, i) => (
      <div key={i} className="flex items-center justify-center">
        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
      </div>
    ))}

    <div className="flex items-center justify-end gap-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  </div>
);

export const CropSettingsManagerSkeleton = () => (
  <div className="space-y-4" dir="rtl">
    <StatsBarSkeleton />

    <div className="bg-white rounded-2xl border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
          <div>
            <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-2.5 w-40 bg-gray-200 rounded animate-pulse mt-1.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-9 w-52 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      <div
        className={`${GRID_CLASS} px-4 py-2.5 bg-gray-50/70 border-b border-gray-100`}
      >
        <div className="h-2.5 w-16 bg-gray-200 rounded animate-pulse" />
        {METRICS.map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            <div className="h-2.5 w-10 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
        <div className="flex justify-center">
          <div className="h-2.5 w-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {Array.from({ length: 6 }).map((_, i) => (
        <CropRowSkeleton key={i} />
      ))}
    </div>
  </div>
);