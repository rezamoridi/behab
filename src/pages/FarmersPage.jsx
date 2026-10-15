// src/pages/FarmersPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, UserCog, ShieldAlert } from 'lucide-react';

import { usePermissions } from '../features/auth/hooks/usePermissions';
import FarmersManagement from '../features/dashboard/components/FarmersManagement';
import UsersManagement from '../features/settings/components/UsersManagement';

// ═══════════════════════════════════════════════════════════
// Tab ids
// ═══════════════════════════════════════════════════════════
const TAB_IDS = {
  farmers: 'farmers',
  users: 'users',
};

// ═══════════════════════════════════════════════════════════
// TabButton — با استایل شیشه‌ای زیبا
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
        این بخش فقط برای مدیر ارشد در دسترس است.
      </p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// FarmersPage
// ═══════════════════════════════════════════════════════════
const FarmersPage = () => {
  const { isSuperAdmin } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── تب‌های مجاز بر اساس نقش ──
  const allowedTabs = useMemo(() => {
    const tabs = [TAB_IDS.farmers];
    if (isSuperAdmin) {
      tabs.push(TAB_IDS.users);
    }
    return tabs;
  }, [isSuperAdmin]);

  // ── خواندن tab از URL (با فیلتر امنیتی) ──
  const requestedTab = searchParams.get('tab');
  const activeTab = allowedTabs.includes(requestedTab)
    ? requestedTab
    : TAB_IDS.farmers;

  // ── اگر tab نامعتبر بود، URL را پاک کن ──
  useEffect(() => {
    if (requestedTab && !allowedTabs.includes(requestedTab)) {
      const next = new URLSearchParams(searchParams);
      next.delete('tab');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTab, allowedTabs]);

  // ── تغییر tab ──
  const handleTabChange = (tabId) => {
    if (!allowedTabs.includes(tabId)) return;

    const next = new URLSearchParams(searchParams);
    if (tabId === TAB_IDS.farmers) {
      next.delete('tab');
    } else {
      next.set('tab', tabId);
    }
    setSearchParams(next, { replace: true });
  };

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
        {/* ═══════════════════════════════════════════════════ */}
        {/* Tab Bar — نوار تب‌های شیشه‌ای */}
        {/* ═══════════════════════════════════════════════════ */}
        {allowedTabs.length > 1 && (
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
            <TabButton
              label="کشاورزان"
              icon={Users}
              isActive={activeTab === TAB_IDS.farmers}
              onClick={() => handleTabChange(TAB_IDS.farmers)}
            />

            {isSuperAdmin && (
              <TabButton
                label="کاربران"
                icon={UserCog}
                isActive={activeTab === TAB_IDS.users}
                onClick={() => handleTabChange(TAB_IDS.users)}
              />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* محتوا */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="animate-fadeInUp">
          {activeTab === TAB_IDS.farmers && <FarmersManagement />}

          {activeTab === TAB_IDS.users &&
            (isSuperAdmin ? (
              <UsersManagement />
            ) : (
              <AccessDenied />
            ))}
        </div>
      </div>
    </div>
  );
};

export default FarmersPage;