// src/features/map/components/SearchLocationController.jsx
import React, { useEffect, useRef } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// ═══════════════════════════════════════════════════════════
// Fix default marker icons
// ═══════════════════════════════════════════════════════════
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ═══════════════════════════════════════════════════════════
// normalizeLocation
// ═══════════════════════════════════════════════════════════
const normalizeLocation = (loc) => {
  if (!loc) return null;

  const lat = Number(loc.lat ?? loc.latitude);
  const lng = Number(loc.lng ?? loc.lon ?? loc.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (lat < -90 || lat > 90) {
    console.warn('Invalid latitude:', lat);
    return null;
  }
  if (lng < -180 || lng > 180) {
    console.warn('Invalid longitude:', lng);
    return null;
  }

  return {
    lat,
    lng,
    zoom: Number(loc.zoom) || 15,
    name: loc.name || loc.display_name || loc.persianName || '',
  };
};

// ═══════════════════════════════════════════════════════════
// SearchLocationController
// ═══════════════════════════════════════════════════════════
const SearchLocationController = ({ selectedLocation }) => {
  const map = useMap();

  // ✅ جدید: از reference identity استفاده می‌کنیم، نه مقادیر.
  // این باعث می‌شود اگر والد یک object جدید بدهد (حتی با مقادیر یکسان)،
  // setView دوباره اجرا شود.
  const lastAppliedRef = useRef(null);

  useEffect(() => {
    const normalized = normalizeLocation(selectedLocation);

    if (!normalized) {
      lastAppliedRef.current = null;
      return;
    }

    // ✅ اگر همان reference قبلی است، skip کن
    if (lastAppliedRef.current === selectedLocation) return;
    lastAppliedRef.current = selectedLocation;

    const rafId = requestAnimationFrame(() => {
      try {
        map.setView(
          [normalized.lat, normalized.lng],
          normalized.zoom,
          {
            animate: true,
            duration: 0.6,
          },
        );
      } catch (err) {
        console.warn('SearchLocationController setView failed:', err);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [map, selectedLocation]);

  const normalized = normalizeLocation(selectedLocation);
  if (!normalized) return null;

  return (
    <Marker position={[normalized.lat, normalized.lng]}>
      <Popup>
        <div className="font-vazir" dir="rtl">
          <strong className="text-sm">مکان انتخاب‌شده</strong>
          <br />
          <span className="text-xs text-gray-600">
            {normalized.name || 'بدون نام'}
          </span>
        </div>
      </Popup>
    </Marker>
  );
};

export default React.memo(SearchLocationController);