// src/pages/MapViewPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";

import MapErrorBoundary from "../features/map/components/MapErrorBoundary";
import MapComponent from "../features/map/components/MapComponent";
import MapCalculator from "../features/map/components/MapCalculator";
import LocationPicker from "../features/location/components/LocationPicker";
import DraggableFarmWindow from "../features/farm-registration/components/DraggableFarmWindow";

import { useFarmsQuery } from "../features/farm-registration/hooks/useFarmsQuery";
import { useDeleteFarmMutation } from "../features/farm-registration/hooks/useFarmMutation";
import { useAgricultureSettings } from "../features/settings/hooks/useAgricultureSettings";

import useSessionState from "../shared/hooks/useSessionState";
import useLocalStorageState from "../shared/hooks/useLocalStorageState";

const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 100,
  search: null,
};

// ============================================================
// Helper: استخراج geojson از یک مزرعه با هر ساختاری
// ============================================================
const getFarmGeojson = (farm) => {
  if (!farm) return [];

  const geojson = farm.geojson;

  if (!geojson) return [];

  if (Array.isArray(geojson)) {
    return geojson;
  }

  if (geojson.type === "FeatureCollection") {
    return geojson.features || [];
  }

  if (geojson.type) {
    return [geojson];
  }

  return [];
};

const MapViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // Queries
  // ============================================================
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(
    FARM_LIST_QUERY_PARAMS,
  );

  const savedFarms = useMemo(() => farmsData?.farms || [], [farmsData]);

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
    "map_selected_location",
    null,
  );

  const [selectedFarmIdPersisted, setSelectedFarmId] = useSessionState(
    "map_selected_farm_id",
    null,
  );

  const [snapEnabled, setSnapEnabled] = useLocalStorageState(
    "map_snap_enabled",
    false,
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

  // ✅ state مجزا برای «ثبت جدید»
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // ============================================================
  // استخراج navigation state در render
  // ============================================================
  const navFocusFarmId = location.state?.focusFarmId || null;
  const navEditFarmId = location.state?.editFarmId || null;

  // ============================================================
  // مقادیر مؤثر
  // ============================================================
  const effectiveSelectedFarmId =
    navFocusFarmId || navEditFarmId || selectedFarmIdPersisted;

  const effectiveEditingFarmId = navEditFarmId || editingFarmIdState;

  const effectiveFarmWindowOpen =
    Boolean(navEditFarmId) || farmWindowOpenState || isCreatingNew;

  // ============================================================
  // Derive editingFarm
  // ============================================================
  const editingFarm = useMemo(() => {
    if (!effectiveEditingFarmId) return null;
    return (
      savedFarms.find(
        (f) => String(f.farm_id) === String(effectiveEditingFarmId),
      ) || null
    );
  }, [effectiveEditingFarmId, savedFarms]);

  // ============================================================
  // geojson نهایی برای DraggableFarmWindow
  // ============================================================
  const windowGeojson = useMemo(() => {
    if (editingFarm) {
      return getFarmGeojson(editingFarm);
    }
    return polygonsData.geojsons || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingFarm, polygonsData.geojsons]);

  // ============================================================
  // areaHa نهایی برای DraggableFarmWindow
  // ============================================================
  const windowAreaHa = useMemo(() => {
    if (editingFarm) {
      return Number(editingFarm.area_ha) || 0;
    }
    return Number(polygonsData.totalArea) || 0;
  }, [editingFarm, polygonsData.totalArea]);

  // ============================================================
  // Sync URL state به state داخلی
  // ============================================================
  useEffect(() => {
    if (!navFocusFarmId && !navEditFarmId) return;

    const syncState = () => {
      if (navFocusFarmId) {
        setSelectedFarmId(navFocusFarmId);
      }
      if (navEditFarmId) {
        setSelectedFarmId(navEditFarmId);
        setEditingFarmIdState(navEditFarmId);
        setFarmWindowOpen(true);
        setIsCreatingNew(false);
      }

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    };

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

        if (String(selectedFarmIdPersisted) === String(farm.farm_id)) {
          setSelectedFarmId(null);
        }

        if (String(editingFarmIdState) === String(farm.farm_id)) {
          setFarmWindowOpen(false);
          setEditingFarmIdState(null);
          setIsCreatingNew(false);
        }
      } catch (err) {
        const raw =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "خطا در حذف مزرعه";

        const finalMsg =
          typeof raw === "object" && raw !== null
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
    ],
  );

  // ============================================================
  // Handler: کلیک روی مزرعه
  // ============================================================
  const handleFarmClick = useCallback(
    (farm) => {
      setSelectedFarmId(farm?.farm_id ?? null);
    },
    [setSelectedFarmId],
  );

  // ============================================================
  // Handler: باز کردن فرم ویرایش
  // ============================================================
  const handleFarmEdit = useCallback((farm) => {
    if (!farm?.farm_id) return;
    setEditingFarmIdState(farm.farm_id);
    setFarmWindowOpen(true);
    setIsCreatingNew(false);
  }, []);

  // ============================================================
  // Handler: ویرایش لایه (geometry)
  // ============================================================
  const handleFarmEditGeometry = useCallback(
    (farm) => {
      if (!farm?.geojson) return;
      console.log("[editGeometry] ready for farm:", farm.farm_id);
      setSelectedFarmId(farm.farm_id);
    },
    [setSelectedFarmId],
  );

  // ============================================================
  // Handler: آپدیت polygonها
  // ============================================================
  const handlePolygonsUpdate = useCallback((data) => {
    setPolygonsData(data || { totalArea: 0, geojsons: [], count: 0 });
  }, []);

  // ============================================================
  // ✅ Handler: toggle فرم ثبت جدید (باز/بسته)
  // ============================================================
  const handleToggleCreate = useCallback(() => {
    setIsCreatingNew((prev) => {
      const next = !prev;

      if (next) {
        // باز کردن: پاک‌سازی حالت ویرایش
        setEditingFarmIdState(null);
        setFarmWindowOpen(false);
        setSelectedFarmId(null);
      }

      return next;
    });
  }, [setSelectedFarmId]);

  // ============================================================
  // Handler: بستن پنجره
  // ============================================================
  const handleWindowClose = useCallback(() => {
    setFarmWindowOpen(false);
    setEditingFarmIdState(null);
    setIsCreatingNew(false);
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

        {/* ============================================================ */}
        {/* ✅ FAB — دو حالته (باز/بسته) — مخفی در حالت ویرایش */}
        {/* ============================================================ */}
        {!editingFarm && (
          <button
            type="button"
            onClick={handleToggleCreate}
            className={`
              absolute bottom-6 left-1/2 -translate-x-1/2 z-[1100]
              flex items-center gap-2 px-5 py-3
              text-white rounded-full shadow-lg
              font-vazir font-semibold text-sm
              transition-colors duration-150
              ${isCreatingNew
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary-600 hover:bg-primary-700"}
            `}
            title={isCreatingNew ? "بستن فرم ثبت" : "ثبت زمین جدید"}
            aria-label={isCreatingNew ? "بستن فرم ثبت" : "ثبت زمین جدید"}
            aria-expanded={isCreatingNew}
          >
            {isCreatingNew ? (
              <>
                <X size={18} strokeWidth={2.6} />
                <span>بستن فرم</span>
              </>
            ) : (
              <>
                <Plus size={18} strokeWidth={2.6} />
                <span>ثبت زمین جدید</span>
              </>
            )}
          </button>
        )}

        <DraggableFarmWindow
          isOpen={effectiveFarmWindowOpen}
          onClose={handleWindowClose}
          onCancel={handleWindowClose}
          onSuccess={handleWindowClose}
          initialData={editingFarm}
          areaHa={windowAreaHa}
          geojson={windowGeojson}
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