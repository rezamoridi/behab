// src/features/settings/components/SettingsTabs.jsx
import React from 'react';

const SettingsTabs = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div
      className="flex border-b border-gray-200 bg-white px-4 overflow-x-auto flex-shrink-0"
      dir="rtl"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              px-5 py-3 text-sm font-medium
              border-b-2 transition-all duration-200
              whitespace-nowrap
              ${
                isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(SettingsTabs);