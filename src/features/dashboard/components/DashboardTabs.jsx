// src/features/dashboard/components/DashboardTabs.jsx
import React from 'react';
import { Droplets, List } from 'lucide-react';

// ============================================================
// ✅ تعریف تب‌ها — داخل خود فایل
// ============================================================
export const DASHBOARD_TABS = [
  {
    id: 'aquifer',
    label: 'آب‌خوان',
    icon: Droplets,
  },
  {
    id: 'farms',
    label: 'لیست زمین‌ها',
    icon: List,
  },
];

// ============================================================
// DashboardTabs — نوار تب‌های داشبورد
// ============================================================
const DashboardTabs = ({ activeTab, onTabChange, tabs = DASHBOARD_TABS }) => {
  return (
    <div
      className="flex border-b border-gray-200 bg-white px-4 overflow-x-auto flex-shrink-0"
      dir="rtl"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-5 py-3 text-sm font-medium
              border-b-2 transition-all duration-200 whitespace-nowrap
              ${
                isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(DashboardTabs);