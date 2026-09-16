// src/features/map/hooks/useMapDrawing.js
import { useState, useCallback, useRef, useEffect } from 'react';
import L from 'leaflet';
import { calculateAreaInHectares } from '../utils/areaCalculations';
import { snapLatLngArray } from '../utils/snapUtils';

// ============================================================
// ✅ تبدیل GeoJSON geometry به آرایه‌ای از L.Polygon
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
// ✅ تبدیل لیستی از Feature/Geometry به FeatureCollection
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
// ✅ استخراج رئوس از یک L.Polygon
// خروجی: آرایه‌ای از [lng, lat]
// ============================================================
const extractPolygonVertices = (polygonLayer) => {
  const vertices = [];
  if (!polygonLayer) return vertices;

  try {
    const latlngs = polygonLayer.getLatLngs();
    const processRing = (ring) => {
      if (!Array.isArray(ring)) return;
      for (const ll of ring) {
        if (!ll) continue;
        if (typeof ll.lat === 'number' && typeof ll.lng === 'number') {
          vertices.push([ll.lng, ll.lat]);
        } else {
          processRing(ll);
        }
      }
    };
    processRing(latlngs);
  } catch (err) {
    console.warn('extractPolygonVertices failed:', err);
  }

  return vertices;
};

// ============================================================
// useMapDrawing
// ============================================================
export const useMapDrawing = (
  onPolygonsUpdate,
  snapEnabled = false,
  snapVertices = [],
  snapPolygons = []
) => {
  const [polygons, setPolygons] = useState([]);
  const [drawnVertices, setDrawnVertices] = useState([]);
  const drawnItems = useRef(new L.FeatureGroup());
  const isProcessingRef = useRef(false);

  // ✅ refs برای جلوگیری از stale closure
  const snapEnabledRef = useRef(snapEnabled);
  const snapVerticesRef = useRef(snapVertices);
  const snapPolygonsRef = useRef(snapPolygons);

  useEffect(() => {
    snapEnabledRef.current = snapEnabled;
    snapVerticesRef.current = snapVertices;
    snapPolygonsRef.current = snapPolygons;
  }, [snapEnabled, snapVertices, snapPolygons]);

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
  //    و رئوس لایه‌های در حال رسم رو هم استخراج می‌کند.
  // ============================================================
  const updatePolygons = useCallback(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const layers = drawnItems.current.getLayers();
      const polygonLayers = layers.filter(
        (layer) => layer instanceof L.Polygon
      );

      // ✅ استخراج رئوس لایه‌های در حال رسم
      const allDrawnVertices = [];
      for (const layer of polygonLayers) {
        const verts = extractPolygonVertices(layer);
        for (const v of verts) allDrawnVertices.push(v);
      }
      setDrawnVertices(allDrawnVertices);

      if (polygonLayers.length === 0) {
        setPolygons([]);
        onPolygonsUpdate?.({ totalArea: 0, geojsons: [], count: 0 });
        return;
      }

      let totalArea = 0;
      const geojsons = [];

      for (const layer of polygonLayers) {
        const geojson = layer.toGeoJSON();
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
  // handleCreated
  // ============================================================
  const handleCreated = useCallback(
    (event) => {
      const layer = event.layer;

      if (layer instanceof L.Polygon) {
        if (snapEnabledRef.current) {
          try {
            // ✅ رئوس لایه‌های موجود در drawnItems
            const existingVertices = [];
            const existingLayers = drawnItems.current.getLayers();
            for (const existingLayer of existingLayers) {
              if (existingLayer instanceof L.Polygon) {
                const verts = extractPolygonVertices(existingLayer);
                for (const v of verts) existingVertices.push(v);
              }
            }

            // ✅ ترکیب رئوس مزارع ذخیره‌شده + رئوس لایه‌های در حال رسم
            const combinedVertices = [
              ...snapVerticesRef.current,
              ...existingVertices,
            ];

            if (combinedVertices.length > 0) {
              const latlngs = layer.getLatLngs();
              const isNested = Array.isArray(latlngs[0]);
              const rings = isNested ? latlngs : [latlngs];

              const snappedRings = rings.map((ring) =>
                snapLatLngArray(
                  ring,
                  combinedVertices,
                  snapPolygonsRef.current
                )
              );

              layer.setLatLngs(snappedRings);
            }
          } catch (err) {
            console.warn('Snap on created failed:', err);
          }
        }

        drawnItems.current.addLayer(layer);

        const geojson = layer.toGeoJSON();
        const area = calculateAreaInHectares(geojson);
        createAreaTooltip(layer, area);

        updatePolygons();
      }
    },
    [updatePolygons, createAreaTooltip]
  );

  // ============================================
  // handleDeleted
  // ============================================
  const handleDeleted = useCallback(() => {
    updatePolygons();
  }, [updatePolygons]);

  // ============================================
  // handleEdited
  // ============================================
  const handleEdited = useCallback(() => {
    updatePolygons();
  }, [updatePolygons]);

  // ============================================================
  // ✅ loadGeometriesForEdit
  // ============================================================
  const loadGeometriesForEdit = useCallback(
    (geojsons) => {
      try {
        drawnItems.current.clearLayers();
        isProcessingRef.current = false;

        if (!geojsons || geojsons.length === 0) {
          setPolygons([]);
          setDrawnVertices([]);
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
      setDrawnVertices([]);
      onPolygonsUpdate?.({ totalArea: 0, geojsons: [], count: 0 });
      isProcessingRef.current = false;
    } catch (error) {
      console.error('خطا در clearPolygons:', error);
    }
  }, [onPolygonsUpdate]);

  // ============================================
  // Helpers
  // ============================================
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
    drawnVertices,
    handleCreated,
    handleDeleted,
    handleEdited,
    clearPolygons,
    updatePolygons,
    hasPolygons,
    getPolygonCount,
    loadGeometriesForEdit,
    _snapRefs: {
      snapEnabledRef,
      snapVerticesRef,
      snapPolygonsRef,
    },
  };
};