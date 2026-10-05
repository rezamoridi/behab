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
import { usePermissions } from '../features/auth/hooks/usePermissions'; // ✅
import useSessionState from '../shared/hooks/useSessionState';

const InnerLayout = () => {
  const { togglePanel, closePanel } = useFarmPanel();
  const { isSuperAdmin } = usePermissions(); // ✅
  const location = useLocation();
  const navigate = useNavigate();

  const isMapPage = location.pathname.startsWith('/map');
  const isSettingsPage = location.pathname.startsWith('/settings');
  const isConversationsPage = location.pathname.startsWith('/conversations');

  const [selectedLocation, setSelectedLocation] = useSessionState(
    'map_selected_location',
    null,
  );

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      const isInput =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        e.target.isContentEditable;
      if (isInput) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toLowerCase();

      if (key === 'f') {
        e.preventDefault();
        if (isMapPage) togglePanel();
        else navigate('/map');
      } else if (key === 'm') {
        e.preventDefault();
        navigate('/map');
      } else if (key === 'c' && isSuperAdmin) {
        // ✅ فقط super_admin
        e.preventDefault();
        navigate('/conversations');
      } else if (key === 'd' && isSuperAdmin) {
        // ✅ فقط super_admin
        e.preventDefault();
        navigate('/');
      } else if (e.key === 'Escape') {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel, closePanel, navigate, isMapPage, isSuperAdmin]); // ✅

  return (
    <div className="app-layout-new" dir="rtl">
      {!isSettingsPage && (
        <TopBar
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />
      )}

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

const Layout = () => {
  return (
    <FarmPanelProvider>
      <InnerLayout />
    </FarmPanelProvider>
  );
};

export default Layout;