// src/features/map/components/SearchLocationController.jsx
import React, { useEffect } from 'react';
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

const SearchLocationController = ({ selectedLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedLocation) return;

    const lat = Number(selectedLocation.lat);
    const lon = Number(selectedLocation.lon ?? selectedLocation.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      console.warn('مختصات معتبر نیست:', selectedLocation);
      return;
    }

    const zoom = Number(selectedLocation.zoom) || 15;
    map.setView([lat, lon], zoom, { animate: true });
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