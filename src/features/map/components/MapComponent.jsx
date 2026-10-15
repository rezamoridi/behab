// src/features/map/components/MapComponent.jsx
import React, { useMemo, useCallback, useEffect } from 'react';
import { MapContainer, ScaleControl, useMap } from 'react-leaflet';
import SearchLocationController from './SearchLocationController';
import MapController from './MapController';
import SavedFarmsLayer from './SavedFarmsLayer';
import RegionsLayer from './RegionsLayer';
import VillagesLayer from './VillagesLayer';
import RegionEditController from './RegionEditController';
import VillageEditController from './VillageEditController';
import FocusFarmController from './FocusFarmController';
import SnapToggleControl from './SnapToggleControl';
import MapSettingsControl from './MapSettingsControl';
import useLocalStorageState from '../../../shared/hooks/useLocalStorageState';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const VIEWPORT_STORAGE_KEY = 'map_viewport_v1';
const DEFAULT_CENTER = [35.6892, 51.389];
const DEFAULT_ZOOM = 13;

// ═══════════════════════════════════════════════════════════
// ✅ normalizeLocation — همان helper SearchLocationController
// (برای یکنواخت‌سازی center اولیه)
// ═══════════════════════════════════════════════════════════
const normalizeLocation = (loc) => {
  if (!loc) return null;

  const lat = Number(loc.lat ?? loc.latitude);
  const lng = Number(loc.lng ?? loc.lon ?? loc.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;

  return {
    lat,
    lng,
    zoom: Number(loc.zoom) || 15,
  };
};

// ═══════════════════════════════════════════════════════════
// ViewportSaver — ذخیره‌ی viewport در localStorage
//
// ⚠️ روشن/خاموش کردنش را می‌توان از طریق prop کنترل کرد
// (مثلاً در حالت focus روی مزرعه، ذخیره نکن تا viewport فعلی حفظ شود).
// ═══════════════════════════════════════════════════════════
const ViewportSaver = ({ disabled = false }) => {
  const map = useMap();
  const [, setSavedViewport] = useLocalStorageState(
    VIEWPORT_STORAGE_KEY,
    null,
  );

  useEffect(() => {
    if (disabled) return;

    let timeoutId = null;
    const handleMoveEnd = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const center = map.getCenter();
          const zoom = map.getZoom();
          setSavedViewport({
            lat: Number(center.lat.toFixed(6)),
            lng: Number(center.lng.toFixed(6)),
            zoom: Number(zoom),
          });
        } catch {
          /* ignore */
        }
      }, 400);
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [map, setSavedViewport, disabled]);

  return null;
};

// ═══════════════════════════════════════════════════════════
// MapComponent
// ═══════════════════════════════════════════════════════════
const MapComponent = ({
  selectedLocation,
  onPolygonsUpdate,
  savedFarms = [],
  referenceFarms = [],
  referenceStyle = null,
  farmersById = {},
  colorByCrop = {},
  clearTrigger = null,
  onFarmClick,
  onFarmEdit,
  onFarmEditGeometry,
  onFarmDelete,
  onFarmHistory,
  onFarmTransfer,
  selectedFarmId = null,
  editGeometryTrigger = null,
  geometriesToEdit = null,
  editGeometryOptions = null,
  snapEnabled = false,
  onToggleSnap,
  snapToggleHidden = false,

  // ─── نمایش مناطق ───
  showRegions = false,
  selectedRegionId = null,
  onRegionClick,

  // ─── نمایش روستاها ───
  showVillages = false,
  selectedVillageId = null,
  onVillageClick,
  villageRegionFilterId = null,

  // ─── ویرایش مرز منطقه ───
  editRegionId = null,
  drawnItemsRef = null,
  onRegionEditLoaded,
  onRegionEditError,

  // ─── ویرایش مرز روستا ───
  editVillageId = null,
  onVillageEditLoaded,
  onVillageEditError,

  // ─── ✅ Focus on farm (از dashboard) ───
  focusFarm = null,
  focusTrigger = 0,

  onDrawnItemsReady,
  onDrawingApiReady,
}) => {
  const [savedViewport] = useLocalStorageState(
    VIEWPORT_STORAGE_KEY,
    null,
  );

  // ═══════════════════════════════════════════════════════════
  // ✅ تعیین مرکز و zoom اولیه
  //
  // اولویت:
  //   ۱. focusFarm (اگر geojson/center دارد)
  //   ۲. selectedLocation (از LocationPicker)
  //   ۳. savedViewport (localStorage)
  //   ۴. DEFAULT_CENTER
  // ═══════════════════════════════════════════════════════════
  const initialView = useMemo(() => {
    // ── ۱. focusFarm ──
    if (focusFarm) {
      // geojson → مرکز bounds (تقریبی، برای شروع map)
      const geojson = focusFarm.geojson;
      if (geojson) {
        const coords = extractFirstCoord(geojson);
        if (coords) {
          return { center: [coords.lat, coords.lng], zoom: 15 };
        }
      }
      // lat/lng مستقیم
      const lat = Number(focusFarm.lat ?? focusFarm.latitude);
      const lng = Number(
        focusFarm.lng ?? focusFarm.lon ?? focusFarm.longitude,
      );
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { center: [lat, lng], zoom: 15 };
      }
    }

    // ── ۲. selectedLocation ──
    const norm = normalizeLocation(selectedLocation);
    if (norm) {
      return { center: [norm.lat, norm.lng], zoom: norm.zoom };
    }

    // ── ۳. savedViewport ──
    if (
      savedViewport &&
      Number.isFinite(savedViewport.lat) &&
      Number.isFinite(savedViewport.lng)
    ) {
      return {
        center: [savedViewport.lat, savedViewport.lng],
        zoom:
          Number.isFinite(savedViewport.zoom)
            ? savedViewport.zoom
            : DEFAULT_ZOOM,
      };
    }

    // ── ۴. DEFAULT ──
    return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ⚠️ فقط در mount اول محاسبه می‌شود

  const mapStyle = useMemo(
    () => ({ height: '100%', width: '100%' }),
    [],
  );

  const handlePolygonsUpdate = useCallback(
    (data) => {
      onPolygonsUpdate?.(data);
    },
    [onPolygonsUpdate],
  );

  // ✅ تعیین: آیا در حالت focus/selected هستیم (برای ViewportSaver)
  const shouldDisableViewportSaver = !!focusFarm;

  return (
    <MapContainer
      center={initialView.center}
      zoom={initialView.zoom}
      style={mapStyle}
      zoomControl={true}
      attributionControl={true}
      className="leaflet-container"
    >
      <ScaleControl
        position="bottomleft"
        imperial={false}
        metric={true}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ✅ FocusFarmController — اعمال fitBounds روی مزرعه‌ی هدف */}
      {/* ═══════════════════════════════════════════════════════ */}
      <FocusFarmController
        focusFarm={focusFarm}
        focusTrigger={focusTrigger}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SearchLocationController — setView روی نقطه‌ی جست‌وجو */}
      {/* ═══════════════════════════════════════════════════════ */}
      <SearchLocationController selectedLocation={selectedLocation} />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ViewportSaver — ذخیره‌ی viewport */}
      {/* وقتی focusFarm داریم، viewport را ذخیره نمی‌کنیم */}
      {/* تا viewport قبلی کاربر خراب نشود. */}
      {/* ═══════════════════════════════════════════════════════ */}
      <ViewportSaver disabled={shouldDisableViewportSaver} />

      {/* ─── روستاها ─── */}
      <VillagesLayer
        visible={showVillages}
        selectedVillageId={selectedVillageId}
        onVillageClick={onVillageClick}
        regionFilterId={villageRegionFilterId}
      />

      {/* ─── مناطق ─── */}
      <RegionsLayer
        visible={showRegions}
        selectedRegionId={selectedRegionId}
        onRegionClick={onRegionClick}
      />

      {/* ─── ویرایش مرز منطقه ─── */}
      <RegionEditController
        editRegionId={editRegionId}
        drawnItemsRef={drawnItemsRef}
        onLoaded={onRegionEditLoaded}
        onError={onRegionEditError}
      />

      {/* ─── ویرایش مرز روستا ─── */}
      <VillageEditController
        editVillageId={editVillageId}
        drawnItemsRef={drawnItemsRef}
        onLoaded={onVillageEditLoaded}
        onError={onVillageEditError}
      />

      <SnapToggleControl
        enabled={snapEnabled}
        onToggle={onToggleSnap}
        hidden={snapToggleHidden}
      />

      <MapSettingsControl hidden={snapToggleHidden} />

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
        referenceFarms={referenceFarms}
        referenceStyle={referenceStyle}
        farmersById={farmersById}
        colorByCrop={colorByCrop}
        onFarmClick={onFarmClick}
        onFarmEdit={onFarmEdit}
        onFarmEditGeometry={onFarmEditGeometry}
        onFarmDelete={onFarmDelete}
        onFarmHistory={onFarmHistory}
        onFarmTransfer={onFarmTransfer}
        selectedFarmId={selectedFarmId}
      />
    </MapContainer>
  );
};

// ═══════════════════════════════════════════════════════════
// helper — اولین مختصات معتبر از geojson
// (برای محاسبه‌ی مرکز اولیه‌ی map وقتی focusFarm داده شده)
// ═══════════════════════════════════════════════════════════
const extractFirstCoord = (geojson) => {
  if (!geojson) return null;

  const tryCoord = (c) => {
    if (
      Array.isArray(c) &&
      c.length >= 2 &&
      Number.isFinite(c[0]) &&
      Number.isFinite(c[1])
    ) {
      return { lat: c[1], lng: c[0] };
    }
    return null;
  };

  const walk = (node) => {
    if (!node) return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const r = walk(item);
        if (r) return r;
      }
      return null;
    }
    if (Array.isArray(node.coordinates)) {
      return walk(node.coordinates);
    }
    if (node.geometry) {
      return walk(node.geometry);
    }
    if (node.features && Array.isArray(node.features)) {
      for (const f of node.features) {
        const r = walk(f);
        if (r) return r;
      }
      return null;
    }
    return tryCoord(node);
  };

  return walk(geojson);
};

export default React.memo(MapComponent);