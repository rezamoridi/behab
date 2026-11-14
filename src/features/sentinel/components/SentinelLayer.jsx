// src/features/sentinel/components/SentinelLayer.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSentinelPreview } from '../hooks/useSentinelPreview';

const SentinelLayer = ({
  visible = false,
  assetId = null,
  bounds = null,
  opacity = 0.7,
  fitBounds = false,
}) => {
  const map = useMap();
  const layerRef = useRef(null);

  const { url, loading, error } = useSentinelPreview(
    visible ? assetId : null,
  );

  // ✅ اطمینان از وجود pane (fallback)
  useEffect(() => {
    if (!map) return;
    if (!map.getPane('sentinelPane')) {
      const pane = map.createPane('sentinelPane');
      pane.style.zIndex = '350';
      pane.style.pointerEvents = 'none';
    }
  }, [map]);

  useEffect(() => {
    if (!visible || !url || !bounds) {
      if (layerRef.current) {
        try {
          map.removeLayer(layerRef.current);
        } catch {
          /* ignore */
        }
        layerRef.current = null;
      }
      return;
    }

    // ✅ اطمینان از وجود pane قبل از ساخت overlay
    if (!map.getPane('sentinelPane')) {
      const pane = map.createPane('sentinelPane');
      pane.style.zIndex = '350';
      pane.style.pointerEvents = 'none';
    }

    // ✅ اعتبارسنجی bounds
    if (!Array.isArray(bounds) || bounds.length !== 4) {
      console.warn('[SentinelLayer] Invalid bounds (not array[4]):', bounds);
      return;
    }
    const [w, s, e, n] = bounds.map(Number);
    if (![w, s, e, n].every(Number.isFinite)) {
      console.warn('[SentinelLayer] bounds has non-finite values:', bounds);
      return;
    }
    if (w >= e || s >= n) {
      console.warn('[SentinelLayer] Invalid bounds order (w>=e or s>=n):', bounds);
      return;
    }

    const leafletBounds = [
      [s, w], // SouthWest
      [n, e], // NorthEast
    ];

    if (layerRef.current) {
      try {
        map.removeLayer(layerRef.current);
      } catch {
        /* ignore */
      }
      layerRef.current = null;
    }

    try {
      const overlay = L.imageOverlay(url, leafletBounds, {
        opacity,
        interactive: false,
        pane: 'sentinelPane',
      });

      overlay.addTo(map);
      layerRef.current = overlay;

      if (fitBounds) {
        map.fitBounds(leafletBounds, { padding: [20, 20], maxZoom: 18 });
      }
    } catch (err) {
      console.error('[SentinelLayer] overlay addTo failed:', err);
      return;
    }

    return () => {
      if (layerRef.current) {
        try {
          map.removeLayer(layerRef.current);
        } catch {
          /* ignore */
        }
        layerRef.current = null;
      }
    };
  }, [map, visible, url, bounds, fitBounds]);

  // تغییر شفافیت بدون بارگذاری مجدد
  useEffect(() => {
    if (layerRef.current) {
      try {
        layerRef.current.setOpacity(opacity);
      } catch {
        /* ignore */
      }
    }
  }, [opacity]);

  // لاگ خطا
  useEffect(() => {
    if (error) {
      console.error('[SentinelLayer] preview fetch failed:', error);
    }
  }, [error]);

  if (loading) {
    // eslint-disable-next-line no-console
    console.debug('[SentinelLayer] loading preview...', assetId);
  }

  return null;
};

export default SentinelLayer;