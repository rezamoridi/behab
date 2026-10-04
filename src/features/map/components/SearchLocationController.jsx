// src/features/map/components/SearchLocationController.jsx
import React, { useEffect, useRef } from 'react';
import { useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const VIEWPORT_STORAGE_KEY = 'map_viewport_v1';

const SearchLocationController = ({ selectedLocation }) => {
  const map = useMap();
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (!selectedLocation) return;

    const lat = Number(selectedLocation.lat);
    const lon = Number(selectedLocation.lon ?? selectedLocation.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.warn('مختصات معتبر نیست:', selectedLocation);
      return;
    }

    // ✅ چک: اگر این mount اول است و viewport ذخیره‌شده داریم،
    // اجازه بده MapComponent از viewport استفاده کند.
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;

      try {
        const saved = localStorage.getItem(VIEWPORT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed &&
            Number.isFinite(parsed.lat) &&
            Number.isFinite(parsed.lng) &&
            Number.isFinite(parsed.zoom) &&
            parsed.lat !== 0 &&
            parsed.lng !== 0
          ) {
            // ✅ viewport ذخیره‌شده برنده می‌شود — ولی **فقط در mount اول**
            return;
          }
        }
      } catch {
        /* ignore */
      }
    }

    // ✅ همیشه برای هر selectedLocation جدید → setView
    const zoom = Number(selectedLocation.zoom) || 15;

    // ✅ با requestAnimationFrame تا مطمئن شویم map آماده است
    const rafId = requestAnimationFrame(() => {
      try {
        map.setView([lat, lon], zoom, {
          animate: true,
          duration: 0.5, // ✅ انیمیشن سریع ولی محسوس
        });

        // ✅ force redraw برای اطمینان
        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch {
            /* ignore */
          }
        }, 100);
      } catch (err) {
        console.warn('setView failed:', err);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [map, selectedLocation]);

  if (!selectedLocation) return null;

  const lat = Number(selectedLocation.lat);
  const lon = Number(selectedLocation.lon ?? selectedLocation.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return (
    <Marker position={[lat, lon]}>
      <Popup>
        <div className="font-vazir" dir="rtl">
          <strong className="text-sm">مکان انتخاب‌شده</strong>
          <br />
          <span className="text-xs text-gray-600">
            {selectedLocation.name ||
              selectedLocation.display_name ||
              'بدون نام'}
          </span>
        </div>
      </Popup>
    </Marker>
  );
};

export default React.memo(SearchLocationController);