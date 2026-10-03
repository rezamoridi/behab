// src/features/farm-registration/panel/FarmPanelContext.jsx
import { createContext, useCallback, useContext, useMemo } from 'react';
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

  const isOpen = panelState === 'open';

  const openPanel = useCallback(
    () => setPanelState('open'),
    [setPanelState],
  );

  const closePanel = useCallback(
    () => setPanelState('collapsed'),
    [setPanelState],
  );

  const togglePanel = useCallback(() => {
    setPanelState((prev) => (prev === 'open' ? 'collapsed' : 'open'));
  }, [setPanelState]);

  const value = useMemo(
    () => ({
      isOpen,
      panelState,
      openPanel,
      closePanel,
      togglePanel,
    }),
    [isOpen, panelState, openPanel, closePanel, togglePanel],
  );

  return (
    <FarmPanelContext.Provider value={value}>
      {children}
    </FarmPanelContext.Provider>
  );
};

export default FarmPanelProvider;