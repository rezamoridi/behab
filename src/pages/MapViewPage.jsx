// src/pages/MapViewPage.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Save, X, Loader2, MapPin } from "lucide-react";

import MapErrorBoundary from "../features/map/components/MapErrorBoundary";
import MapComponent from "../features/map/components/MapComponent";
import MapCalculator from "../features/map/components/MapCalculator";
import FarmHistoryModal from "../features/map/components/FarmHistoryModal";

import {
  useFarmsQuery,
  useFarmersQuery,
  useReferenceLayerQuery,
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
import {
  useVillageQuery,
  useUpdateVillageMutation,
} from "../features/villages/hooks/useVillages";

import useSessionState from "../shared/hooks/useSessionState";
import useLocalStorageState from "../shared/hooks/useLocalStorageState";
import { useToast } from "../shared/components/Toast/ToastProvider";
import { useConfirm } from "../shared/components/ConfirmDialog/ConfirmDialogProvider";

const MapViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  // ✅ دریافت editingFarmId و openPanelForEdit از Context
  const {
    openPanel,
    openPanelForEdit,
    editingFarmId,
    isOpen: isPanelOpen,
  } = useFarmPanel();

  const { isSuperAdmin } = usePermissions();

  // ── نمایش لایه‌ها از localStorage ──
  const [showRegions] = useLocalStorageState("map_show_regions_v1", false);
  const [showVillages] = useLocalStorageState("map_show_villages_v1", true);

  const [snapEnabled, setSnapEnabled] = useLocalStorageState(
    "map_snap_enabled",
    true,
  );

  // ═══════════════════════════════════════════════════════════
  // Region edit state
  // ═══════════════════════════════════════════════════════════
  const [editRegionId, setEditRegionId] = useState(
    location.state?.editRegionId || null,
  );
  const [regionEditLoading, setRegionEditLoading] = useState(false);
  const [regionEditSaving, setRegionEditSaving] = useState(false);
  const [regionEditPolygonCount, setRegionEditPolygonCount] = useState(0);

  // ═══════════════════════════════════════════════════════════
  // Village edit state
  // ═══════════════════════════════════════════════════════════
  const [editVillageId, setEditVillageId] = useState(
    location.state?.editVillageId || null,
  );
  const [villageEditLoading, setVillageEditLoading] = useState(false);
  const [villageEditSaving, setVillageEditSaving] = useState(false);
  const [villageEditPolygonCount, setVillageEditPolygonCount] = useState(0);

  // ═══════════════════════════════════════════════════════════
  // Focus Farm state
  // ═══════════════════════════════════════════════════════════
  const [pendingFocusFarmId, setPendingFocusFarmId] = useState(
    location.state?.focusFarmId || null,
  );
  const [focusFarmObject, setFocusFarmObject] = useState(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  // ✅ باز کردن خودکار پاپ‌آپ مزرعه
  const [autoOpenPopupFarmId, setAutoOpenPopupFarmId] = useState(null);

  // ═══════════════════════════════════════════════════════════
  // ✅ Farm geometry edit state (متصل به MapController)
  // ═══════════════════════════════════════════════════════════
  const [geometriesToEdit, setGeometriesToEdit] = useState(null);
  const [editGeometryTrigger, setEditGeometryTrigger] = useState(0);
  const [editGeometryOptions, setEditGeometryOptions] = useState(null);

  const drawnItemsRef = useRef(null);
  const drawingApiRef = useRef(null);

  // ── Mutations ──
  const updateRegionGeometryMutation = useUpdateRegionGeometryMutation();
  const updateVillageMutation = useUpdateVillageMutation();

  // ── Queries ──
  const { data: editingRegion } = useRegionQuery(editRegionId, {
    enabled: !!editRegionId,
  });

  const { data: editingVillage } = useVillageQuery(editVillageId, {
    enabled: !!editVillageId,
  });

  const {
    data: farmsData,
    isLoading: farmsLoading,
    refetch: refetchFarms,
  } = useFarmsQuery(FARM_LIST_QUERY_PARAMS);

  const ownFarms = useMemo(() => farmsData?.farms || [], [farmsData]);

  const { data: referenceData } = useReferenceLayerQuery();
  const referenceFarms = useMemo(
    () => referenceData?.items || [],
    [referenceData],
  );

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

  const { crops, settings: agricultureSettings } = useAgricultureSettings();

  const colorByCrop = useMemo(() => {
    const map = {};
    (crops || []).forEach((c) => {
      if (c?.name && c?.color) map[c.name] = c.color;
    });
    return map;
  }, [crops]);

  const referenceStyle = useMemo(
    () => ({
      color: agricultureSettings?.reference_layer_color || "#9E9E9E",
      stroke_weight: agricultureSettings?.reference_layer_stroke_weight ?? 2,
      stroke_style:
        agricultureSettings?.reference_layer_stroke_style || "solid",
      fill_opacity: agricultureSettings?.reference_layer_fill_opacity ?? 0.08,
    }),
    [agricultureSettings],
  );

  // ── State ──
  const [selectedLocation, setSelectedLocation] = useSessionState(
    "map_selected_location",
    null,
  );
  const [selectedFarmIdPersisted, setSelectedFarmId] = useSessionState(
    "map_selected_farm_id",
    null,
  );
  const [selectedRegionId, setSelectedRegionId] = useSessionState(
    "map_selected_region_id",
    null,
  );
  const [selectedVillageId, setSelectedVillageId] = useSessionState(
    "map_selected_village_id",
    null,
  );
  const [, setPendingGeojson] = useSessionState("map_pending_geojson", null);
  const [, setPendingArea] = useSessionState("map_pending_area", 0);

  const [polygonsData, setPolygonsData] = useState({
    totalArea: 0,
    geojsons: [],
    count: 0,
  });

  // ── Navigation state ──
  const navFocusFarmId = location.state?.focusFarmId || null;
  const navEditGeometryFarmId = location.state?.editGeometryFarmId || null;
  const navEditRegionId = location.state?.editRegionId || null;
  const navEditVillageId = location.state?.editVillageId || null;

  const effectiveSelectedFarmId =
    navFocusFarmId || editingFarmId || selectedFarmIdPersisted;

  // ═══════════════════════════════════════════════════════════
  // گوش دادن به رویداد همپوشانی
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleOverlapDetected = (e) => {
      const detail = e?.detail || {};
      const message =
        detail.message || "این مزرعه با مزرعه‌ی ثبت‌شده همپوشانی دارد.";

      toast.error(message, "رسم مسدود شد");
    };

    window.addEventListener("map:overlap-detected", handleOverlapDetected);

    return () => {
      window.removeEventListener("map:overlap-detected", handleOverlapDetected);
    };
  }, [toast]);

  // ═══════════════════════════════════════════════════════════
  // ✅ ریست نقشه بعد از ثبت/ویرایش موفق یا لغو
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleReset = (e) => {
      const reason = e?.detail?.reason || "submit";

      // ─── ۱. پاک‌سازی قطعی لایه‌ها (همیشه) ───
      try {
        const api = drawingApiRef.current;
        if (api?.clearPolygons) {
          api.clearPolygons();
        }
      } catch (err) {
        console.warn("api.clearPolygons failed:", err);
      }

      // BACKUP: مستقیم از FeatureGroup
      try {
        const fg = drawnItemsRef.current;
        if (fg && typeof fg.getLayers === "function") {
          const layers = fg.getLayers();

          layers.forEach((layer) => {
            try {
              if (layer.getTooltip && layer.getTooltip()) {
                layer.unbindTooltip();
              }
              fg.removeLayer(layer);
            } catch (err) {
              console.warn("fg.removeLayer failed:", err);
            }
          });

          fg.clearLayers();
        }
      } catch (err) {
        console.warn("direct featureGroup cleanup failed:", err);
      }

      // ─── ۲. ریست state محلی (sync) ───
      setPolygonsData({ totalArea: 0, geojsons: [], count: 0 });

      // ─── ۳. ریست stateهای سراسری (بدون بستن پنل) ───
      setTimeout(() => {
        try {
          setPendingGeojson(null);
          setPendingArea(0);
          setSelectedFarmId(null);
          setFocusFarmObject(null);
          setAutoOpenPopupFarmId(null);

          if (reason === "register" || reason === "update") {
            refetchFarms?.();
          }
        } catch (err) {
          console.warn("reset deferred failed:", err);
        }
      }, 0);
    };

    window.addEventListener("farm:geometry-reset", handleReset);
    return () => window.removeEventListener("farm:geometry-reset", handleReset);
  }, [setPendingGeojson, setPendingArea, setSelectedFarmId, refetchFarms]);

  // ═══════════════════════════════════════════════════════════
  // Sync navigation state — فقط برای region/village
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!navEditRegionId && !navEditVillageId) {
      return;
    }

    const syncState = () => {
      if (navEditRegionId) {
        setEditRegionId(navEditRegionId);
        setRegionEditLoading(true);
      }
      if (navEditVillageId) {
        setEditVillageId(navEditVillageId);
        setVillageEditLoading(true);
      }
      navigate(location.pathname, { replace: true, state: {} });
    };

    const timerId = setTimeout(syncState, 0);
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navEditRegionId, navEditVillageId]);

  // ═══════════════════════════════════════════════════════════
  // ✅ خواندن editGeometryFarmId از state (از /lands)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!navEditGeometryFarmId) return;
    if (!ownFarms || ownFarms.length === 0) return;

    const found = ownFarms.find(
      (f) => String(f.farm_id) === String(navEditGeometryFarmId),
    );

    if (!found) {
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    const features = (() => {
      const gj = found.geojson;
      if (!gj) return [];
      if (Array.isArray(gj)) {
        return gj.map((item) =>
          item?.type === "Feature"
            ? item
            : { type: "Feature", properties: {}, geometry: item },
        );
      }
      if (gj.type === "FeatureCollection") {
        return Array.isArray(gj.features) ? gj.features : [];
      }
      if (gj.type === "Feature") return [gj];
      return [{ type: "Feature", properties: {}, geometry: gj }];
    })();

    if (features.length === 0) {
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    setSelectedFarmId(navEditGeometryFarmId);
    setGeometriesToEdit(features);
    setEditGeometryOptions({
      color: "#FF9800",
      weight: 3,
      fillOpacity: 0.3,
    });
    setEditGeometryTrigger((t) => t + 1);

    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navEditGeometryFarmId, ownFarms]);

  // ═══════════════════════════════════════════════════════════
  // Focus Farm
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!pendingFocusFarmId) return;
    if (!ownFarms || ownFarms.length === 0) return;

    const found = ownFarms.find(
      (f) => String(f.farm_id) === String(pendingFocusFarmId),
    );

    if (!found) {
      setPendingFocusFarmId(null);
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    setFocusFarmObject(found);
    setFocusTrigger((t) => t + 1);
    setSelectedFarmId(pendingFocusFarmId);

    // ✅ باز کردن خودکار پاپ‌آپ مزرعه
    setAutoOpenPopupFarmId(pendingFocusFarmId);

    setPendingFocusFarmId(null);

    navigate(location.pathname, { replace: true, state: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFocusFarmId, ownFarms]);

  // ✅ پاک کردن auto-open وقتی مزرعه‌ای انتخاب نشده
  useEffect(() => {
    if (!effectiveSelectedFarmId) {
      setFocusFarmObject(null);
      setAutoOpenPopupFarmId(null);
    }
  }, [effectiveSelectedFarmId]);

  // ── Delete farm ──
  const deleteFarmMutation = useDeleteFarmMutation();

  const handleFarmDelete = useCallback(
    async (farm) => {
      if (!farm?.farm_id) return;
      try {
        await deleteFarmMutation.mutateAsync(farm.farm_id);
        if (String(selectedFarmIdPersisted) === String(farm.farm_id)) {
          setSelectedFarmId(null);
        }
        toast.success("مزرعه حذف شد", "حذف شد");
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
        toast.error(finalMsg, "خطا");
      }
    },
    [deleteFarmMutation, selectedFarmIdPersisted, setSelectedFarmId, toast],
  );

  // ── Farm handlers ──
  const handleFarmClick = useCallback(
    (farm) => {
      setSelectedFarmId(farm?.farm_id ?? null);
    },
    [setSelectedFarmId],
  );

  // ═══════════════════════════════════════════════════════════
  // ✅ handleFarmEdit — با استفاده از Context
  // ═══════════════════════════════════════════════════════════
  const handleFarmEdit = useCallback(
    (farm) => {
      if (!farm?.farm_id) return;
      setSelectedFarmId(farm.farm_id);
      // ✅ باز کردن پنل در حالت ویرایش
      openPanelForEdit(farm.farm_id);
    },
    [setSelectedFarmId, openPanelForEdit],
  );

  // ═══════════════════════════════════════════════════════════
  // ✅ handleFarmEditGeometry — از پاپ‌آپ نقشه
  // ═══════════════════════════════════════════════════════════
  const handleFarmEditGeometry = useCallback(
    (farm) => {
      if (!farm?.geojson) return;

      setSelectedFarmId(farm.farm_id);

      const features = (() => {
        const gj = farm.geojson;
        if (!gj) return [];
        if (Array.isArray(gj)) {
          return gj.map((item) =>
            item?.type === "Feature"
              ? item
              : { type: "Feature", properties: {}, geometry: item },
          );
        }
        if (gj.type === "FeatureCollection") {
          return Array.isArray(gj.features) ? gj.features : [];
        }
        if (gj.type === "Feature") return [gj];
        return [{ type: "Feature", properties: {}, geometry: gj }];
      })();

      if (features.length === 0) return;

      setGeometriesToEdit(features);
      setEditGeometryOptions({
        color: "#FF9800",
        weight: 3,
        fillOpacity: 0.3,
      });
      setEditGeometryTrigger((t) => t + 1);
    },
    [setSelectedFarmId],
  );

  const [historyFarm, setHistoryFarm] = useState(null);

  const handleFarmHistory = useCallback((farm) => {
    if (!farm?.farm_id) return;
    setHistoryFarm(farm);
  }, []);

  const handleFarmTransfer = useCallback((farm) => {
    if (!farm?.farm_id) return;
    setHistoryFarm(farm);
  }, []);

  // ── Region handlers ──
  const handleRegionClick = useCallback(
    (region) => {
      setSelectedRegionId(region?.id ?? null);
    },
    [setSelectedRegionId],
  );

  // ── Village click ──
  const handleVillageClick = useCallback(
    (village) => {
      setSelectedVillageId(village?.id ?? null);
    },
    [setSelectedVillageId],
  );

  // ═══════════════════════════════════════════════════════════
  // handlePolygonsUpdate — با تشخیص تداخل ویرایش/رسم جدید
  // ═══════════════════════════════════════════════════════════
  const handlePolygonsUpdate = useCallback(
    (data) => {
      const next = data || { totalArea: 0, geojsons: [], count: 0 };
      const prevCount = polygonsData.count || 0;

      // ✅ تشخیص تداخل با editingFarmId
      const isEditingAnotherFarm = !!editingFarmId;
      const isNewDrawing = next.count > 0 && next.count > prevCount;

      if (isEditingAnotherFarm && isNewDrawing) {
        setTimeout(async () => {
          try {
            const ok = await confirm({
              title: "ویرایش در جریان است",
              message:
                "در حال ویرایش مزرعه‌ای هستید. با رسم polygon جدید، " +
                "ویرایش قبلی لغو می‌شود و یک زمین جدید ثبت خواهد شد. " +
                "ادامه می‌دهید؟",
              confirmText: "بله، زمین جدید ثبت کن",
              cancelText: "لغو رسم",
              variant: "danger",
            });

            if (!ok) {
              // ─── کاربر لغو کرد: polygon جدید را حذف کن ───
              try {
                const api = drawingApiRef.current;
                if (api?.removeLastPolygon) {
                  api.removeLastPolygon();
                }
              } catch (err) {
                console.warn("removeLastPolygon failed:", err);
              }

              setPolygonsData({ totalArea: 0, geojsons: [], count: 0 });
              return;
            }

            // ─── کاربر تأیید کرد: ویرایش A را لغو کن ───
            try {
              window.dispatchEvent(
                new CustomEvent("farm:edit-cancel", {
                  detail: { reason: "new-drawing-confirmed" },
                }),
              );
            } catch (err) {
              console.warn("edit-cancel dispatch failed:", err);
            }

            // polygon جدید به‌عنوان ثبت جدید
            setPolygonsData(next);
            setPendingGeojson(next.geojsons || null);
            setPendingArea(next.totalArea || 0);

            if (!isPanelOpen) {
              openPanel();
            }
          } catch (err) {
            console.warn("handlePolygonsUpdate conflict handler failed:", err);
          }
        }, 0);

        return;
      }

      // ─── حالت عادی (بدون تداخل) ───
      setPolygonsData(next);

      if (editRegionId) setRegionEditPolygonCount(next.count || 0);
      if (editVillageId) setVillageEditPolygonCount(next.count || 0);

      setTimeout(() => {
        setPendingGeojson(next.geojsons || null);
        setPendingArea(next.totalArea || 0);

        if (next.count > prevCount && !isPanelOpen) {
          openPanel();
        }
      }, 0);
    },
    [
      setPendingGeojson,
      setPendingArea,
      openPanel,
      isPanelOpen,
      polygonsData.count,
      editRegionId,
      editVillageId,
      editingFarmId,
      confirm,
    ],
  );

  const handleDrawnItemsReady = useCallback((ref) => {
    drawnItemsRef.current = ref;
  }, []);

  const handleDrawingApiReady = useCallback((api) => {
    drawingApiRef.current = api;
  }, []);

  // ── Region edit handlers ──
  const handleRegionEditLoaded = useCallback((region, polygonCount) => {
    setRegionEditLoading(false);
    setRegionEditPolygonCount(polygonCount);
  }, []);

  const handleRegionEditError = useCallback(
    (err) => {
      console.error("Region edit error:", err);
      setRegionEditLoading(false);
      toast.error("خطا در بارگذاری مرز منطقه", "خطا");
    },
    [toast],
  );

  const handleSaveRegionGeometry = useCallback(async () => {
    if (!editRegionId) return;

    const api = drawingApiRef.current;
    if (!api?.getDrawnGeojson) {
      toast.error("API نقشه آماده نیست", "خطا");
      return;
    }

    const geojson = api.getDrawnGeojson();
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      toast.warning("لطفاً ابتدا مرز منطقه را رسم کنید", "توجه");
      return;
    }

    setRegionEditSaving(true);
    try {
      await updateRegionGeometryMutation.mutateAsync({
        regionId: editRegionId,
        geojson,
      });
      toast.success("مرز منطقه ذخیره شد", "ذخیره شد");
      handleCancelRegionEdit();
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "خطا در ذخیره مرز";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg), "خطا");
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

    navigate("/map", { replace: true });
  }, [navigate]);

  // ── Village edit handlers ──
  const handleVillageEditLoaded = useCallback((village, polygonCount) => {
    setVillageEditLoading(false);
    setVillageEditPolygonCount(polygonCount);
  }, []);

  const handleVillageEditError = useCallback(
    (err) => {
      console.error("Village edit error:", err);
      setVillageEditLoading(false);
      toast.error("خطا در بارگذاری مرز روستا", "خطا");
    },
    [toast],
  );

  const handleSaveVillageGeometry = useCallback(async () => {
    if (!editVillageId) return;

    const api = drawingApiRef.current;
    if (!api?.getDrawnGeojson) {
      toast.error("API نقشه آماده نیست", "خطا");
      return;
    }

    const geojson = api.getDrawnGeojson();
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      toast.warning("لطفاً ابتدا مرز روستا را رسم کنید", "توجه");
      return;
    }

    setVillageEditSaving(true);
    try {
      await updateVillageMutation.mutateAsync({
        id: editVillageId,
        data: { geojson },
      });
      toast.success("مرز روستا ذخیره شد", "ذخیره شد");
      handleCancelVillageEdit();
    } catch (err) {
      const msg =
        err?.response?.data?.detail || err?.message || "خطا در ذخیره مرز";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg), "خطا");
    } finally {
      setVillageEditSaving(false);
    }
  }, [editVillageId, updateVillageMutation, toast]);

  const handleCancelVillageEdit = useCallback(() => {
    setEditVillageId(null);
    setVillageEditLoading(false);
    setVillageEditPolygonCount(0);

    const api = drawingApiRef.current;
    if (api?.clearPolygons) {
      api.clearPolygons();
    }

    navigate("/map", { replace: true });
  }, [navigate]);

  // ── Modal mode ──
  const isRegionEditMode = !!editRegionId;
  const isVillageEditMode = !!editVillageId;
  const isEditMode = isRegionEditMode || isVillageEditMode;

  // ═══════════════════════════════════════════════════════════
  // تعیین selectedLocation
  // ═══════════════════════════════════════════════════════════
  const effectiveSelectedLocation = useMemo(() => {
    if (focusFarmObject) return null;
    if (isEditMode) return null;
    return selectedLocation;
  }, [focusFarmObject, isEditMode, selectedLocation]);

  useEffect(() => {
    if (!effectiveSelectedLocation) return;

    const timer = setTimeout(
      () => {
        setSelectedLocation(null);
      },
      5 * 60 * 1000,
    );

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSelectedLocation]);

  // ═══════════════════════════════════════════════════════════
  // Snap toggle handler
  // ═══════════════════════════════════════════════════════════
  const handleToggleSnap = useCallback(() => {
    setSnapEnabled((prev) => !prev);
  }, [setSnapEnabled]);

  return (
    <MapErrorBoundary>
      <div className="relative w-full h-full">
        <MapComponent
          selectedLocation={effectiveSelectedLocation}
          onPolygonsUpdate={handlePolygonsUpdate}
          savedFarms={ownFarms}
          referenceFarms={referenceFarms}
          referenceStyle={referenceStyle}
          farmersById={farmersById}
          colorByCrop={colorByCrop}
          onFarmClick={handleFarmClick}
          onFarmEdit={handleFarmEdit}
          onFarmEditGeometry={handleFarmEditGeometry}
          onFarmDelete={handleFarmDelete}
          onFarmHistory={handleFarmHistory}
          onFarmTransfer={handleFarmTransfer}
          selectedFarmId={effectiveSelectedFarmId}
          // ✅ ویرایش هندسه مزرعه
          geometriesToEdit={geometriesToEdit}
          editGeometryTrigger={editGeometryTrigger}
          editGeometryOptions={editGeometryOptions}
          snapEnabled={snapEnabled}
          onToggleSnap={handleToggleSnap}
          snapToggleHidden={farmsLoading}
          showRegions={isSuperAdmin && showRegions && !isEditMode}
          selectedRegionId={selectedRegionId}
          onRegionClick={handleRegionClick}
          showVillages={showVillages && !isEditMode}
          selectedVillageId={selectedVillageId}
          onVillageClick={handleVillageClick}
          editRegionId={editRegionId}
          drawnItemsRef={drawnItemsRef}
          onRegionEditLoaded={handleRegionEditLoaded}
          onRegionEditError={handleRegionEditError}
          editVillageId={editVillageId}
          onVillageEditLoaded={handleVillageEditLoaded}
          onVillageEditError={handleVillageEditError}
          focusFarm={focusFarmObject}
          focusTrigger={focusTrigger}
          autoOpenPopupFarmId={autoOpenPopupFarmId}
          onDrawnItemsReady={handleDrawnItemsReady}
          onDrawingApiReady={handleDrawingApiReady}
        />

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
                  ویرایش مرز منطقه: {editingRegion?.name || "..."}
                </div>
                <div className="text-[10px] text-purple-600 mt-0.5">
                  {regionEditLoading
                    ? "در حال بارگذاری..."
                    : `${regionEditPolygonCount.toLocaleString(
                        "fa-IR",
                      )} قطعه رسم شده`}
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

        {isVillageEditMode && (
          <div
            className="
              absolute top-20 left-1/2 -translate-x-1/2 z-[1050]
              flex items-center gap-3
              px-4 py-2.5 rounded-2xl
              bg-emerald-50/95 backdrop-blur-xl
              border border-emerald-300/60
              shadow-[0_8px_32px_rgba(16,185,129,0.25)]
              font-vazir
            "
            dir="rtl"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <MapPin size={15} className="text-emerald-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  ویرایش مرز روستا: {editingVillage?.name || "..."}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">
                  {villageEditLoading
                    ? "در حال بارگذاری..."
                    : `${villageEditPolygonCount.toLocaleString(
                        "fa-IR",
                      )} قطعه رسم شده`}
                </div>
              </div>
            </div>

            <div className="w-px h-8 bg-emerald-300/60" />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCancelVillageEdit}
                disabled={villageEditSaving}
                className="
                  flex items-center gap-1.5
                  px-3 py-1.5 rounded-lg
                  bg-white text-emerald-700
                  border border-emerald-300
                  text-[11px] font-bold
                  hover:bg-emerald-50 transition-colors
                  disabled:opacity-50
                "
              >
                <X size={12} />
                لغو
              </button>

              <button
                type="button"
                onClick={handleSaveVillageGeometry}
                disabled={villageEditSaving || villageEditLoading}
                className="
                  flex items-center gap-1.5
                  px-3 py-1.5 rounded-lg
                  bg-emerald-600 text-white
                  text-[11px] font-bold
                  hover:bg-emerald-700 transition-colors
                  disabled:opacity-50
                "
              >
                {villageEditSaving ? (
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

        {!isEditMode && (
          <MapCalculator
            polygonCount={polygonsData.count || 0}
            areaHa={polygonsData.totalArea || 0}
            showWater={true}
          />
        )}

        {historyFarm && (
          <FarmHistoryModal
            farm={historyFarm}
            onClose={() => setHistoryFarm(null)}
          />
        )}
      </div>
    </MapErrorBoundary>
  );
};

export default MapViewPage;
