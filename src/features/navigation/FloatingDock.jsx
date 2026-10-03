// src/features/navigation/FloatingDock.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DockButton from './DockButton';
import { DOCK_ITEMS } from './navigationConfig';
import { useFarmPanel } from '../farm-registration/panel/FarmPanelContext';

const SHORTCUTS = {
  dashboard: 'D',
  map: 'M',
  'farm-panel': 'F',
};

const FloatingDock = ({ onAction, hideFarmPanelAction = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // ✅ isOpen را خودش از context می‌خواند (فقط این کامپوننت re-render می‌شود)
  const { isOpen: farmPanelOpen } = useFarmPanel();

  const isRouteActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleClick = (item) => {
    if (item.type === 'route') {
      navigate(item.path);
    } else if (item.type === 'action' && onAction) {
      onAction(item.actionKey);
    }
  };

  const visibleItems = DOCK_ITEMS.filter((item) => {
    if (hideFarmPanelAction && item.id === 'farm-panel') return false;
    return true;
  });

  return (
    <div
      className="
        pointer-events-none
        fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[1100]
        flex justify-center
        px-2
      "
      dir="rtl"
    >
      <div
        className="
          pointer-events-auto
          flex items-center gap-1 md:gap-1.5
          p-1.5 md:p-2 rounded-3xl
          bg-white/30 backdrop-blur-xl
          border border-white/40
          shadow-[0_8px_32px_rgba(31,38,135,0.15),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(255,255,255,0.3)]
        "
      >
        {visibleItems.map((item) => {
          const isActive =
            item.type === 'route'
              ? isRouteActive(item.path)
              : item.actionKey === 'toggleFarmPanel' && farmPanelOpen;

          return (
            <DockButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              shortcut={SHORTCUTS[item.id]}
              isActive={isActive}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(FloatingDock);