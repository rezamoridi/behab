// src/pages/MapViewPage.jsx
import React, { useCallback, useMemo } from 'react';

import MapErrorBoundary from '../features/map/components/MapErrorBoundary';
import MapComponent from '../features/map/components/MapComponent';
import MapCalculator from '../features/map/components/MapCalculator';
import LocationPicker from '../features/location/components/LocationPicker';
import DraggableFarmWindow from '../features/farm-registration/components/DraggableFarmWindow';

import { useFarmsQuery } from '../features/farm-registration/hooks/useFarmsQuery';
import { useDeleteFarmMutation } from '../features/farm-registration/hooks/useFarmMutation';
import { useAgricultureSettings } from '../features/settings/hooks/useAgricultureSettings';

import useSessionState from '../shared/hooks/useSessionState';
import useLocalStorageState from '../shared/hooks/useLocalStorageState';

const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 50,
  search: null,
};

const MapViewPage = () => {
  // ============================================================
  // Queries
  // ============================================================
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(
    FARM_LIST_QUERY_PARAMS
  );

  const savedFarms = farmsData?.farms || [];

  const { crops } = useAgricultureSettings();

  const colorByCrop = useMemo(() => {
    const map = {};
    (crops || []).forEach((c) => {
      if (c?.name && c?.color) map[c.name] = c.color;
    });
    return map;
  }, [crops]);

  // ============================================================
  // ✅ Stateها با ذخیره‌سازی
  // ============================================================

  // ✅ موقعیت جستجو — در sessionStorage
  const [selectedLocation, setSelectedLocation] = useSessionState(
    'map_selected_location',
    null
  );

  // ✅ مزرعه انتخاب‌شده — در sessionStorage
  const [selectedFarmId, setSelectedFarmId] = useSessionState(
    'map_selected_farm_id',
    null
  );

  // ✅ فعال بودن اسنپ — در localStorage (ترجیح پایدار کاربر)
  const [snapEnabled, setSnapEnabled] = useLocalStorageState(
    'map_snap_enabled',
    false
  );

  // ============================================================
  // Stateهای موقت — ساده بمونن
  // ============================================================
  const [polygonsData, setPolygonsData] = React.useState({
    totalArea: 0,
    geojsons: [],
    count: 0,
  });

  const [farmWindowOpen, setFarmWindowOpen] = React.useState(false);
  const [editingFarm, setEditingFarm] = React.useState(null);
  const [editingFarmId, setEditingFarmId] = React.useState(null);

  // ============================================================
  // Mutations
  // ============================================================
  const deleteFarmMutation = useDeleteFarmMutation();

  // ============================================================
  // ✅ Handler: حذف مزرعه
  // ============================================================
  const handleFarmDelete = useCallback(
    async (farm) => {
      if (!farm?.farm_id) return;

      try {
        await deleteFarmMutation.mutateAsync(farm.farm_id);

        // ✅ پاک‌سازی انتخاب اگر همین مزرعه انتخاب شده بود
        setSelectedFarmId((prev) =>
          String(prev) === String(farm.farm_id) ? null : prev
        );

        // ✅ بستن پنجره ویرایش اگر همین مزرعه در حال ویرایش بود
        if (
          editingFarmId &&
          String(editingFarmId) === String(farm.farm_id)
        ) {
          setFarmWindowOpen(false);
          setEditingFarm(null);
          setEditingFarmId(null);
        }
      } catch (err) {
        const raw =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          'خطا در حذف مزرعه';

        const finalMsg =
          typeof raw === 'object' && raw !== null
            ? raw.message || raw.detail || JSON.stringify(raw)
            : raw;

        window.alert(finalMsg);
      }
    },
    [deleteFarmMutation, editingFarmId, setSelectedFarmId]
  );

  // ============================================================
  // Handler: انتخاب مزرعه
  // ============================================================
  const handleFarmClick = useCallback(
    (farm) => {
      setSelectedFarmId(farm?.farm_id ?? null);
    },
    [setSelectedFarmId]
  );

  // ============================================================
  // Handler: ویرایش فرم
  // ============================================================
  const handleFarmEdit = useCallback((farm) => {
    if (!farm) return;
    setEditingFarm(farm);
    setEditingFarmId(farm.farm_id);
    setFarmWindowOpen(true);
  }, []);

  // ============================================================
  // Handler: ویرایش لایه (فعلاً log)
  // ============================================================
  const handleFarmEditGeometry = useCallback(
    (farm) => {
      if (!farm?.geojson) return;
      console.log('[editGeometry] ready for farm:', farm.farm_id);
      setSelectedFarmId(farm.farm_id);
    },
    [setSelectedFarmId]
  );

  // ============================================================
  // Handler: آپدیت polygonها
  // ============================================================
  const handlePolygonsUpdate = useCallback((data) => {
    setPolygonsData(data || { totalArea: 0, geojsons: [], count: 0 });
  }, []);

  // ============================================================
  // Handler: بستن پنجره شناور
  // ============================================================
  const handleWindowClose = useCallback(() => {
    setFarmWindowOpen(false);
    setEditingFarm(null);
    setEditingFarmId(null);
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <MapErrorBoundary>
      <div className="relative w-full h-full">
        <LocationPicker
          onLocationSelect={setSelectedLocation}
          onSearchChange={() => {}}
        />

        <MapComponent
          selectedLocation={selectedLocation}
          onPolygonsUpdate={handlePolygonsUpdate}
          savedFarms={savedFarms}
          colorByCrop={colorByCrop}
          onFarmClick={handleFarmClick}
          onFarmEdit={handleFarmEdit}
          onFarmEditGeometry={handleFarmEditGeometry}
          onFarmDelete={handleFarmDelete}
          selectedFarmId={selectedFarmId}
          snapEnabled={snapEnabled}
          onToggleSnap={() => setSnapEnabled((v) => !v)}
          snapToggleHidden={farmsLoading}
        />

        <MapCalculator
          polygonCount={polygonsData.count || 0}
          areaHa={polygonsData.totalArea || 0}
          showWater={true}
        />

        <DraggableFarmWindow
          isOpen={farmWindowOpen}
          onClose={handleWindowClose}
          onCancel={handleWindowClose}
          onSuccess={handleWindowClose}
          initialData={editingFarm}
          areaHa={polygonsData.totalArea || 0}
          geojson={polygonsData.geojsons || []}
          locationData={selectedLocation}
          isEditMode={!!editingFarm}
          editingFarmId={editingFarmId}
          isLoading={farmsLoading}
        />
      </div>
    </MapErrorBoundary>
  );
};

export default MapViewPage;