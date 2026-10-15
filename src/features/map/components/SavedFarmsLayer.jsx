// src/features/map/components/SavedFarmsLayer.jsx
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { createRoot } from "react-dom/client";
import FarmPopupContent from "./FarmPopupContent";
import { geometryToLeafletPolygons } from "../hooks/useMapDrawing";
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from "../../settings/constants/cropColors";
import {
  useLayerStyle,
  getDashArray,
} from "../../settings/hooks/useLayerStyle";
import { usePermissions } from "../../auth/hooks/usePermissions";

// ═══════════════════════════════════════════════════════════
// رنگ محصول
// ═══════════════════════════════════════════════════════════
const getFarmColor = (farm, colorByCrop) => {
  const direct = normalizeHex(farm?.crop_color);
  if (direct) return direct;

  const cropName = farm?.crop;
  if (cropName) {
    const fromMap = normalizeHex(colorByCrop?.[cropName]);
    if (fromMap) return fromMap;
  }

  return DEFAULT_FARM_COLOR;
};

const getOwnFarmStyle = (farm, isSelected, colorByCrop, layerStyle) => {
  const cropColor = getFarmColor(farm, colorByCrop);
  const s = layerStyle;

  if (isSelected) {
    return {
      color: s.selectedStrokeColor,
      weight: s.selectedStrokeWeight,
      opacity: 1,
      fillColor: cropColor,
      fillOpacity: s.selectedFillOpacity,
      dashArray: getDashArray(s.selectedStrokeStyle),
      className: "selected-polygon",
    };
  }

  const strokeColor = s.customStrokeColor ? s.strokeColor : cropColor;

  return {
    color: strokeColor,
    weight: s.strokeWeight,
    opacity: s.strokeOpacity,
    fillColor: cropColor,
    fillOpacity: s.fillOpacity,
    dashArray: getDashArray(s.strokeStyle),
    className: "",
  };
};

const getReferenceStyle = (referenceStyle) => {
  const s = referenceStyle || {};

  return {
    color: s.color || "#9E9E9E",
    weight: Number(s.stroke_weight ?? 2),
    opacity: 0.9,
    fillColor: s.color || "#9E9E9E",
    fillOpacity: Number(s.fill_opacity ?? 0.08),
    dashArray: getDashArray(s.stroke_style || "solid"),
    className: "reference-polygon",
    interactive: false,
  };
};

const getFeatures = (geojson) => {
  if (!geojson) return [];

  try {
    if (geojson.type === "FeatureCollection") {
      return geojson.features || [];
    }
    if (geojson.type === "Feature") {
      return [geojson];
    }
    if (
      geojson.type === "Polygon" ||
      geojson.type === "MultiPolygon"
    ) {
      return [
        { type: "Feature", properties: {}, geometry: geojson },
      ];
    }
    if (Array.isArray(geojson)) {
      return geojson;
    }
    return [];
  } catch (error) {
    console.error("Error getting features:", error);
    return [];
  }
};

const safeUnmount = (root) => {
  if (!root) return;
  try {
    queueMicrotask(() => {
      try {
        root.unmount();
      } catch {
        /* ignore */
      }
    });
  } catch {
    /* ignore */
  }
};

// ═══════════════════════════════════════════════════════════
// SavedFarmsLayer
// ═══════════════════════════════════════════════════════════
const SavedFarmsLayer = ({
  farms = [],
  referenceFarms = [],
  referenceStyle = null,
  farmersById = {},
  colorByCrop = {},
  onFarmClick,
  onFarmEdit,
  onFarmEditGeometry,
  onFarmDelete,
  onFarmHistory,
  onFarmTransfer,
  selectedFarmId = null,
}) => {
  const map = useMap();
  const { style: layerStyle } = useLayerStyle();
  const { isSuperAdmin } = usePermissions();

  const ownLayerGroupRef = useRef(null);
  const refLayerGroupRef = useRef(null);
  const ownPolygonsRef = useRef(new Map());
  const popupRootsRef = useRef([]);
  // ✅ نگه‌داشتن popup content در یک Map برای استفاده‌ی مجدد
  const popupContentByFarmRef = useRef(new Map());

  const handlersRef = useRef({
    onFarmClick,
    onFarmEdit,
    onFarmEditGeometry,
    onFarmDelete,
    onFarmHistory,
    onFarmTransfer,
  });
  const layerStyleRef = useRef(layerStyle);
  const farmersByIdRef = useRef(farmersById);
  const referenceStyleRef = useRef(referenceStyle);
  const isSuperAdminRef = useRef(isSuperAdmin);

  useEffect(() => {
    handlersRef.current = {
      onFarmClick,
      onFarmEdit,
      onFarmEditGeometry,
      onFarmDelete,
      onFarmHistory,
      onFarmTransfer,
    };
  }, [
    onFarmClick,
    onFarmEdit,
    onFarmEditGeometry,
    onFarmDelete,
    onFarmHistory,
    onFarmTransfer,
  ]);

  useEffect(() => {
    layerStyleRef.current = layerStyle;
  }, [layerStyle]);

  useEffect(() => {
    farmersByIdRef.current = farmersById;
  }, [farmersById]);

  useEffect(() => {
    referenceStyleRef.current = referenceStyle;
  }, [referenceStyle]);

  useEffect(() => {
    isSuperAdminRef.current = isSuperAdmin;
  }, [isSuperAdmin]);

  // ═════════════════════════════════════════════════════════
  // cleanup
  // ═════════════════════════════════════════════════════════
  const cleanupAll = useCallback(() => {
    try {
      map.closePopup();
    } catch {
      /* ignore */
    }

    popupRootsRef.current.forEach((root) => safeUnmount(root));
    popupRootsRef.current = [];
    popupContentByFarmRef.current.clear();

    ownPolygonsRef.current.forEach((entry) => {
      const polys = entry?.polygons || [];
      polys.forEach((polygon) => {
        try {
          polygon.off();
          polygon.unbindTooltip();
          polygon.unbindPopup();
          if (map.hasLayer(polygon)) {
            map.removeLayer(polygon);
          }
        } catch {
          /* ignore */
        }
      });
    });
    ownPolygonsRef.current.clear();

    if (ownLayerGroupRef.current) {
      try {
        ownLayerGroupRef.current.clearLayers();
        if (map.hasLayer(ownLayerGroupRef.current)) {
          map.removeLayer(ownLayerGroupRef.current);
        }
      } catch {
        /* ignore */
      }
      ownLayerGroupRef.current = null;
    }

    if (refLayerGroupRef.current) {
      try {
        refLayerGroupRef.current.clearLayers();
        if (map.hasLayer(refLayerGroupRef.current)) {
          map.removeLayer(refLayerGroupRef.current);
        }
      } catch {
        /* ignore */
      }
      refLayerGroupRef.current = null;
    }
  }, [map]);

  // ═════════════════════════════════════════════════════════
  // createPopupContent — یک‌بار برای هر مزرعه ساخته می‌شود
  // ═════════════════════════════════════════════════════════
  const createPopupContent = useCallback(
    (farm) => {
      const farmId = String(farm.farm_id);

      // ✅ اگر قبلاً ساخته شده، همان را برگردان
      const cached = popupContentByFarmRef.current.get(farmId);
      if (cached) return cached;

      const container = document.createElement("div");
      container.className = "farm-popup-container";

      const farmer = farm?.farmer_id
        ? farmersByIdRef.current[String(farm.farmer_id)] || null
        : null;

      const handleEdit = () => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (typeof handlersRef.current.onFarmEdit === "function") {
          handlersRef.current.onFarmEdit(farm);
        }
      };

      const handleEditGeometry = () => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (
          typeof handlersRef.current.onFarmEditGeometry === "function"
        ) {
          handlersRef.current.onFarmEditGeometry(farm);
        }
      };

      const handleDelete = async (farmToDelete) => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (typeof handlersRef.current.onFarmDelete === "function") {
          await handlersRef.current.onFarmDelete(farmToDelete);
        }
      };

      const handleClose = () => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
      };

      const handleHistory = (farmToShow) => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (typeof handlersRef.current.onFarmHistory === "function") {
          handlersRef.current.onFarmHistory(farmToShow);
        }
      };

      const handleTransfer = (farmToTransfer) => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (
          typeof handlersRef.current.onFarmTransfer === "function"
        ) {
          handlersRef.current.onFarmTransfer(farmToTransfer);
        }
      };

      const root = createRoot(container);
      root.render(
        <FarmPopupContent
          farm={farm}
          farmer={farmer}
          onEdit={handleEdit}
          onEditGeometry={handleEditGeometry}
          onDelete={handleDelete}
          onClose={handleClose}
          onHistory={handleHistory}
          onTransfer={handleTransfer}
          isSuperAdmin={isSuperAdminRef.current}
        />,
      );

      popupRootsRef.current.push(root);
      popupContentByFarmRef.current.set(farmId, container);
      return container;
    },
    [map],
  );

  // ═════════════════════════════════════════════════════════
  // Main Effect — با پیش‌ساخت popup content و autoPan off
  // ═════════════════════════════════════════════════════════
  useEffect(() => {
    if (!map) return;

    cleanupAll();

    const hasOwnFarms = Array.isArray(farms) && farms.length > 0;
    const hasRefFarms =
      Array.isArray(referenceFarms) && referenceFarms.length > 0;

    if (!hasOwnFarms && !hasRefFarms) {
      return;
    }

    // ─── ۱. مزارع خودی ───
    if (hasOwnFarms) {
      const ownGroup = L.layerGroup();
      ownLayerGroupRef.current = ownGroup;

      farms.forEach((farm) => {
        if (!farm || !farm.geojson || !farm.farm_id) return;
        if (farm.is_reference === true) return;

        const features = getFeatures(farm.geojson);
        if (!features || features.length === 0) return;

        const styleOptions = getOwnFarmStyle(
          farm,
          false,
          colorByCrop,
          layerStyleRef.current,
        );

        // ✅ پیش‌ساخت popup content — یک‌بار برای هر مزرعه
        const popupContent = createPopupContent(farm);

        const farmPolygons = [];

        for (const feature of features) {
          const geometry = feature.geometry || feature;
          if (!geometry) continue;

          const polys = geometryToLeafletPolygons(
            geometry,
            styleOptions,
          );

          for (const polygon of polys) {
            // ✅ popup را از قبل bind کن (بدون autoPan)
            polygon.bindPopup(popupContent, {
              className: "farm-popup",
              offset: L.point(0, -10),
              closeButton: false,
              minWidth: 260,
              maxWidth: 320,
              autoPan: false,        // ✅ pan خودکار خاموش
              keepInView: false,     // ✅ keepInView خاموش
              closeOnClick: true,
              autoClose: true,
            });

            polygon.on("click", (e) => {
              L.DomEvent.stopPropagation(e);

              if (
                typeof handlersRef.current.onFarmClick === "function"
              ) {
                handlersRef.current.onFarmClick(farm, e);
              }

              // ✅ openPopup را در RAF صدا بزن تا DOM آماده باشد
              requestAnimationFrame(() => {
                try {
                  polygon.openPopup();
                } catch (err) {
                  console.warn("Failed to open farm popup:", err);
                }
              });
            });

            ownGroup.addLayer(polygon);
            farmPolygons.push(polygon);
          }
        }

        if (farmPolygons.length > 0) {
          ownPolygonsRef.current.set(String(farm.farm_id), {
            polygons: farmPolygons,
            farm,
          });
        }
      });

      ownGroup.addTo(map);
    }

    // ─── ۲. مزارع مرجع ───
    if (hasRefFarms) {
      const refGroup = L.layerGroup();
      refLayerGroupRef.current = refGroup;

      const styleOpts = getReferenceStyle(referenceStyleRef.current);

      referenceFarms.forEach((farm) => {
        if (!farm || !farm.geojson || !farm.farm_id) return;

        const features = getFeatures(farm.geojson);
        if (!features || features.length === 0) return;

        for (const feature of features) {
          const geometry = feature.geometry || feature;
          if (!geometry) continue;

          const polys = geometryToLeafletPolygons(geometry, styleOpts);

          for (const polygon of polys) {
            polygon.options.interactive = false;
            refGroup.addLayer(polygon);
          }
        }
      });

      refGroup.addTo(map);

      try {
        refGroup.bringToBack();
      } catch {
        /* ignore */
      }
    }

    return () => {
      cleanupAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    map,
    farms,
    referenceFarms,
    colorByCrop,
    referenceStyle,
    cleanupAll,
    createPopupContent,
  ]);

  // ═════════════════════════════════════════════════════════
  // Style Effect
  // ═════════════════════════════════════════════════════════
  useEffect(() => {
    ownPolygonsRef.current.forEach((entry, farmId) => {
      const polys = entry?.polygons || [];
      const farm = entry?.farm;
      if (!farm) return;

      const isSelected = String(farmId) === String(selectedFarmId);
      const styleOptions = getOwnFarmStyle(
        farm,
        isSelected,
        colorByCrop,
        layerStyle,
      );

      polys.forEach((polygon) => {
        try {
          polygon.setStyle(styleOptions);
        } catch {
          /* ignore */
        }
      });
    });
  }, [layerStyle, selectedFarmId, farms, colorByCrop]);

  // ═════════════════════════════════════════════════════════
  // Deselect روی کلیک نقشه
  // ═════════════════════════════════════════════════════════
  useEffect(() => {
    if (!map) return;

    const handleMapClick = () => {
      if (typeof handlersRef.current.onFarmClick === "function") {
        handlersRef.current.onFarmClick(null);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map]);

  // ═════════════════════════════════════════════════════════
  // Cleanup روی unmount
  // ═════════════════════════════════════════════════════════
  useEffect(() => {
    return () => {
      popupRootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch {
          /* ignore */
        }
      });
      popupRootsRef.current = [];
      popupContentByFarmRef.current.clear();
    };
  }, []);

  return null;
};

export default SavedFarmsLayer;