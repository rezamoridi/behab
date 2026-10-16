// src/app/Layout.jsx
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import TopBar from '../features/navigation/TopBar';
import FloatingDock from '../features/navigation/FloatingDock';
import FarmRegistrationPanel from '../features/farm-registration/panel/FarmRegistrationPanel';
import {
  FarmPanelProvider,
  useFarmPanel,
} from '../features/farm-registration/panel/FarmPanelContext';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import useSessionState from '../shared/hooks/useSessionState';

// ═══════════════════════════════════════════════════════════
// InnerLayout — با keyboard shortcuts
// ═══════════════════════════════════════════════════════════
const InnerLayout = () => {
  const { togglePanel, closePanel } = useFarmPanel();
  const { isSuperAdmin, isManager, isOperator } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const isMapPage = location.pathname.startsWith('/map');

  const [selectedLocation, setSelectedLocation] = useSessionState(
    'map_selected_location',
    null,
  );

  // ── Dock actions ──
  const handleDockAction = (actionKey) => {
    if (actionKey === 'toggleFarmPanel') {
      if (!isMapPage) {
        navigate('/map');
        setTimeout(() => togglePanel(), 100);
        return;
      }
      togglePanel();
    }
  };

  // ═══════════════════════════════════════════════════════════
  // Keyboard shortcuts
  //
  // D → داشبورد (super_admin)
  // M → نقشه
  // A → مدیریت کشاورزی (super_admin, manager) ✅ جدید
  // F → پنل ثبت زمین
  // U → کاربران/کشاورزان
  // C → گفتگو (super_admin)
  // Esc → بستن پنل
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ── نادیده گرفتن فیلدهای ورودی ──
      const tag = (e.target.tagName || '').toLowerCase();
      const isInput =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        e.target.isContentEditable;
      if (isInput) return;

      // ── نادیده گرفتن modifierها ──
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toLowerCase();

      // ── F: پنل ثبت زمین ──
      if (key === 'f') {
        e.preventDefault();
        if (isMapPage) togglePanel();
        else navigate('/map');
        return;
      }

      // ── M: نقشه ──
      if (key === 'm') {
        e.preventDefault();
        navigate('/map');
        return;
      }

      // ── A: مدیریت کشاورزی ✅ جدید ──
      if (key === 'a' && (isSuperAdmin || isManager)) {
        e.preventDefault();
        navigate('/agri');
        return;
      }

      // ── U: کاربران / کشاورزان ──
      if (key === 'u' && (isSuperAdmin || isManager || isOperator)) {
        e.preventDefault();
        navigate('/farmers');
        return;
      }

      // ── C: گفتگو (فقط super_admin) ──
      if (key === 'c' && isSuperAdmin) {
        e.preventDefault();
        navigate('/conversations');
        return;
      }

      // ── D: داشبورد ──
      if (key === 'd') {
        e.preventDefault();
        navigate('/');
        return;
      }

      // ── Esc: بستن پنل ثبت زمین ──
      if (e.key === 'Escape') {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePanel,
    closePanel,
    navigate,
    isMapPage,
    isSuperAdmin,
    isManager,
    isOperator,
  ]);

  return (
    <div className="app-layout-new" dir="rtl">
      {/* ✅ TopBar — در همه‌جا (شامل /settings و /agri) */}
      <TopBar
        selectedLocation={selectedLocation}
        onLocationSelect={setSelectedLocation}
      />

      <main className={`app-main ${isMapPage ? 'map-mode' : ''}`}>
        <Outlet />
      </main>

      <FloatingDock
        onAction={handleDockAction}
        hideFarmPanelAction={!isMapPage}
      />

      {isMapPage && <FarmRegistrationPanel />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// Layout — Provider wrapper
// ═══════════════════════════════════════════════════════════
const Layout = () => {
  return (
    <FarmPanelProvider>
      <InnerLayout />
    </FarmPanelProvider>
  );
};

export default Layout;