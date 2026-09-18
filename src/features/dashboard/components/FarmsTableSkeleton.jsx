// src/features/dashboard/components/FarmsTableSkeleton.jsx
import React from 'react';
import Skeleton from '../../../shared/components/Skeleton/Skeleton';

const FarmsTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-200">
            <th className="text-right px-3 py-2.5 w-12">
              <Skeleton className="h-3 w-6 mx-auto" />
            </th>
            <th className="text-right px-3 py-2.5">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="text-right px-3 py-2.5">
              <Skeleton className="h-3 w-12" />
            </th>
            <th className="text-right px-3 py-2.5 w-24">
              <Skeleton className="h-3 w-12" />
            </th>
            <th className="text-right px-3 py-2.5">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="text-center px-3 py-2.5 w-28">
              <Skeleton className="h-3 w-12 mx-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              <td className="px-3 py-3">
                <Skeleton className="w-6 h-6 rounded-md" />
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2.5">
                  <Skeleton variant="circle" className="w-8 h-8" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-5 w-20 rounded-md" />
              </td>
              <td className="px-3 py-3">
                <Skeleton className="h-3 w-14" />
              </td>
              <td className="px-3 py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-28" />
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-center gap-1">
                  <Skeleton className="w-7 h-7 rounded-md" />
                  <Skeleton className="w-7 h-7 rounded-md" />
                  <Skeleton className="w-7 h-7 rounded-md" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(FarmsTableSkeleton);