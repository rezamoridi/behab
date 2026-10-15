// src/pages/SettingsPage.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

import { usePermissions } from '../features/auth/hooks/usePermissions';
import SettingsTabs from '../features/settings/components/SettingsTabs';

import ProfileSettings from '../features/settings/components/ProfileSettings';
import AgricultureSettings from '../features/settings/components/AgricultureSettings';
import LayerStyleSettings from '../features/settings/components/LayerStyleSettings';
import CropSettingsManager from '../features/settings/components/CropSettingsManager';
import RegionSettings from '../features/settings/components/RegionSettings';
import VillageSettings from '../features/settings/components/VillageSettings';
import RolePolicySettings from '../features/settings/components/RolePolicySettings';
import UserGrantsManagement from '../features/settings/components/UserGrantsManagement';
import SmsSettings from '../features/settings/components/SmsSettings';
import OrphansManagement from '../features/settings/components/OrphansManagement';
import RestoreManagement from '../features/settings/components/RestoreManagement';
import DuplicateMerge from '../features/settings/components/DuplicateMerge';
import ImportData from '../features/settings/components/ImportData';

import {
  useAgricultureSettings,
} from '../features/settings/hooks/useAgricultureSettings';

// ═══════════════════════════════════════════════════════════
// Tab definitions
// ═══════════════════════════════════════════════════════════
const VALID_TABS = [
  'profile',
  'agriculture',
  'layer-style',
  'crops',
  'regions',
  'villages',
  'role-policies',
  'user-grants',
  'orphans',
  'restore',
  'duplicates',
  'import',
  'sms',
];

const tabs = [
  { id: 'profile', label: 'پروفایل کاربری' },
  { id: 'agriculture', label: 'تنظیمات کشاورزی' },
  { id: 'layer-style', label: 'ظاهر لایه‌ها' },
  { id: 'crops', label: 'تنظیمات محصولات' },
  { id: 'regions', label: 'مناطق' },
  { id: 'villages', label: 'روستاها' },
  { id: 'role-policies', label: 'مجوزهای نقش‌ها' },
  { id: 'user-grants', label: 'مجوزهای استثنایی' },
  { id: 'orphans', label: 'داده‌های بی‌مالک' },
  { id: 'restore', label: 'سبد بازیابی' },
  { id: 'duplicates', label: 'ادغام تکراری‌ها' },
  { id: 'import', label: 'ورود داده' },
  { id: 'sms', label: 'تنظیمات پیامک' },
];

// ═══════════════════════════════════════════════════════════
// AccessDenied
// ═══════════════════════════════════════════════════════════
const AccessDenied = () => (
  <div
    className="min-h-screen flex items-center justify-center p-6 pt-24"
    dir="rtl"
  >
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert size={24} strokeWidth={2.2} />
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-2">
        دسترسی محدود
      </h2>
      <p className="text-xs text-gray-500 leading-relaxed">
        این بخش فقط برای مدیر ارشد در دسترس است.
      </p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// SettingsPage
// ═══════════════════════════════════════════════════════════
const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin } = usePermissions();

  const {
    settings,
    isLoading: isSettingsLoading,
    updateSettings,
  } = useAgricultureSettings();

  const requestedTab = location.state?.activeTab;
  const activeTab = VALID_TABS.includes(requestedTab)
    ? requestedTab
    : 'profile';

  const handleTabChange = (tabId) => {
    navigate('/settings', {
      replace: true,
      state: { activeTab: tabId },
    });
  };

  useEffect(() => {
    if (requestedTab === 'users') {
      navigate('/settings', {
        replace: true,
        state: { activeTab: 'profile' },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTab]);

  if (!isSuperAdmin) {
    return <AccessDenied />;
  }

  return (
    <div
      className="
        h-full flex flex-col bg-gray-50
        pt-20 md:pt-24
      "
      dir="rtl"
    >
      {/* Tabs — sticky زیر TopBar */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={tabs}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'profile' && <ProfileSettings />}

          {activeTab === 'agriculture' && (
            <AgricultureSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              isLoading={isSettingsLoading}
            />
          )}

          {activeTab === 'layer-style' && <LayerStyleSettings />}

          {activeTab === 'crops' && <CropSettingsManager />}

          {activeTab === 'regions' && <RegionSettings />}

          {activeTab === 'villages' && <VillageSettings />}

          {activeTab === 'role-policies' && <RolePolicySettings />}

          {activeTab === 'user-grants' && <UserGrantsManagement />}

          {activeTab === 'orphans' && <OrphansManagement />}

          {activeTab === 'restore' && <RestoreManagement />}

          {activeTab === 'duplicates' && <DuplicateMerge />}

          {activeTab === 'import' && <ImportData />}

          {activeTab === 'sms' && <SmsSettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;