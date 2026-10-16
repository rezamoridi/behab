// src/pages/AgriPage.jsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldAlert,
  Sprout,
  Package,
} from 'lucide-react';

import { usePermissions } from '../features/auth/hooks/usePermissions';
import CropSettingsManager from '../features/settings/components/CropSettingsManager';
import InputsManager from '../features/agri/components/InputsManager';

// ═══════════════════════════════════════════════════════════
// Tab ids
// ═══════════════════════════════════════════════════════════
const TAB_IDS = {
  crops: 'crops',
  inputs: 'inputs',
};

// ═══════════════════════════════════════════════════════════
// TabButton — پیل شیشه‌ای (مشابه FarmersPage)
// ═══════════════════════════════════════════════════════════
const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    onClick={onClick}
    className={`
      group relative flex items-center gap-2.5
      px-5 py-2.5 rounded-xl
      text-sm font-bold
      transition-all duration-200
      cursor-pointer
      ${
        isActive
          ? 'bg-primary-600 text-white shadow-[0_4px_14px_rgba(46,125,50,0.35)]'
          : 'bg-white/60 text-slate-700 hover:bg-white/90 hover:shadow-sm'
      }
    `}
  >
    {Icon && (
      <Icon
        size={16}
        strokeWidth={isActive ? 2.6 : 2.2}
        className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}
      />
    )}
    <span className="whitespace-nowrap">{label}</span>

    {isActive && (
      <span
        className="
          absolute -bottom-0.5 left-1/2 -translate-x-1/2
          w-1 h-1 rounded-full bg-white/80
        "
        aria-hidden="true"
      />
    )}
  </button>
);

// ═══════════════════════════════════════════════════════════
// AccessDenied
// ═══════════════════════════════════════════════════════════
const AccessDenied = () => (
  <div className="flex items-center justify-center py-16" dir="rtl">
    <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert size={24} strokeWidth={2.2} />
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-2">
        دسترسی محدود
      </h2>
      <p className="text-xs text-gray-500 leading-relaxed">
        این بخش فقط برای مدیران ارشد و مدیران منطقه در دسترس است.
      </p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// AgriPage
// ═══════════════════════════════════════════════════════════
const AgriPage = () => {
  const { isSuperAdmin, isManager } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs = [
    {
      id: TAB_IDS.crops,
      label: 'بذر و نیازهای زراعی',
      icon: Sprout,
    },
    {
      id: TAB_IDS.inputs,
      label: 'نهاده‌ها',
      icon: Package,
    },
  ];

  const requestedTab = searchParams.get('tab');
  const activeTab = tabs.some((t) => t.id === requestedTab)
    ? requestedTab
    : TAB_IDS.crops;

  const handleTabChange = (tabId) => {
    if (!tabs.some((t) => t.id === tabId)) return;
    const next = new URLSearchParams(searchParams);
    if (tabId === TAB_IDS.crops) {
      next.delete('tab');
    } else {
      next.set('tab', tabId);
    }
    setSearchParams(next, { replace: true });
  };

  if (!isSuperAdmin && !isManager) {
    return (
      <div className="h-full overflow-y-auto pt-20 md:pt-24 pb-28 px-4 md:px-5">
        <div className="max-w-[1600px] mx-auto">
          <AccessDenied />
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        h-full overflow-y-auto
        pt-20 md:pt-24
        pb-28
        px-4 md:px-5
      "
      dir="rtl"
    >
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Tab bar */}
        <div
          className="
            flex items-center gap-2 flex-wrap
            p-1.5 rounded-2xl
            bg-white/60 backdrop-blur-xl
            border border-white/70
            shadow-[0_4px_20px_rgba(31,38,135,0.06)]
            w-fit
          "
          role="tablist"
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </div>

        {/* Content */}
        <div className="animate-fadeInUp">
          {activeTab === TAB_IDS.crops && <CropSettingsManager />}
          {activeTab === TAB_IDS.inputs && <InputsManager />}
        </div>
      </div>
    </div>
  );
};

export default AgriPage;