// src/features/map/components/MapComponent.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import {
  MapContainer,
  ScaleControl,
  useMap,
} from 'react-leaflet';
import SearchLocationController from './SearchLocationController';
import MapController from './MapController';
import SavedFarmsLayer from './SavedFarmsLayer';
import RegionsLayer from './RegionsLayer';
import RegionEditController from './RegionEditController';   // ✅ جدید
import SnapToggleControl from './SnapToggleControl';
import MapSettingsControl from './MapSettingsControl';
import useLocalStorageState from '../../../shared/hooks/useLocalStorageState';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const VIEWPORT_STORAGE_KEY = 'map_viewport_v1';
const DEFAULT_CENTER = [35.6892, 51.389];
const DEFAULT_ZOOM = 13;

const ViewportSaver = () => {
  const map = useMap();
  const [, setSavedViewport] = useLocalStorageState(VIEWPORT_STORAGE_KEY, null);

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

const MapComponent = ({
  selectedLocation,
  onPolygonsUpdate,
  savedFarms = [],
  farmersById = {},
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

  // ✅ فاز ۸ — نمایش مناطق
  showRegions = false,
  selectedRegionId = null,
  onRegionClick,

  // ✅ فاز ۹ — ویرایش مرز منطقه
  editRegionId = null,
  drawnItemsRef = null,
  onRegionEditLoaded,
  onRegionEditError,
  onDrawnItemsReady,
  onDrawingApiReady,
}) => {
  const [savedViewport] = useLocalStorageState(VIEWPORT_STORAGE_KEY, null);

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
  }, []);

  const initialZoom = useMemo(() => {
    if (savedViewport && Number.isFinite(savedViewport.zoom)) {
      return savedViewport.zoom;
    }
    return DEFAULT_ZOOM;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const handlePolygonsUpdate = useCallback(
    (data) => {
      onPolygonsUpdate?.(data);
    },
    [onPolygonsUpdate],
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
      <ScaleControl position="bottomleft" imperial={false} metric={true} />

      {/* ✅ مناطق — قبل از مزارع تا زیر آن‌ها باشند */}
      <RegionsLayer
        visible={showRegions}
        selectedRegionId={selectedRegionId}
        onRegionClick={onRegionClick}
      />

      {/* ✅ فاز ۹: Controller ویرایش مرز منطقه */}
      <RegionEditController
        editRegionId={editRegionId}
        drawnItemsRef={drawnItemsRef}
        onLoaded={onRegionEditLoaded}
        onError={onRegionEditError}
      />

      <SnapToggleControl
        enabled={snapEnabled}
        onToggle={onToggleSnap}
        hidden={snapToggleHidden}
      />

      <MapSettingsControl hidden={snapToggleHidden} />

      <SearchLocationController selectedLocation={selectedLocation} />

      <ViewportSaver />

      <MapController
        onPolygonsUpdate={handlePolygonsUpdate}
        savedFarms={savedFarms}
        clearTrigger={clearTrigger}
        editGeometryTrigger={editGeometryTrigger}
        geometriesToEdit={geometriesToEdit}
        editGeometryOptions={editGeometryOptions}
        snapEnabled={snapEnabled}
        onDrawnItemsReady={onDrawnItemsReady}
        onDrawingApiReady={onDrawingApiReady}
      />

      <SavedFarmsLayer
        farms={savedFarms}
        farmersById={farmersById}
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