// src/features/farm-registration/panel/FarmPanelContext.jsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import useLocalStorageState from '../../../shared/hooks/useLocalStorageState';

const FarmPanelContext = createContext(null);

export const useFarmPanel = () => {
  const ctx = useContext(FarmPanelContext);
  if (!ctx) {
    throw new Error('useFarmPanel must be used within FarmPanelProvider');
  }
  return ctx;
};

export const FarmPanelProvider = ({ children }) => {
  // 'open' | 'collapsed'
  const [panelState, setPanelState] = useLocalStorageState(
    'farm_panel_state_v1',
    'collapsed',
  );

  // ✅ منبع حقیقت برای مزرعه در حال ویرایش
  const [editingFarmId, setEditingFarmId] = useState(null);

  const isOpen = panelState === 'open';

  // ✅ باز کردن پنل برای ثبت زمین جدید
  const openPanel = useCallback(() => {
    setEditingFarmId(null);
    setPanelState('open');
  }, [setPanelState]);

  // ✅ باز کردن پنل برای ویرایش یک مزرعه خاص
  const openPanelForEdit = useCallback((farmId) => {
    setEditingFarmId(farmId);
    setPanelState('open');
  }, [setPanelState]);

  const closePanel = useCallback(() => {
    setEditingFarmId(null);
    setPanelState('collapsed');
  }, [setPanelState]);

  const togglePanel = useCallback(() => {
    setPanelState((prev) => {
      if (prev === 'collapsed') {
        setEditingFarmId(null); // اگر کاربر خودش باز کرد، حالت ثبت جدید باشد
        return 'open';
      }
      return 'collapsed';
    });
  }, [setPanelState]);

  const value = useMemo(
    () => ({
      isOpen,
      panelState,
      editingFarmId,
      setEditingFarmId,
      openPanel,
      openPanelForEdit,
      closePanel,
      togglePanel,
    }),
    [
      isOpen,
      panelState,
      editingFarmId,
      openPanel,
      openPanelForEdit,
      closePanel,
      togglePanel,
    ],
  );

  return (
    <FarmPanelContext.Provider value={value}>
      {children}
    </FarmPanelContext.Provider>
  );
};

export default FarmPanelProvider;