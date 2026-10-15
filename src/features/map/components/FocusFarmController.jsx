// src/features/map/components/FocusFarmController.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// ═══════════════════════════════════════════════════════════
// helper — استخراج bounds از geojson
//
// خروجی: L.LatLngBounds معتبر یا null
// ═══════════════════════════════════════════════════════════
const geojsonToBounds = (geojson) => {
  if (!geojson) return null;

  const bounds = L.latLngBounds();

  const addRing = (ring) => {
    if (!Array.isArray(ring)) return;
    for (const coord of ring) {
      if (
        Array.isArray(coord) &&
        coord.length >= 2 &&
        Number.isFinite(coord[0]) &&
        Number.isFinite(coord[1])
      ) {
        // GeoJSON: [lng, lat]  →  Leaflet: [lat, lng]
        bounds.extend([coord[1], coord[0]]);
      }
    }
  };

  const processGeometry = (geometry) => {
    if (!geometry || !geometry.type) return;
    const coords = geometry.coordinates;

    if (geometry.type === 'Polygon') {
      for (const ring of coords || []) addRing(ring);
    } else if (geometry.type === 'MultiPolygon') {
      for (const poly of coords || []) {
        for (const ring of poly || []) addRing(ring);
      }
    }
  };

  // Feature / FeatureCollection / Geometry خالص
  if (geojson.type === 'FeatureCollection') {
    for (const f of geojson.features || []) {
      processGeometry(f.geometry || f);
    }
  } else if (geojson.type === 'Feature') {
    processGeometry(geojson.geometry);
  } else {
    processGeometry(geojson);
  }

  if (!bounds.isValid()) return null;
  return bounds;
};

// ═══════════════════════════════════════════════════════════
// helper — استخراج مرکز از geojson (fallback)
// ═══════════════════════════════════════════════════════════
const geojsonToCenter = (geojson) => {
  const bounds = geojsonToBounds(geojson);
  if (!bounds) return null;
  const center = bounds.getCenter();
  return { lat: center.lat, lng: center.lng };
};

// ═══════════════════════════════════════════════════════════
// FocusFarmController
//
// وقتی focusFarm داده می‌شود و focusTrigger تغییر می‌کند:
//   ۱. اگر geojson دارد → fitBounds روی مرز آن
//   ۲. اگر فقط center دارد → flyTo
//
// ⚠️ نباید روی mount اول اجرا شود مگر focusFarm داده شده باشد.
// ⚠️ هر بار focusTrigger عوض شود، دوباره اجرا می‌شود.
// ═══════════════════════════════════════════════════════════
const FocusFarmController = ({ focusFarm = null, focusTrigger = 0 }) => {
  const map = useMap();
  const lastAppliedRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (!focusFarm) return;

    const farmId = focusFarm.farm_id || focusFarm.id;

    // ✅ کلید یکتا: farmId + trigger
    // trigger باعث می‌شود اگر کاربر دوباره روی همان مزرعه کلیک کند،
    // دوباره focus بشود.
    const key = `${farmId}::${focusTrigger}`;
    if (lastAppliedRef.current === key) return;
    lastAppliedRef.current = key;

    const rafId = requestAnimationFrame(() => {
      try {
        // ── ۱. اولویت: geojson → fitBounds ──
        const geojson = focusFarm.geojson;
        if (geojson) {
          const bounds = geojsonToBounds(geojson);
          if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [80, 80],
              maxZoom: 18,
              animate: true,
              duration: 0.6,
            });
            return;
          }
        }

        // ── ۲. fallback: lat/lng مستقیم → flyTo ──
        const lat = Number(
          focusFarm.lat ?? focusFarm.latitude,
        );
        const lng = Number(
          focusFarm.lng ??
            focusFarm.lon ??
            focusFarm.longitude,
        );

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          map.flyTo([lat, lng], 16, {
            animate: true,
            duration: 0.6,
          });
          return;
        }

        // ── ۳. fallback: مرکز geojson (اگر fitBounds نشد) ──
        if (geojson) {
          const center = geojsonToCenter(geojson);
          if (center) {
            map.flyTo([center.lat, center.lng], 15, {
              animate: true,
              duration: 0.6,
            });
          }
        }
      } catch (err) {
        console.warn('FocusFarmController failed:', err);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [map, focusFarm, focusTrigger]);

  return null;
};

export default FocusFarmController;