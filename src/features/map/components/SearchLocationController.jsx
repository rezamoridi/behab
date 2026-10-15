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
// ✅ قرارداد مختصات داخلی: { lat: number, lng: number, zoom: number }
//
// منابع ورودی:
//   - LocationPicker: { lat: number, lon: number, zoom: number, name }
//   - GeoJSON:        [lng, lat]
//   - Leaflet:        [lat, lng]
//
// همیشه با normalizeLocation یکسان‌سازی می‌شود.
// ═══════════════════════════════════════════════════════════
const normalizeLocation = (loc) => {
  if (!loc) return null;

  const lat = Number(loc.lat ?? loc.latitude);
  const lng = Number(loc.lng ?? loc.lon ?? loc.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  // محدوده‌ی معتبر جهانی
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
//
// فقط مسئول:
//   ۱. اعمال setView روی selectedLocation (اولویت بر viewport)
//   ۲. نمایش Marker در نقطهٔ انتخاب‌شده
//
// ⚠️ viewport ذخیره‌شده را نمی‌خواند — این کار MapComponent است.
// ⚠️ هیچ overwrite روی موقعیت پیش‌فرض نمی‌کند.
// ═══════════════════════════════════════════════════════════
const SearchLocationController = ({ selectedLocation }) => {
  const map = useMap();

  // ✅ آخرین target اعمال‌شده — برای جلوگیری از setView تکراری
  const lastAppliedRef = useRef(null);

  useEffect(() => {
    const normalized = normalizeLocation(selectedLocation);

    if (!normalized) {
      lastAppliedRef.current = null;
      return;
    }

    // ✅ اگر همان target قبلی بود، دوباره setView نکن
    const key = `${normalized.lat},${normalized.lng},${normalized.zoom}`;
    if (lastAppliedRef.current === key) return;

    lastAppliedRef.current = key;

    // ✅ اعمال setView — با requestAnimationFrame برای اطمینان از آماده‌بودن map
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

  // ✅ Marker — با نرمال‌سازی
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