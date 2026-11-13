// src/features/sentinel/components/SentinelLayer.jsx
//
// Renders a locally-cached Sentinel preview as an L.imageOverlay in a
// dedicated pane. Browser never receives CDSE tokens or instance_id.
//
// ⚠️ Deprecated WMS props (date, indexId) are accepted but ignored for
// backwards compatibility — will be removed in a follow-up PR.
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSentinelPreview } from '../hooks/useSentinelPreview';

const SentinelLayer = ({
  visible = false,
  assetId = null,
  bounds = null,
  opacity = 0.7,
  // Deprecated — ignored
  date: _legacyDate,
  indexId: _legacyIndex,
}) => {
  const map = useMap();
  const layerRef = useRef(null);

  const { url, loading, error } = useSentinelPreview(
    visible ? assetId : null,
  );

  // Mount / unmount overlay
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

    // Leaflet wants [[south, west], [north, east]]
    const [w, s, e, n] = bounds;
    const leafletBounds = [
      [s, w],
      [n, e],
    ];

    if (layerRef.current) {
      try {
        map.removeLayer(layerRef.current);
      } catch {
        /* ignore */
      }
      layerRef.current = null;
    }

    const overlay = L.imageOverlay(url, leafletBounds, {
      opacity,
      interactive: false,
      pane: 'sentinelPane',
    });
    overlay.addTo(map);
    layerRef.current = overlay;

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
    // opacity intentionally excluded — handled below without reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, visible, url, bounds]);

  // Opacity without reload
  useEffect(() => {
    if (layerRef.current) {
      try {
        layerRef.current.setOpacity(opacity);
      } catch {
        /* ignore */
      }
    }
  }, [opacity]);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[SentinelLayer] preview fetch failed:', error);
  }
  if (loading) {
    // eslint-disable-next-line no-console
    console.debug('[SentinelLayer] loading preview...', assetId);
  }

  return null;
};

export default SentinelLayer;