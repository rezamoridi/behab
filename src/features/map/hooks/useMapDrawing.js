// src/features/map/hooks/useMapDrawing.js
import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { calculateAreaInHectares } from '../utils/areaCalculations';

// ============================================================
// ✅ تابع کمکی مشترک: تبدیل GeoJSON geometry به آرایه‌ای از L.Polygon
//
// - Polygon → یک L.Polygon با حلقه‌ی بیرونی + حفره‌ها
// - MultiPolygon → یک L.Polygon برای هر جزء (با حفظ حفره‌های هر جزء)
//
// خروجی: آرایه‌ای از L.Polygon (ممکن است خالی باشد اگر هندسه نامعتبر باشد)
// ============================================================
export const geometryToLeafletPolygons = (geometry, styleOptions = {}) => {
  if (!geometry) return [];

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  const defaultStyle = {
    color: '#4CAF50',
    weight: 3,
    fillColor: '#4CAF50',
    fillOpacity: 0.25,
    ...styleOptions,
  };

  // ساخت یک L.Polygon از rings: rings[0] حلقه‌ی بیرونی، rings[1..] حفره‌ها
  // ورودی مختصات GeoJSON: [lng, lat]
  // خروجی Leaflet: [[lat, lng], ...]
  const buildPolygon = (rings) => {
    if (!rings || rings.length === 0) return null;

    const outer = rings[0].map((c) => [c[1], c[0]]);
    if (outer.length < 3) return null;

    const holes = rings
      .slice(1)
      .map((ring) => ring.map((c) => [c[1], c[0]]))
      .filter((ring) => ring.length >= 3);

    try {
      return L.polygon([outer, ...holes], defaultStyle);
    } catch (err) {
      console.warn('Invalid polygon rings:', err);
      return null;
    }
  };

  const polygons = [];

  if (type === 'Polygon') {
    const p = buildPolygon(coordinates);
    if (p) polygons.push(p);
  } else if (type === 'MultiPolygon') {
    for (const poly of coordinates) {
      const p = buildPolygon(poly);
      if (p) polygons.push(p);
    }
  }

  return polygons;
};

// ============================================================
// ✅ تابع کمکی: تبدیل لیستی از Feature/Geometry به FeatureCollection
// برای ذخیره در payload. حفره‌ها حفظ می‌شوند.
// ============================================================
export const geojsonsToFeatureCollection = (geojsons) => {
  const features = (geojsons || [])
    .map((g) => {
      if (!g) return null;
      if (g.type === 'Feature') return g;
      if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
        return { type: 'Feature', properties: {}, geometry: g };
      }
      return null;
    })
    .filter(Boolean);

  return { type: 'FeatureCollection', features };
};

// ============================================================
// useMapDrawing
// ============================================================
export const useMapDrawing = (onPolygonsUpdate) => {
  const [polygons, setPolygons] = useState([]);
  const drawnItems = useRef(new L.FeatureGroup());
  const isProcessingRef = useRef(false);

  // ============================================
  // Tooltip مساحت
  // ============================================
  const createAreaTooltip = useCallback((layer, area) => {
    if (layer._tooltip) {
      layer.unbindTooltip();
    }

    const formattedArea = area.toLocaleString('fa-IR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

    layer.bindTooltip(`📐 ${formattedArea} هکتار`, {
      permanent: true,
      direction: 'center',
      className: 'polygon-area-tooltip',
      offset: L.point(0, 0),
      opacity: 0.9,
    });
  }, []);

  // ============================================================
  // ✅ updatePolygons — همیشه از همه‌ی polygonهای drawnItems می‌سازد
  //
  // این تابع دیگر به e.layers وابسته نیست. برای هر یک از رویدادهای
  // CREATED/EDITED/DELETED صدا زده می‌شود و کل drawnItems را
  // می‌خواند. این تضمین می‌کند که قطعات دست‌نخورده هم حفظ شوند.
  // ============================================================
  const updatePolygons = useCallback(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const layers = drawnItems.current.getLayers();
      const polygonLayers = layers.filter(
        (layer) => layer instanceof L.Polygon
      );

      if (polygonLayers.length === 0) {
        setPolygons([]);
        onPolygonsUpdate?.({ totalArea: 0, geojsons: [], count: 0 });
        return;
      }

      let totalArea = 0;
      const geojsons = [];

      for (const layer of polygonLayers) {
        const geojson = layer.toGeoJSON(); // Feature با Polygon/MultiPolygon
        const area = calculateAreaInHectares(geojson);
        totalArea += area;

        layer.setStyle({
          weight: 3,
          color: '#4CAF50',
          fillColor: '#4CAF50',
          fillOpacity: 0.25,
        });

        createAreaTooltip(layer, area);

        geojson.properties = {
          ...geojson.properties,
          areaHa: area,
          polygonId: layer._leaflet_id || Date.now() + Math.random(),
        };

        geojsons.push(geojson);
      }

      const result = {
        totalArea: Number(totalArea.toFixed(4)),
        geojsons,
        count: polygonLayers.length,
      };

      setPolygons(result);
      onPolygonsUpdate?.(result);
    } catch (error) {
      console.error('خطا در updatePolygons:', error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [onPolygonsUpdate, createAreaTooltip]);

  // ============================================
  // Handlers
  // ============================================
  const handleCreated = useCallback(
    (event) => {
      const layer = event.layer;

      if (layer instanceof L.Polygon) {
        drawnItems.current.addLayer(layer);

        const geojson = layer.toGeoJSON();
        const area = calculateAreaInHectares(geojson);
        createAreaTooltip(layer, area);

        // بدون setTimeout — مستقیم update کن
        updatePolygons();
      }
    },
    [updatePolygons, createAreaTooltip]
  );

  const handleDeleted = useCallback(() => {
    // بعد از حذف، از همه‌ی polygonهای باقی‌مانده geojson بساز
    updatePolygons();
  }, [updatePolygons]);

  const handleEdited = useCallback(() => {
    // بعد از ویرایش، از همه‌ی polygonهای drawnItems (نه فقط edited)
    updatePolygons();
  }, [updatePolygons]);

  // ============================================================
  // ✅ loadGeometriesForEdit — MultiPolygon → چند polygon مستقل
  //
  // این تابع برای ویرایش با leaflet-draw طراحی شده:
  // - هر Polygon در geojson ورودی → یک L.Polygon
  // - هر MultiPolygon → چند L.Polygon (یکی برای هر جزء)
  // - حفره‌های هر Polygon حفظ می‌شوند
  // ============================================================
  const loadGeometriesForEdit = useCallback(
    (geojsons) => {
      try {
        drawnItems.current.clearLayers();
        isProcessingRef.current = false;

        if (!geojsons || geojsons.length === 0) {
          setPolygons([]);
          onPolygonsUpdate?.({ totalArea: 0, geojsons: [], count: 0 });
          return;
        }

        for (const geojson of geojsons) {
          let geometry = geojson;
          if (geojson.type === 'Feature') {
            geometry = geojson.geometry;
          }

          if (!geometry) continue;

          const layers = geometryToLeafletPolygons(geometry, {
            color: '#FF9800',
            weight: 3,
            fillColor: '#FF9800',
            fillOpacity: 0.3,
          });

          for (const layer of layers) {
            drawnItems.current.addLayer(layer);
            const area = calculateAreaInHectares(layer.toGeoJSON());
            createAreaTooltip(layer, area);
          }
        }

        updatePolygons();
      } catch (error) {
        console.error('خطا در loadGeometriesForEdit:', error);
      }
    },
    [createAreaTooltip, updatePolygons, onPolygonsUpdate]
  );

  // ============================================
  // پاک‌سازی
  // ============================================
  const clearPolygons = useCallback(() => {
    try {
      drawnItems.current.clearLayers();
      setPolygons([]);
      onPolygonsUpdate?.({ totalArea: 0, geojsons: [], count: 0 });
      isProcessingRef.current = false;
    } catch (error) {
      console.error('خطا در clearPolygons:', error);
    }
  }, [onPolygonsUpdate]);

  const hasPolygons = useCallback(() => {
    return drawnItems.current
      .getLayers()
      .some((layer) => layer instanceof L.Polygon);
  }, []);

  const getPolygonCount = useCallback(() => {
    return drawnItems.current
      .getLayers()
      .filter((layer) => layer instanceof L.Polygon).length;
  }, []);

  return {
    drawnItems,
    polygons,
    handleCreated,
    handleDeleted,
    handleEdited,
    clearPolygons,
    updatePolygons,
    hasPolygons,
    getPolygonCount,
    loadGeometriesForEdit,
  };
};