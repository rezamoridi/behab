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

    // bounds از بک‌اند به صورت [West, South, East, North] می‌آید
    const [w, s, e, n] = bounds;
    const leafletBounds = [
      [s, w], // SouthWest
      [n, e], // NorthEast
    ];

    // حذف لایه قبلی
    if (layerRef.current) {
      try {
        map.removeLayer(layerRef.current);
      } catch {
        /* ignore */
      }
      layerRef.current = null;
    }

    // ایجاد لایه تصویر با تنظیمات دقیق
    const overlay = L.imageOverlay(url, leafletBounds, {
      opacity,
      interactive: false,
      pane: 'sentinelPane', // باید در MapComponent تعریف شده باشد
    });
    
    overlay.addTo(map);
    layerRef.current = overlay;

    // اگر نیاز به زوم روی تصویر است
    if (fitBounds) {
      map.fitBounds(leafletBounds, { padding: [20, 20], maxZoom: 18 });
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

  return null;
};

export default SentinelLayer;