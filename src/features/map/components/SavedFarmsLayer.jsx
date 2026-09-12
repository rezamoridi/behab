// src/features/map/components/SavedFarmsLayer.jsx
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { calculateAreaInHectares } from '../utils/areaCalculations';
import FarmPopupContent from './FarmPopupContent';
import { geometryToLeafletPolygons } from '../hooks/useMapDrawing';

// ============================================================
// استایل‌ها
// ============================================================
const SELECTED_STYLE = {
  color: '#FF6B35',
  weight: 4,
  opacity: 1,
  fillColor: '#FF6B35',
  fillOpacity: 0.35,
  className: 'selected-polygon',
};

const NORMAL_STYLE = {
  color: '#2196F3',
  weight: 2,
  opacity: 0.7,
  fillColor: '#2196F3',
  fillOpacity: 0.15,
  className: '',
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
// ✅ تابع کمکی: unmount کردن ایمن یک root
//
// اگر React در حال render باشد، unmount همگام خطا می‌دهد.
// این تابع unmount را به microtask بعدی موکول می‌کند.
// ============================================================
const safeUnmount = (root) => {
  if (!root) return;
  try {
    // ✅ queueMicrotask اجرای callback را بعد از render فعلی React
    // به تأخیر می‌اندازد، بدون استفاده از setTimeout.
    queueMicrotask(() => {
      try {
        root.unmount();
      } catch (err) {
        // ممکن است root قبلاً unmount شده باشد — بی‌خطر است
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
  onFarmClick,
  onFarmEdit,
  onFarmEditGeometry,
  selectedFarmId = null,
}) => {
  const map = useMap();

  const layerGroupRef = useRef(null);
  const polygonsByFarmRef = useRef(new Map());
  const popupRootsRef = useRef([]);
  const handlersRef = useRef({
    onFarmClick,
    onFarmEdit,
    onFarmEditGeometry,
  });
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
    };
  }, [onFarmClick, onFarmEdit, onFarmEditGeometry]);

  // ============================================================
  // Cleanup همه‌ی لایه‌ها و rootها (با unmount ایمن)
  // ============================================================
  const cleanupAll = () => {
    try {
      map.closePopup();
    } catch {
      /* ignore */
    }

    // ✅ unmount هر root به microtask بعدی موکول می‌شود
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
  };

  // ============================================================
  // ایجاد محتوای popup
  // ============================================================
  const createPopupContent = (farm) => {
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
        onClose={handleClose}
      />
    );

    popupRootsRef.current.push(root);
    return container;
  };

  // ============================================================
  // Main Effect
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

      const isSelected = String(farm.farm_id) === String(selectedFarmId);
      const styleOptions = isSelected ? SELECTED_STYLE : NORMAL_STYLE;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, farms]);

  // ============================================================
  // به‌روزرسانی style
  // ============================================================
  useEffect(() => {
    polygonsByFarmRef.current.forEach((polygons, farmId) => {
      const isSelected = String(farmId) === String(selectedFarmId);
      const styleOptions = isSelected ? SELECTED_STYLE : NORMAL_STYLE;
      polygons.forEach((polygon) => {
        try {
          polygon.setStyle(styleOptions);
        } catch {
          /* ignore */
        }
      });
    });
  }, [selectedFarmId]);

  // ============================================================
  // Deselect
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
      // در unmount کامل، unmount همگام امن است چون دیگر rendering نخواهد بود
      popupRootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch {
          /* ignore */
        }
      });
      popupRootsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default SavedFarmsLayer;