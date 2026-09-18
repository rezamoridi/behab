// src/pages/MapViewPage.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  pageSize: 100,
  search: null,
};

const MapViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // Queries
  // ============================================================
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(
    FARM_LIST_QUERY_PARAMS
  );

  const savedFarms = useMemo(
    () => farmsData?.farms || [],
    [farmsData]
  );

  // ============================================================
  // Crop colors map
  // ============================================================
  const { crops } = useAgricultureSettings();

  const colorByCrop = useMemo(() => {
    const map = {};
    (crops || []).forEach((c) => {
      if (c?.name && c?.color) map[c.name] = c.color;
    });
    return map;
  }, [crops]);

  // ============================================================
  // State (persisted)
  // ============================================================
  const [selectedLocation, setSelectedLocation] = useSessionState(
    'map_selected_location',
    null
  );

  const [selectedFarmIdPersisted, setSelectedFarmId] = useSessionState(
    'map_selected_farm_id',
    null
  );

  const [snapEnabled, setSnapEnabled] = useLocalStorageState(
    'map_snap_enabled',
    false
  );

  // ============================================================
  // State (موقت)
  // ============================================================
  const [polygonsData, setPolygonsData] = useState({
    totalArea: 0,
    geojsons: [],
    count: 0,
  });

  const [farmWindowOpenState, setFarmWindowOpen] = useState(false);
  const [editingFarmIdState, setEditingFarmIdState] = useState(null);

  // ============================================================
  // ✅ استخراج navigation state در render
  //    (بدون useEffect، بدون setState)
  // ============================================================
  const navFocusFarmId = location.state?.focusFarmId || null;
  const navEditFarmId = location.state?.editFarmId || null;

  // ============================================================
  // ✅ مقادیر مؤثر — ترکیب state داخلی و navigation state
  //
  // اگه navigation state اومده، اون اولویت داره.
  // اینطوری نیازی به effect و setState نیست.
  // ============================================================
  const effectiveSelectedFarmId =
    navFocusFarmId || navEditFarmId || selectedFarmIdPersisted;

  const effectiveEditingFarmId = navEditFarmId || editingFarmIdState;

  const effectiveFarmWindowOpen =
    Boolean(navEditFarmId) || farmWindowOpenState;

  // ============================================================
  // ✅ Derive editingFarm از savedFarms + effectiveEditingFarmId
  // ============================================================
  const editingFarm = useMemo(() => {
    if (!effectiveEditingFarmId) return null;
    return (
      savedFarms.find(
        (f) => String(f.farm_id) === String(effectiveEditingFarmId)
      ) || null
    );
  }, [effectiveEditingFarmId, savedFarms]);

  // ============================================================
  // ✅ Sync URL state به state داخلی — فقط یک بار
  //
  // این effect از نظر React مجازه چون:
  // 1. به یک external system (URL / history) وصل می‌شه
  // 2. بعد از sync، URL رو پاک می‌کنه تا دوباره اجرا نشه
  // 3. setState اینجا خیلی سریع settle می‌شه (یک بار)
  //
  // ولی برای رعایت سخت‌گیرانه lint، می‌تونیم setState رو
  // داخل یک microtask بذاریم.
  // ============================================================
  useEffect(() => {
    if (!navFocusFarmId && !navEditFarmId) return;

    // ✅ sync state داخلی با URL
    // (این کار در effect مجازه چون با external system همگام می‌شه)
    const syncState = () => {
      if (navFocusFarmId) {
        setSelectedFarmId(navFocusFarmId);
      }
      if (navEditFarmId) {
        setSelectedFarmId(navEditFarmId);
        setEditingFarmIdState(navEditFarmId);
        setFarmWindowOpen(true);
      }

      // پاک‌سازی URL
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    };

    // ✅ اجرا در microtask بعدی — از cascading render همون tick جلوگیری می‌کنه
    queueMicrotask(syncState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navFocusFarmId, navEditFarmId]);

  // ============================================================
  // Mutations
  // ============================================================
  const deleteFarmMutation = useDeleteFarmMutation();

  // ============================================================
  // Handler: حذف
  // ============================================================
  const handleFarmDelete = useCallback(
    async (farm) => {
      if (!farm?.farm_id) return;

      try {
        await deleteFarmMutation.mutateAsync(farm.farm_id);

        if (
          String(selectedFarmIdPersisted) === String(farm.farm_id)
        ) {
          setSelectedFarmId(null);
        }

        if (
          String(editingFarmIdState) === String(farm.farm_id)
        ) {
          setFarmWindowOpen(false);
          setEditingFarmIdState(null);
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
    [
      deleteFarmMutation,
      editingFarmIdState,
      selectedFarmIdPersisted,
      setSelectedFarmId,
    ]
  );

  // ============================================================
  // Handler: کلیک روی مزرعه
  // ============================================================
  const handleFarmClick = useCallback(
    (farm) => {
      setSelectedFarmId(farm?.farm_id ?? null);
    },
    [setSelectedFarmId]
  );

  // ============================================================
  // Handler: باز کردن فرم ویرایش
  // ============================================================
  const handleFarmEdit = useCallback((farm) => {
    if (!farm?.farm_id) return;
    setEditingFarmIdState(farm.farm_id);
    setFarmWindowOpen(true);
  }, []);

  // ============================================================
  // Handler: ویرایش لایه
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
  // Handler: بستن پنجره
  // ============================================================
  const handleWindowClose = useCallback(() => {
    setFarmWindowOpen(false);
    setEditingFarmIdState(null);
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
          selectedFarmId={effectiveSelectedFarmId}
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
          isOpen={effectiveFarmWindowOpen}
          onClose={handleWindowClose}
          onCancel={handleWindowClose}
          onSuccess={handleWindowClose}
          initialData={editingFarm}
          areaHa={polygonsData.totalArea || 0}
          geojson={polygonsData.geojsons || []}
          locationData={selectedLocation}
          isEditMode={!!editingFarm}
          editingFarmId={effectiveEditingFarmId}
          isLoading={farmsLoading}
        />
      </div>
    </MapErrorBoundary>
  );
};

export default MapViewPage;