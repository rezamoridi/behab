// src/features/map/components/MapComponent.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  ScaleControl,
  useMap,
} from 'react-leaflet';
import SearchLocationController from './SearchLocationController';
import MapController from './MapController';
import SavedFarmsLayer from './SavedFarmsLayer';
import SnapToggleControl from './SnapToggleControl';
import useLocalStorageState from '../../../shared/hooks/useLocalStorageState';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

// ============================================================
// کلید ذخیره viewport
// ============================================================
const VIEWPORT_STORAGE_KEY = 'map_viewport_v1';
const DEFAULT_CENTER = [35.6892, 51.389];
const DEFAULT_ZOOM = 13;

// ============================================================
// ✅ ViewportSaver — کامپوننت کوچک درون همین فایل
// ============================================================
const ViewportSaver = () => {
  const map = useMap();
  const [, setSavedViewport] = useLocalStorageState(
    VIEWPORT_STORAGE_KEY,
    null
  );

  useEffect(() => {
    let timeoutId = null;

    const handleMoveEnd = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setSavedViewport({
          lat: Number(center.lat.toFixed(6)),
          lng: Number(center.lng.toFixed(6)),
          zoom: Number(zoom),
        });
      }, 300);
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [map, setSavedViewport]);

  return null;
};

// ============================================================
// MapComponent
// ============================================================
const MapComponent = ({
  selectedLocation,
  onPolygonsUpdate,
  savedFarms = [],
  colorByCrop = {},
  clearTrigger = null,
  onFarmClick,
  onFarmEdit,
  onFarmEditGeometry,
  onFarmDelete,
  selectedFarmId = null,
  editGeometryTrigger = null,
  geometriesToEdit = null,
  editGeometryOptions = null,
  snapEnabled = false,
  onToggleSnap,
  snapToggleHidden = false,
}) => {
  // ✅ خواندن viewport ذخیره‌شده از localStorage (فقط یک بار در mount)
  const [savedViewport] = useLocalStorageState(
    VIEWPORT_STORAGE_KEY,
    null
  );

  // ✅ center و zoom اولیه — از storage یا پیش‌فرض
  const initialCenter = useMemo(() => {
    if (
      savedViewport &&
      Number.isFinite(savedViewport.lat) &&
      Number.isFinite(savedViewport.lng)
    ) {
      return [savedViewport.lat, savedViewport.lng];
    }
    return DEFAULT_CENTER;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← فقط یک بار در mount

  const initialZoom = useMemo(() => {
    if (savedViewport && Number.isFinite(savedViewport.zoom)) {
      return savedViewport.zoom;
    }
    return DEFAULT_ZOOM;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← فقط یک بار در mount

  const mapStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const handlePolygonsUpdate = useCallback(
    (data) => {
      onPolygonsUpdate?.(data);
    },
    [onPolygonsUpdate]
  );

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      style={mapStyle}
      zoomControl={true}
      attributionControl={true}
      className="leaflet-container"
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        maxZoom={22}
        attribution="&copy; Google Maps"
      />

      <ScaleControl position="bottomleft" imperial={false} metric={true} />

      <SnapToggleControl
        enabled={snapEnabled}
        onToggle={onToggleSnap}
        hidden={snapToggleHidden}
      />

      <SearchLocationController selectedLocation={selectedLocation} />

      {/* ✅ ذخیره‌سازی viewport */}
      <ViewportSaver />

      <MapController
        onPolygonsUpdate={handlePolygonsUpdate}
        savedFarms={savedFarms}
        clearTrigger={clearTrigger}
        editGeometryTrigger={editGeometryTrigger}
        geometriesToEdit={geometriesToEdit}
        editGeometryOptions={editGeometryOptions}
        snapEnabled={snapEnabled}
      />

      <SavedFarmsLayer
        farms={savedFarms}
        colorByCrop={colorByCrop}
        onFarmClick={onFarmClick}
        onFarmEdit={onFarmEdit}
        onFarmEditGeometry={onFarmEditGeometry}
        onFarmDelete={onFarmDelete}
        selectedFarmId={selectedFarmId}
      />
    </MapContainer>
  );
};

export default React.memo(MapComponent);