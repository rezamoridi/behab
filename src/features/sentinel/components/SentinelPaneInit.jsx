// src/features/sentinel/components/SentinelPaneInit.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Creates a dedicated Leaflet pane for Sentinel overlay.
 * Must be mounted inside <MapContainer> before <SentinelLayer>.
 *
 * z-index 350: above base tiles (200), below vector overlays (400).
 * pointer-events:none: farms/regions remain clickable.
 */
const SentinelPaneInit = () => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (map.getPane('sentinelPane')) return;

    const pane = map.createPane('sentinelPane');
    pane.style.zIndex = '350';
    pane.style.pointerEvents = 'none';
  }, [map]);

  return null;
};

export default SentinelPaneInit;