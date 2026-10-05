// src/pages/MapViewPage.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Save, X, Loader2, MapPin } from "lucide-react";

import MapErrorBoundary from "../features/map/components/MapErrorBoundary";
import MapComponent from "../features/map/components/MapComponent";
import MapCalculator from "../features/map/components/MapCalculator";

import {
  useFarmsQuery,
  useFarmersQuery,
} from "../features/farm-registration/hooks/useFarmsQuery";
import {
  FARM_LIST_QUERY_PARAMS,
  FARMER_LIST_QUERY_PARAMS,
} from "../features/farm-registration/hooks/farmQueryKeys";
import { useDeleteFarmMutation } from "../features/farm-registration/hooks/useFarmMutation";
import { useAgricultureSettings } from "../features/settings/hooks/useAgricultureSettings";
import { useFarmPanel } from "../features/farm-registration/panel/FarmPanelContext";
import { usePermissions } from "../features/auth/hooks/usePermissions";
import {
  useRegionQuery,
  useUpdateRegionGeometryMutation,
} from "../features/regions/hooks/useRegions";

import useSessionState from "../shared/hooks/useSessionState";
import useLocalStorageState from "../shared/hooks/useLocalStorageState";
import { useToast } from "../shared/components/Toast/ToastProvider";
import apiClient from "../services/api/apiClient";

// ═══════════════════════════════════════════════════════════
// Query: همه‌ی شکل‌های مزارع (برای نمایش روی نقشه)
// ═══════════════════════════════════════════════════════════
const useMapShapesQuery = () => {
  const { isSuperAdmin, isManager } = usePermissions();

  return useQuery({
    queryKey: ["map-shapes"],
    queryFn: async () => {
      const response = await apiClient.get("/farms/map-shapes");
      return response.data?.items || [];
    },
    staleTime: 60 * 1000,
    // همه نقش‌ها این را لازم دارند
    enabled: true,
  });
};

const MapViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { openPanel, isOpen: isPanelOpen } = useFarmPanel();
  const { isSuperAdmin, isManager, isDehyar } = usePermissions();

  // Regions toggle
  const [showRegions] = useLocalStorageState('map_show_regions_v1', false);

  // Region edit state
  const [editRegionId, setEditRegionId] = useState(
    location.state?.editRegionId || null,
  );
  const [regionEditLoading, setRegionEditLoading] = useState(false);
  const [regionEditSaving, setRegionEditSaving] = useState(false);
  const [regionEditPolygonCount, setRegionEditPolygonCount] = useState(0);

  const drawnItemsRef = useRef(null);
  const drawingApiRef = useRef(null);

  const updateRegionGeometryMutation = useUpdateRegionGeometryMutation();

  const { data: editingRegion } = useRegionQuery(editRegionId, {
    enabled: !!editRegionId,
  });

  // ✅ همه شکل‌ها (برای نمایش روی نقشه)
  const { data: allShapes = [], isLoading: shapesLoading } = useMapShapesQuery();

  // ✅ فقط مزارع خودی (برای MapCalculator و ...)
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(
    FARM_LIST_QUERY_PARAMS,
  );

  const ownFarms = useMemo(() => farmsData?.farms || [], [farmsData]);

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

  const { crops } = useAgricultureSettings();

  const colorByCrop = useMemo(() => {
    const map = {};
    (crops || []).forEach((c) => {
      if (c?.name && c?.color) map[c.name] = c.color;
    });
    return map;
  }, [crops]);

  // State
  const [selectedLocation] = useSessionState("map_selected_location", null);
  const [selectedFarmIdPersisted, setSelectedFarmId] = useSessionState(
    "map_selected_farm_id",
    null,
  );
  const [selectedRegionId, setSelectedRegionId] = useSessionState(
    "map_selected_region_id",
    null,
  );
  const [, setPendingGeojson] = useSessionState("map_pending_geojson", null);
  const [, setPendingArea] = useSessionState("map_pending_area", 0);
  const [snapEnabled, setSnapEnabled] = useLocalStorageState(
    "map_snap_enabled",
    false,
  );

  const [polygonsData, setPolygonsData] = useState({
    totalArea: 0,
    geojsons: [],
    count: 0,
  });

  const navFocusFarmId = location.state?.focusFarmId || null;
  const navEditFarmId = location.state?.editFarmId || null;
  const navEditRegionId = location.state?.editRegionId || null;

  const effectiveSelectedFarmId =
    navFocusFarmId || navEditFarmId || selectedFarmIdPersisted;

  useEffect(() => {
    if (!navFocusFarmId && !navEditFarmId && !navEditRegionId) return;

    const syncState = () => {
      if (navFocusFarmId) setSelectedFarmId(navFocusFarmId);
      if (navEditFarmId) {
        setSelectedFarmId(navEditFarmId);
        openPanel();
      }
      if (navEditRegionId) {
        setEditRegionId(navEditRegionId);
        setRegionEditLoading(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    };

    queueMicrotask(syncState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navFocusFarmId, navEditFarmId, navEditRegionId]);

  const deleteFarmMutation = useDeleteFarmMutation();

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
    [deleteFarmMutation, selectedFarmIdPersisted, setSelectedFarmId],
  );

  const handleFarmClick = useCallback(
    (farm) => {
      setSelectedFarmId(farm?.farm_id ?? null);
    },
    [setSelectedFarmId],
  );

  const handleRegionClick = useCallback(
    (region) => {
      setSelectedRegionId(region?.id ?? null);
    },
    [setSelectedRegionId],
  );

  const handleFarmEdit = useCallback(
    (farm) => {
      if (!farm?.farm_id) return;
      setSelectedFarmId(farm.farm_id);
      openPanel();
    },
    [setSelectedFarmId, openPanel],
  );

  const handleFarmEditGeometry = useCallback(
    (farm) => {
      if (!farm?.geojson) return;
      setSelectedFarmId(farm.farm_id);
    },
    [setSelectedFarmId],
  );

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

      if (editRegionId) {
        setRegionEditPolygonCount(next.count || 0);
      }
    },
    [
      setPendingGeojson,
      setPendingArea,
      openPanel,
      isPanelOpen,
      polygonsData.count,
      editRegionId,
    ],
  );

  const handleDrawnItemsReady = useCallback((ref) => {
    drawnItemsRef.current = ref;
  }, []);

  const handleDrawingApiReady = useCallback((api) => {
    drawingApiRef.current = api;
  }, []);

  const handleRegionEditLoaded = useCallback(
    (region, polygonCount) => {
      setRegionEditLoading(false);
      setRegionEditPolygonCount(polygonCount);
    },
    [],
  );

  const handleRegionEditError = useCallback((err) => {
    console.error('Region edit error:', err);
    setRegionEditLoading(false);
    toast.error('خطا در بارگذاری مرز منطقه', 'خطا');
  }, [toast]);

  const handleSaveRegionGeometry = useCallback(async () => {
    if (!editRegionId) return;

    const api = drawingApiRef.current;
    if (!api?.getDrawnGeojson) {
      toast.error('API نقشه آماده نیست', 'خطا');
      return;
    }

    const geojson = api.getDrawnGeojson();
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      toast.warning('لطفاً ابتدا مرز منطقه را رسم کنید', 'توجه');
      return;
    }

    setRegionEditSaving(true);
    try {
      await updateRegionGeometryMutation.mutateAsync({
        regionId: editRegionId,
        geojson,
      });
      toast.success('مرز منطقه ذخیره شد', 'ذخیره شد');
      handleCancelRegionEdit();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'خطا در ذخیره مرز';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg), 'خطا');
    } finally {
      setRegionEditSaving(false);
    }
  }, [editRegionId, updateRegionGeometryMutation, toast]);

  const handleCancelRegionEdit = useCallback(() => {
    setEditRegionId(null);
    setRegionEditLoading(false);
    setRegionEditPolygonCount(0);

    const api = drawingApiRef.current;
    if (api?.clearPolygons) {
      api.clearPolygons();
    }

    navigate('/map', { replace: true });
  }, [navigate]);

  const isRegionEditMode = !!editRegionId;

  return (
    <MapErrorBoundary>
      <div className="relative w-full h-full">
        <MapComponent
          selectedLocation={selectedLocation}
          onPolygonsUpdate={handlePolygonsUpdate}
          savedFarms={allShapes}
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

          showRegions={isSuperAdmin && showRegions && !isRegionEditMode}
          selectedRegionId={selectedRegionId}
          onRegionClick={handleRegionClick}

          editRegionId={editRegionId}
          drawnItemsRef={drawnItemsRef}
          onRegionEditLoaded={handleRegionEditLoaded}
          onRegionEditError={handleRegionEditError}
          onDrawnItemsReady={handleDrawnItemsReady}
          onDrawingApiReady={handleDrawingApiReady}
        />

        {/* نوار بالای صفحه در حالت ویرایش */}
        {isRegionEditMode && (
          <div
            className="
              absolute top-20 left-1/2 -translate-x-1/2 z-[1050]
              flex items-center gap-3
              px-4 py-2.5 rounded-2xl
              bg-purple-50/95 backdrop-blur-xl
              border border-purple-300/60
              shadow-[0_8px_32px_rgba(124,58,237,0.25)]
              font-vazir
            "
            dir="rtl"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                <MapPin size={15} className="text-purple-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-900">
                  ویرایش مرز: {editingRegion?.name || '...'}
                </div>
                <div className="text-[10px] text-purple-600 mt-0.5">
                  {regionEditLoading
                    ? 'در حال بارگذاری...'
                    : `${regionEditPolygonCount.toLocaleString('fa-IR')} قطعه رسم شده`}
                </div>
              </div>
            </div>

            <div className="w-px h-8 bg-purple-300/60" />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCancelRegionEdit}
                disabled={regionEditSaving}
                className="
                  flex items-center gap-1.5
                  px-3 py-1.5 rounded-lg
                  bg-white text-purple-700
                  border border-purple-300
                  text-[11px] font-bold
                  hover:bg-purple-50 transition-colors
                  disabled:opacity-50
                "
              >
                <X size={12} />
                لغو
              </button>

              <button
                type="button"
                onClick={handleSaveRegionGeometry}
                disabled={regionEditSaving || regionEditLoading}
                className="
                  flex items-center gap-1.5
                  px-3 py-1.5 rounded-lg
                  bg-purple-600 text-white
                  text-[11px] font-bold
                  hover:bg-purple-700 transition-colors
                  disabled:opacity-50
                "
              >
                {regionEditSaving ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    ذخیره مرز
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!isRegionEditMode && (
          <MapCalculator
            polygonCount={polygonsData.count || 0}
            areaHa={polygonsData.totalArea || 0}
            showWater={true}
          />
        )}
      </div>
    </MapErrorBoundary>
  );
};

export default MapViewPage;