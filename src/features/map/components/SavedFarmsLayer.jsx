// src/features/map/components/SavedFarmsLayer.jsx
import { useCallback, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import FarmPopupContent from './FarmPopupContent';
import { geometryToLeafletPolygons } from '../hooks/useMapDrawing';
import {
  DEFAULT_FARM_COLOR,
  normalizeHex,
} from '../../settings/constants/cropColors';
import { useLayerStyle, getDashArray } from '../../settings/hooks/useLayerStyle';

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
// ✅ استایل — Fill همیشه از محصول، Stroke از تنظیمات
// ============================================================
const getFarmStyle = (farm, isSelected, colorByCrop, layerStyle) => {
  const cropColor = getFarmColor(farm, colorByCrop);
  const s = layerStyle;

  // ─── حالت انتخاب‌شده ───
  if (isSelected) {
    return {
      color: s.selectedStrokeColor,
      weight: s.selectedStrokeWeight,
      opacity: 1,
      fillColor: cropColor,
      fillOpacity: s.selectedFillOpacity,
      dashArray: getDashArray(s.selectedStrokeStyle),
      className: 'selected-polygon',
    };
  }

  // ─── حالت عادی ───
  // ✅ Stroke: اگه customStrokeColor فعال باشه، از رنگ دلخواه
  //           وگرنه از رنگ محصول
  const strokeColor = s.customStrokeColor ? s.strokeColor : cropColor;

  return {
    color: strokeColor,
    weight: s.strokeWeight,
    opacity: s.strokeOpacity,
    fillColor: cropColor,            // ← همیشه رنگ محصول
    fillOpacity: s.fillOpacity,
    dashArray: getDashArray(s.strokeStyle),
    className: '',
  };
};

// ============================================================
// getFeatures
// ============================================================
const getFeatures = (geojson) => {
  if (!geojson) return [];

  try {
    if (geojson.type === 'FeatureCollection') {
      return geojson.features || [];
    }
    if (geojson.type === 'Feature') {
      return [geojson];
    }
    if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
      return [{ type: 'Feature', properties: {}, geometry: geojson }];
    }
    if (Array.isArray(geojson)) {
      return geojson;
    }
    return [];
  } catch (error) {
    console.error('Error getting features:', error);
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
  colorByCrop = {},
  onFarmClick,
  onFarmEdit,
  onFarmEditGeometry,
  onFarmDelete,
  selectedFarmId = null,
}) => {
  const map = useMap();
  const { style: layerStyle } = useLayerStyle();

  const layerGroupRef = useRef(null);
  const polygonsByFarmRef = useRef(new Map());
  const popupRootsRef = useRef([]);
  const handlersRef = useRef({
    onFarmClick,
    onFarmEdit,
    onFarmEditGeometry,
    onFarmDelete,
  });
  const layerStyleRef = useRef(layerStyle);
  const boundsFittedRef = useRef(false);
  const isMountedRef = useRef(true);

  // ============================================================
  // همگام‌سازی handlerها
  // ============================================================
  useEffect(() => {
    handlersRef.current = {
      onFarmClick,
      onFarmEdit,
      onFarmEditGeometry,
      onFarmDelete,
    };
  }, [onFarmClick, onFarmEdit, onFarmEditGeometry, onFarmDelete]);

  // ============================================================
  // همگام‌سازی layerStyle با ref
  // ============================================================
  useEffect(() => {
    layerStyleRef.current = layerStyle;
  }, [layerStyle]);

  // ============================================================
  // cleanupAll
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

    polygonsByFarmRef.current.forEach((polygons) => {
      polygons.forEach((polygon) => {
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
  // createPopupContent
  // ============================================================
  const createPopupContent = useCallback(
    (farm) => {
      const container = document.createElement('div');
      container.className = 'farm-popup-container';

      const handleEdit = () => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (typeof handlersRef.current.onFarmEdit === 'function') {
          handlersRef.current.onFarmEdit(farm);
        }
      };

      const handleEditGeometry = () => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (typeof handlersRef.current.onFarmEditGeometry === 'function') {
          handlersRef.current.onFarmEditGeometry(farm);
        }
      };

      const handleDelete = async (farmToDelete) => {
        try {
          map.closePopup();
        } catch {
          /* ignore */
        }
        if (typeof handlersRef.current.onFarmDelete === 'function') {
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
          onEdit={handleEdit}
          onEditGeometry={handleEditGeometry}
          onDelete={handleDelete}
          onClose={handleClose}
        />
      );

      popupRootsRef.current.push(root);
      return container;
    },
    [map]
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

      // در ساخت اولیه همیشه غیرانتخاب
      const styleOptions = getFarmStyle(
        farm,
        false,
        colorByCrop,
        layerStyleRef.current
      );

      const farmPolygons = [];

      for (const feature of features) {
        const geometry = feature.geometry || feature;
        if (!geometry) continue;

        const polys = geometryToLeafletPolygons(geometry, styleOptions);

        for (const polygon of polys) {
          polygon.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            const { onFarmClick: cb } = handlersRef.current;
            if (typeof cb === 'function') {
              cb(farm, e);
            }
          });

          const popupContent = createPopupContent(farm);
          polygon.bindPopup(popupContent, {
            className: 'farm-popup',
            offset: L.point(0, -10),
            closeButton: false,
            minWidth: 260,
            maxWidth: 320,
            autoPan: true,
            autoPanPadding: L.point(20, 20),
            keepInView: true,
          });

          layerGroup.addLayer(polygon);
          farmPolygons.push(polygon);
        }
      }

      if (farmPolygons.length > 0) {
        polygonsByFarmRef.current.set(String(farm.farm_id), farmPolygons);
      }
    });

    layerGroup.addTo(map);

    if (!boundsFittedRef.current && polygonsByFarmRef.current.size > 0) {
      try {
        const bounds = L.latLngBounds();

        polygonsByFarmRef.current.forEach((polygons) => {
          polygons.forEach((polygon) => {
            const latLngs = polygon.getLatLngs();
            const processCoords = (coords) => {
              if (Array.isArray(coords)) {
                if (
                  coords.length === 2 &&
                  typeof coords[0] === 'number' &&
                  typeof coords[1] === 'number'
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
        console.error('Error fitting bounds:', error);
      }
    }

    return () => {
      cleanupAll();
    };
  }, [map, farms, colorByCrop, cleanupAll, createPopupContent]);

  // ============================================================
  // Style Effect — واکنش به تغییر تنظیمات و انتخاب
  // ============================================================
  useEffect(() => {
    polygonsByFarmRef.current.forEach((polygons, farmId) => {
      const farm = farms.find(
        (f) => String(f.farm_id) === String(farmId)
      );
      if (!farm) return;

      const isSelected = String(farmId) === String(selectedFarmId);
      const styleOptions = getFarmStyle(
        farm,
        isSelected,
        colorByCrop,
        layerStyle
      );

      polygons.forEach((polygon) => {
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
      if (typeof cb === 'function') {
        cb(null);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
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