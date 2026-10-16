// src/pages/SettingsPage.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Sprout, ArrowLeft } from 'lucide-react';

import { usePermissions } from '../features/auth/hooks/usePermissions';
import SettingsTabs from '../features/settings/components/SettingsTabs';

import ProfileSettings from '../features/settings/components/ProfileSettings';
import AgricultureSettings from '../features/settings/components/AgricultureSettings';
import LayerStyleSettings from '../features/settings/components/LayerStyleSettings';
import RegionSettings from '../features/settings/components/RegionSettings';
import VillageSettings from '../features/settings/components/VillageSettings';
import RolePolicySettings from '../features/settings/components/RolePolicySettings';
import UserGrantsManagement from '../features/settings/components/UserGrantsManagement';
import SmsSettings from '../features/settings/components/SmsSettings';
import OrphansManagement from '../features/settings/components/OrphansManagement';
import RestoreManagement from '../features/settings/components/RestoreManagement';
import DuplicateMerge from '../features/settings/components/DuplicateMerge';
import ImportData from '../features/settings/components/ImportData';
import UsersManagement from '../features/settings/components/UsersManagement';

import { useAgricultureSettings } from '../features/settings/hooks/useAgricultureSettings';

// ═══════════════════════════════════════════════════════════
// Tabs
// ═══════════════════════════════════════════════════════════
const VALID_TABS = [
  'profile',
  'users',
  'agriculture',
  'layer-style',
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
  { id: 'users', label: 'مدیریت کاربران' },
  { id: 'agriculture', label: 'تنظیمات کشاورزی' },
  { id: 'layer-style', label: 'ظاهر لایه‌ها' },
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
// CropsMovedBanner
// ═══════════════════════════════════════════════════════════
const CropsMovedBanner = () => {
  const navigate = useNavigate();
  return (
    <div
      className="
        flex items-center justify-between gap-3
        px-4 py-3 rounded-xl
        bg-emerald-50/70 border border-emerald-200
        mb-4
      "
      dir="rtl"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-300/50 flex items-center justify-center flex-shrink-0">
          <Sprout size={16} className="text-emerald-700" strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-emerald-900">
            تنظیمات محصولات منتقل شد
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            اکنون در بخش «مدیریت کشاورزی» قابل دسترسی است
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/agri')}
        className="
          flex items-center gap-1.5 px-3 py-2 rounded-lg
          bg-white hover:bg-emerald-50
          text-emerald-700 text-xs font-bold
          border border-emerald-300
          transition-colors cursor-pointer
          whitespace-nowrap
        "
      >
        <span>رفتن به /agri</span>
        <ArrowLeft size={12} />
      </button>
    </div>
  );
};

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
    if (requestedTab === 'crops') {
      // تب crops حذف شده → هدایت به profile
      navigate('/settings', {
        replace: true,
        state: { activeTab: 'profile' },
      });
    }
  }, [requestedTab, navigate]);

  if (!isSuperAdmin) {
    return <AccessDenied />;
  }

  return (
    <div
      className="h-full flex flex-col bg-gray-50 pt-20 md:pt-24"
      dir="rtl"
    >
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={tabs}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <CropsMovedBanner />

          {activeTab === 'profile' && <ProfileSettings />}

          {activeTab === 'users' && <UsersManagement />}

          {activeTab === 'agriculture' && (
            <AgricultureSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              isLoading={isSettingsLoading}
            />
          )}

          {activeTab === 'layer-style' && <LayerStyleSettings />}
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