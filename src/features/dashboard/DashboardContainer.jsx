// src/features/dashboard/DashboardContainer.jsx
import React, { useState } from 'react';

import DashboardTabs, {
  DASHBOARD_TABS,
} from './components/DashboardTabs';
import AquiferTab from './components/AquiferTab';
import FarmsTab from './components/FarmsTab';

const DashboardContainer = () => {
  const [activeTab, setActiveTab] = useState('aquifer');

  return (
    <div className="flex flex-col h-full bg-gray-50" dir="rtl">
      <DashboardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={DASHBOARD_TABS}
      />

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'aquifer' && <AquiferTab />}
        {activeTab === 'farms' && <FarmsTab />}
      </div>
    </div>
  );
};

export default DashboardContainer;