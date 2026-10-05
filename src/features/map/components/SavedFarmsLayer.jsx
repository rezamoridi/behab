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
import { useAuth } from "../../../context/useAuth";
import { usePermissions } from "../../auth/hooks/usePermissions";

// ============================================================
// رنگ محصول
// ============================================================
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

// ============================================================
// ✅ استایل یکسان برای همه مزارع
// (چه خودی چه دیگران)
// ============================================================
const getFarmStyle = (farm, isSelected, colorByCrop, layerStyle) => {
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

// ============================================================
// getFeatures
// ============================================================
const getFeatures = (geojson) => {
  if (!geojson) return [];

  try {
    if (geojson.type === "FeatureCollection") {
      return geojson.features || [];
    }
    if (geojson.type === "Feature") {
      return [geojson];
    }
    if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
      return [{ type: "Feature", properties: {}, geometry: geojson }];
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

// ============================================================
// safeUnmount
// ============================================================
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

// ============================================================
// SavedFarmsLayer
// ============================================================
const SavedFarmsLayer = ({
  farms,
  farmersById = {},
  colorByCrop = {},
  onFarmClick,
  onFarmEdit,
  onFarmEditGeometry,
  onFarmDelete,
  selectedFarmId = null,
}) => {
  const map = useMap();
  const { style: layerStyle } = useLayerStyle();
  const { user } = useAuth();
  const { isSuperAdmin, isManager } = usePermissions();

  const layerGroupRef = useRef(null);
  // Map<farm_id, { polygons: L.Polygon[], isOwn: boolean, farm: Farm }>
  const polygonsByFarmRef = useRef(new Map());
  const popupRootsRef = useRef([]);
  const handlersRef = useRef({
    onFarmClick,
    onFarmEdit,
    onFarmEditGeometry,
    onFarmDelete,
  });
  const layerStyleRef = useRef(layerStyle);
  const farmersByIdRef = useRef(farmersById);
  const boundsFittedRef = useRef(false);
  const isMountedRef = useRef(true);

  // user / role refs
  const currentUserIdRef = useRef(user?.id ?? null);
  const userRoleRef = useRef(user?.role ?? null);
  const userRegionIdsRef = useRef(user?.region_ids ?? []);
  const isSuperAdminRef = useRef(isSuperAdmin);
  const isManagerRef = useRef(isManager);

  useEffect(() => {
    currentUserIdRef.current = user?.id ?? null;
    userRoleRef.current = user?.role ?? null;
    userRegionIdsRef.current = user?.region_ids ?? [];
    isSuperAdminRef.current = isSuperAdmin;
    isManagerRef.current = isManager;
  }, [user, isSuperAdmin, isManager]);

  useEffect(() => {
    handlersRef.current = {
      onFarmClick,
      onFarmEdit,
      onFarmEditGeometry,
      onFarmDelete,
    };
  }, [onFarmClick, onFarmEdit, onFarmEditGeometry, onFarmDelete]);

  useEffect(() => {
    layerStyleRef.current = layerStyle;
  }, [layerStyle]);

  useEffect(() => {
    farmersByIdRef.current = farmersById;
  }, [farmersById]);

  // ============================================================
  // تعیین مالکیت
  // ============================================================
  const isOwnFarm = useCallback((farm) => {
    const role = userRoleRef.current;
    const userId = currentUserIdRef.current;
    const userRegions = userRegionIdsRef.current;

    if (role === "super_admin") return true;

    if (role === "manager") {
      return (
        farm.region_id != null &&
        userRegions.includes(farm.region_id)
      );
    }

    if (role === "dehyar") {
      if (
        farm.region_id != null &&
        userRegions.includes(farm.region_id)
      ) {
        return true;
      }
      if (
        farm.region_id == null &&
        farm.created_by_user_id === userId
      ) {
        return true;
      }
      return false;
    }

    return false;
  }, []);

  // ============================================================
  // cleanup
  // ============================================================
  const cleanupAll = useCallback(() => {
    try {
      map.closePopup();
    } catch {
      /* ignore */
    }

    popupRootsRef.current.forEach((root) => {
      safeUnmount(root);
    });
    popupRootsRef.current = [];

    polygonsByFarmRef.current.forEach((entry) => {
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
    polygonsByFarmRef.current.clear();

    if (layerGroupRef.current) {
      try {
        layerGroupRef.current.clearLayers();
        if (map.hasLayer(layerGroupRef.current)) {
          map.removeLayer(layerGroupRef.current);
        }
      } catch {
        /* ignore */
      }
      layerGroupRef.current = null;
    }
  }, [map]);

  // ============================================================
  // createPopupContent — فقط برای مزرعه خودی
  // ============================================================
  const createPopupContent = useCallback(
    (farm) => {
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
        if (typeof handlersRef.current.onFarmEditGeometry === "function") {
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

      const root = createRoot(container);
      root.render(
        <FarmPopupContent
          farm={farm}
          farmer={farmer}
          onEdit={handleEdit}
          onEditGeometry={handleEditGeometry}
          onDelete={handleDelete}
          onClose={handleClose}
        />,
      );

      popupRootsRef.current.push(root);
      return container;
    },
    [map],
  );

  // ============================================================
  // Main Effect — ساخت لایه‌ها
  // ============================================================
  useEffect(() => {
    if (!map) return;

    cleanupAll();

    if (!farms || farms.length === 0) {
      return;
    }

    const layerGroup = L.layerGroup();
    layerGroupRef.current = layerGroup;

    farms.forEach((farm) => {
      if (!farm || !farm.geojson || !farm.farm_id) return;

      const features = getFeatures(farm.geojson);
      if (!features || features.length === 0) return;

      const isOwn = isOwnFarm(farm);

      // ✅ استایل یکسان برای همه
      const styleOptions = getFarmStyle(
        farm,
        false,
        colorByCrop,
        layerStyleRef.current,
      );

      const farmPolygons = [];

      for (const feature of features) {
        const geometry = feature.geometry || feature;
        if (!geometry) continue;

        const polys = geometryToLeafletPolygons(geometry, styleOptions);

        for (const polygon of polys) {
          if (isOwn) {
            // ✅ مزرعه خودی: کلیک + popup
            polygon.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              const { onFarmClick: cb } = handlersRef.current;
              if (typeof cb === "function") {
                cb(farm, e);
              }
            });

            const popupContent = createPopupContent(farm);
            polygon.bindPopup(popupContent, {
              className: "farm-popup",
              offset: L.point(0, -10),
              closeButton: false,
              minWidth: 260,
              maxWidth: 320,
              autoPan: true,
              autoPanPadding: L.point(20, 20),
              keepInView: true,
            });
          } else {
            // ✅ مزرعه دیگران: ظاهر یکسان، ولی بدون popup
            // هیچ اطلاعاتی لو نمی‌رود — فقط شکل دیده می‌شود
            polygon.on("click", (e) => {
              L.DomEvent.stopPropagation(e);
              // ✅ فقط deselect — بدون popup، بدون onFarmClick
              const { onFarmClick: cb } = handlersRef.current;
              if (typeof cb === "function") {
                cb(null);
              }
            });
          }

          layerGroup.addLayer(polygon);
          farmPolygons.push(polygon);
        }
      }

      if (farmPolygons.length > 0) {
        polygonsByFarmRef.current.set(String(farm.farm_id), {
          polygons: farmPolygons,
          isOwn,
          farm,
        });
      }
    });

    layerGroup.addTo(map);

    // ✅ fitBounds بر اساس همه مزارع (چون ظاهر یکسان است)
    if (!boundsFittedRef.current && polygonsByFarmRef.current.size > 0) {
      try {
        const bounds = L.latLngBounds();

        polygonsByFarmRef.current.forEach(({ polygons }) => {
          polygons.forEach((polygon) => {
            const latLngs = polygon.getLatLngs();
            const processCoords = (coords) => {
              if (Array.isArray(coords)) {
                if (
                  coords.length === 2 &&
                  typeof coords[0] === "number" &&
                  typeof coords[1] === "number"
                ) {
                  bounds.extend(coords);
                } else {
                  coords.forEach(processCoords);
                }
              }
            };
            processCoords(latLngs);
          });
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
          boundsFittedRef.current = true;
        }
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }

    return () => {
      cleanupAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, farms, colorByCrop, cleanupAll, createPopupContent]);

  // ============================================================
  // Style Effect — برای همه مزارع (انتخاب‌شده/غیرانتخاب‌شده)
  // ============================================================
  useEffect(() => {
    polygonsByFarmRef.current.forEach((entry, farmId) => {
      const polys = entry?.polygons || [];
      const farm = entry?.farm;

      if (!farm) return;

      const isSelected = String(farmId) === String(selectedFarmId);
      const styleOptions = getFarmStyle(
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

  // ============================================================
  // Deselect روی کلیک نقشه
  // ============================================================
  useEffect(() => {
    if (!map) return;

    const handleMapClick = () => {
      const { onFarmClick: cb } = handlersRef.current;
      if (typeof cb === "function") {
        cb(null);
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [map]);

  // ============================================================
  // Cleanup روی unmount
  // ============================================================
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      popupRootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch {
          /* ignore */
        }
      });
      popupRootsRef.current = [];
    };
  }, []);

  return null;
};

export default SavedFarmsLayer;