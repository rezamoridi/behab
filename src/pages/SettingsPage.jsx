// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import SettingsTabs from '../features/settings/components/SettingsTabs';
import ProfileSettings from '../features/settings/components/ProfileSettings';
import AgricultureSettings from '../features/settings/components/AgricultureSettings';
import CropWaterRatesManager from '../features/settings/components/CropWaterRatesManager';
import UsersManagement from '../features/settings/components/UsersManagement';
import { useProfileSettings } from '../features/settings/hooks/useProfileSettings';
import { useAgricultureSettings } from '../features/settings/hooks/useAgricultureSettings';

const SettingsPage = ({ onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'پروفایل کاربری' },
    { id: 'agriculture', label: 'تنظیمات کشاورزی' },
    { id: 'cropRates', label: 'نرخ آب محصولات' },
    { id: 'users', label: 'مدیریت کاربران' },
  ];

  const {
    profile,
    isLoading: profileLoading,
    updateProfile,
    changePassword,
  } = useProfileSettings();

  const {
    settings,
    waterRates,
    cropWaterRates,
    isLoading: agricultureLoading,
    updateSettings,
    addWaterRate,
    updateWaterRate,
    deleteWaterRate,
    updateCropWaterRate,
    addCropWaterRate,
    deleteCropWaterRate,
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
              waterRates={waterRates}
              onUpdateSettings={updateSettings}
              onAddWaterRate={addWaterRate}
              onUpdateWaterRate={updateWaterRate}
              onDeleteWaterRate={deleteWaterRate}
              isLoading={agricultureLoading}
            />
          )}

          {activeTab === 'cropRates' && (
            <CropWaterRatesManager
              cropWaterRates={cropWaterRates}
              onUpdateCropRate={updateCropWaterRate}
              onAddCropRate={addCropWaterRate}
              onDeleteCropRate={deleteCropWaterRate}
              isLoading={agricultureLoading}
            />
          )}

          {activeTab === 'users' && <UsersManagement />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;