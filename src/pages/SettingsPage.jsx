// src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, X, MessageSquare } from 'lucide-react';

import SettingsTabs from '../features/settings/components/SettingsTabs';
import ProfileSettings from '../features/settings/components/ProfileSettings';
import AgricultureSettings from '../features/settings/components/AgricultureSettings';
import CropSettingsManager from '../features/settings/components/CropSettingsManager';
import UsersManagement from '../features/settings/components/UsersManagement';
import LayerStyleSettings from '../features/settings/components/LayerStyleSettings';
import SmsSettings from '../features/settings/components/SmsSettings';  // ✅ جدید

import { useProfileSettings } from '../features/settings/hooks/useProfileSettings';
import { useAgricultureSettings } from '../features/settings/hooks/useAgricultureSettings';

// ✅ اضافه شدن 'sms'
const VALID_TABS = [
  'profile',
  'agriculture',
  'layer-style',
  'crops',
  'users',
  'sms',
];

const SettingsPage = ({ onNavigateHome }) => {
  const location = useLocation();

  const initialTab = VALID_TABS.includes(location.state?.activeTab)
    ? location.state.activeTab
    : 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);

  // اگر از داشبورد با tab جدید آمد
  useEffect(() => {
    const nextTab = location.state?.activeTab;
    if (!nextTab || !VALID_TABS.includes(nextTab)) return;

    const timer = setTimeout(() => {
      setActiveTab(nextTab);
    }, 0);

    return () => clearTimeout(timer);
  }, [location.state?.activeTab]);

  // ✅ اضافه شدن تب SMS
  const tabs = [
    { id: 'profile', label: 'پروفایل کاربری' },
    { id: 'agriculture', label: 'تنظیمات کشاورزی' },
    { id: 'layer-style', label: 'ظاهر لایه‌ها' },
    { id: 'crops', label: 'تنظیمات محصولات' },
    { id: 'users', label: 'مدیریت کاربران' },
    { id: 'sms', label: 'تنظیمات پیامک' },  // ✅ جدید
  ];

  const {
    profile,
    isLoading: profileLoading,
    updateProfile,
    changePassword,
  } = useProfileSettings();

  const {
    settings,
    isLoading: agricultureLoading,
    updateSettings,
  } = useAgricultureSettings();

  return (
    <div
      className="h-full flex flex-col bg-gray-50 font-vazir overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">تنظیمات</h2>
        </div>
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'profile' && (
            <ProfileSettings
              profile={profile}
              onUpdateProfile={updateProfile}
              onChangePassword={changePassword}
              isLoading={profileLoading}
            />
          )}

          {activeTab === 'agriculture' && (
            <AgricultureSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              isLoading={agricultureLoading}
            />
          )}

          {activeTab === 'layer-style' && <LayerStyleSettings />}

          {activeTab === 'crops' && <CropSettingsManager />}

          {activeTab === 'users' && <UsersManagement />}

          {activeTab === 'sms' && <SmsSettings />}   {/* ✅ جدید */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;