// src/pages/MapViewPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import MapErrorBoundary from "../features/map/components/MapErrorBoundary";
import MapComponent from "../features/map/components/MapComponent";
import MapCalculator from "../features/map/components/MapCalculator";

import {
  useFarmsQuery,
  useFarmersQuery,
} from "../features/farm-registration/hooks/useFarmsQuery";
import { useDeleteFarmMutation } from "../features/farm-registration/hooks/useFarmMutation";
import { useAgricultureSettings } from "../features/settings/hooks/useAgricultureSettings";
import { useFarmPanel } from "../features/farm-registration/panel/FarmPanelContext";

import useSessionState from "../shared/hooks/useSessionState";
import useLocalStorageState from "../shared/hooks/useLocalStorageState";

const FARM_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 100,
  search: null,
};

const FARMER_LIST_QUERY_PARAMS = {
  page: 1,
  pageSize: 100,
  search: null,
};

const MapViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openPanel, isOpen: isPanelOpen } = useFarmPanel();

  // ============================================================
  // Queries
  // ============================================================
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(
    FARM_LIST_QUERY_PARAMS,
  );

  const savedFarms = useMemo(() => farmsData?.farms || [], [farmsData]);

  const { data: farmersData } = useFarmersQuery(FARMER_LIST_QUERY_PARAMS);

  const farmersById = useMemo(() => {
    const map = {};
    const items = farmersData?.items || [];
    items.forEach((f) => {
      if (f?.id != null) {
        map[String(f.id)] = f;
      }
    });
    return map;
  }, [farmersData]);

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
  //
  // selectedLocation حالا در Layout مدیریت می‌شود.
  // ولی همچنان از sessionStorage می‌خوانیم برای MapComponent.
  // ============================================================
  const [selectedLocation] = useSessionState(
    "map_selected_location",
    null,
  );

  const [selectedFarmIdPersisted, setSelectedFarmId] = useSessionState(
    "map_selected_farm_id",
    null,
  );

  const [, setPendingGeojson] = useSessionState(
    "map_pending_geojson",
    null,
  );

  const [, setPendingArea] = useSessionState("map_pending_area", 0);

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

  // ============================================================
  // navigation state
  // ============================================================
  const navFocusFarmId = location.state?.focusFarmId || null;
  const navEditFarmId = location.state?.editFarmId || null;

  // ============================================================
  // مقادیر مؤثر
  // ============================================================
  const effectiveSelectedFarmId =
    navFocusFarmId || navEditFarmId || selectedFarmIdPersisted;

  // ============================================================
  // Sync URL state
  // ============================================================
  useEffect(() => {
    if (!navFocusFarmId && !navEditFarmId) return;

    const syncState = () => {
      if (navFocusFarmId) {
        setSelectedFarmId(navFocusFarmId);
      }
      if (navEditFarmId) {
        setSelectedFarmId(navEditFarmId);
        openPanel();
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
  const handleFarmEdit = useCallback(
    (farm) => {
      if (!farm?.farm_id) return;
      setSelectedFarmId(farm.farm_id);
      openPanel();
    },
    [setSelectedFarmId, openPanel],
  );

  // ============================================================
  // Handler: ویرایش لایه
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
  // Handler: آپدیت polygon ها
  // فقط وقتی polygon جدید رسم شد → پنل باز شود
  // ============================================================
  const handlePolygonsUpdate = useCallback(
    (data) => {
      const next = data || { totalArea: 0, geojsons: [], count: 0 };
      const prevCount = polygonsData.count || 0;

      setPolygonsData(next);
      setPendingGeojson(next.geojsons || null);
      setPendingArea(next.totalArea || 0);

      if (next.count > prevCount && !isPanelOpen) {
        openPanel();
      }
    },
    [
      setPendingGeojson,
      setPendingArea,
      openPanel,
      isPanelOpen,
      polygonsData.count,
    ],
  );

  // ============================================================
  // Render
  // ============================================================
  return (
    <MapErrorBoundary>
      <div className="relative w-full h-full">
        <MapComponent
          selectedLocation={selectedLocation}
          onPolygonsUpdate={handlePolygonsUpdate}
          savedFarms={savedFarms}
          farmersById={farmersById}
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
      </div>
    </MapErrorBoundary>
  );
};

export default MapViewPage;