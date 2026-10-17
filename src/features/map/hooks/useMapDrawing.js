// src/features/map/hooks/useMapDrawing.js
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { calculateAreaInHectares } from "../utils/areaCalculations";
import {
  SnapIndex,
  snapLatLngArray,
  tolerancePxToMeters,
  validateNoOverlap,
  DEFAULT_SNAP_TOLERANCE_PX,
} from "../utils/snapUtils";

// ═══════════════════════════════════════════════════════════
// Geometry → Leaflet Polygon
// ═══════════════════════════════════════════════════════════
export const geometryToLeafletPolygons = (geometry, styleOptions = {}) => {
  if (!geometry) return [];
  const type = geometry.type;
  const coordinates = geometry.coordinates;

  const defaultStyle = {
    color: "#4CAF50", weight: 3, fillColor: "#4CAF50", fillOpacity: 0.25,
    ...styleOptions,
  };

  const buildPolygon = (rings) => {
    if (!rings || rings.length === 0) return null;
    const outer = rings[0].map((c) => [c[1], c[0]]);
    if (outer.length < 3) return null;
    const holes = rings.slice(1)
      .map((ring) => ring.map((c) => [c[1], c[0]]))
      .filter((ring) => ring.length >= 3);
    try {
      return L.polygon([outer, ...holes], defaultStyle);
    } catch (err) {
      console.warn("Invalid polygon rings:", err);
      return null;
    }
  };

  const polygons = [];
  if (type === "Polygon") {
    const p = buildPolygon(coordinates);
    if (p) polygons.push(p);
  } else if (type === "MultiPolygon") {
    for (const poly of coordinates) {
      const p = buildPolygon(poly);
      if (p) polygons.push(p);
    }
  }
  return polygons;
};

export const geojsonsToFeatureCollection = (geojsons) => {
  const features = (geojsons || [])
    .map((g) => {
      if (!g) return null;
      if (g.type === "Feature") return g;
      if (g.type === "Polygon" || g.type === "MultiPolygon") {
        return { type: "Feature", properties: {}, geometry: g };
      }
      return null;
    })
    .filter(Boolean);
  return { type: "FeatureCollection", features };
};

const extractPolygonVertices = (polygonLayer) => {
  const vertices = [];
  if (!polygonLayer) return vertices;
  try {
    const latlngs = polygonLayer.getLatLngs();
    const processRing = (ring) => {
      if (!Array.isArray(ring)) return;
      for (const ll of ring) {
        if (!ll) continue;
        if (typeof ll.lat === "number" && typeof ll.lng === "number") {
          vertices.push([ll.lng, ll.lat]);
        } else {
          processRing(ll);
        }
      }
    };
    processRing(latlngs);
  } catch (err) {
    console.warn("extractPolygonVertices failed:", err);
  }
  return vertices;
};

const layerToFeature = (layer) => {
  try {
    const gj = layer.toGeoJSON();
    return {
      type: "Feature",
      properties: gj.properties || {},
      geometry: gj.geometry,
    };
  } catch {
    return null;
  }
};

// ═══════════════════════════════════════════════════════════
// helper: validate lat/lng array (خروجی snapLatLngArray)
// ═══════════════════════════════════════════════════════════
const isValidLatLngArray = (arr) => {
  if (!Array.isArray(arr)) return false;
  if (arr.length < 3) return false;

  for (const p of arr) {
    if (!Array.isArray(p) || p.length < 2) return false;
    const lat = Number(p[0]);
    const lng = Number(p[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
    if (lat === 0 && lng === 0) return false;
  }
  return true;
};

// ============================================================
// useMapDrawing
// ============================================================
export const useMapDrawing = (
  onPolygonsUpdate,
  snapEnabled = false,
  savedFarms = [],
) => {
  const map = useMap();

  const [polygons, setPolygons] = useState([]);
  const [drawnVertices, setDrawnVertices] = useState([]);
  const drawnItems = useRef(new L.FeatureGroup());
  const isProcessingRef = useRef(false);

  // ═══════════════════════════════════════════════════════════
  // SnapIndex — مزارع ذخیره‌شده
  // ═══════════════════════════════════════════════════════════
  const savedIndex = useMemo(() => {
    const idx = new SnapIndex();
    if (snapEnabled && Array.isArray(savedFarms) && savedFarms.length > 0) {
      idx.build(savedFarms);
    }
    return idx;
  }, [snapEnabled, savedFarms]);

  const savedIndexRef = useRef(savedIndex);
  useEffect(() => {
    savedIndexRef.current = savedIndex;
  }, [savedIndex]);

  // ═══════════════════════════════════════════════════════════
  // SnapIndex — لایه‌های در حال رسم
  // ═══════════════════════════════════════════════════════════
  const drawnIndexRef = useRef(new SnapIndex());

  const rebuildDrawnIndex = useCallback(() => {
    const idx = new SnapIndex();
    try {
      const layers = drawnItems.current.getLayers();
      for (const layer of layers) {
        if (!(layer instanceof L.Polygon)) continue;
        const feature = layerToFeature(layer);
        if (feature) idx.addFeature(feature);
      }
    } catch (err) {
      console.warn("rebuildDrawnIndex failed:", err);
    }
    drawnIndexRef.current = idx;
  }, []);

  const snapEnabledRef = useRef(snapEnabled);
  useEffect(() => {
    snapEnabledRef.current = snapEnabled;
  }, [snapEnabled]);

  const getToleranceMeters = useCallback(() => {
    return tolerancePxToMeters(map, DEFAULT_SNAP_TOLERANCE_PX);
  }, [map]);

  const createAreaTooltip = useCallback((layer, area) => {
    if (layer._tooltip) layer.unbindTooltip();
    const formattedArea = area.toLocaleString("fa-IR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
    layer.bindTooltip(`📐 ${formattedArea} هکتار`, {
      permanent: true,
      direction: "center",
      className: "polygon-area-tooltip",
      offset: L.point(0, 0),
      opacity: 0.9,
    });
  }, []);

  // ═══════════════════════════════════════════════════════════
  // helper: پاک‌سازی یک layer (با tooltip)
  // ═══════════════════════════════════════════════════════════
  const removeLayerSafely = useCallback((layer) => {
    if (!layer) return;
    try {
      if (layer.getTooltip && layer.getTooltip()) {
        layer.unbindTooltip();
      }
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    } catch (err) {
      console.warn("removeLayerSafely failed:", err);
    }
  }, [map]);

  // ═══════════════════════════════════════════════════════════
  // helper: پاک‌سازی قطعی همه layers
  // ═══════════════════════════════════════════════════════════
  const clearPolygonsInternal = useCallback(() => {
    try {
      const layers = drawnItems.current.getLayers();
      layers.forEach((layer) => removeLayerSafely(layer));
      drawnItems.current.clearLayers();
    } catch (err) {
      console.error("clearPolygonsInternal failed:", err);
    }
  }, [removeLayerSafely]);

  // ═══════════════════════════════════════════════════════════
  // updatePolygons
  // ═══════════════════════════════════════════════════════════
  const updatePolygons = useCallback(() => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const layers = drawnItems.current.getLayers();
      const polygonLayers = layers.filter((l) => l instanceof L.Polygon);

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
      const invalidLayers = [];

      for (const layer of polygonLayers) {
        let geojson;
        try {
          geojson = layer.toGeoJSON();
        } catch (err) {
          console.warn("toGeoJSON failed for layer:", err);
          invalidLayers.push(layer);
          continue;
        }

        const areaHa = calculateAreaInHectares(geojson);
        if (!Number.isFinite(areaHa) || areaHa <= 0) {
          console.warn("Invalid area for layer:", areaHa);
          invalidLayers.push(layer);
          continue;
        }

        totalArea += areaHa;

        layer.setStyle({
          weight: 3,
          color: "#4CAF50",
          fillColor: "#4CAF50",
          fillOpacity: 0.25,
        });
        createAreaTooltip(layer, areaHa);

        geojson.properties = {
          ...geojson.properties,
          areaHa,
          polygonId: layer._leaflet_id || Date.now() + Math.random(),
        };
        geojsons.push(geojson);
      }

      // ✅ حذف layerهای معیوب
      if (invalidLayers.length > 0) {
        invalidLayers.forEach((layer) => {
          try {
            drawnItems.current.removeLayer(layer);
            removeLayerSafely(layer);
          } catch (err) {
            console.warn("failed to remove invalid layer:", err);
          }
        });
      }

      const result = {
        totalArea: Number(totalArea.toFixed(4)),
        geojsons,
        count: geojsons.length,
      };

      setPolygons(result);
      onPolygonsUpdate?.(result);
      rebuildDrawnIndex();
    } catch (error) {
      console.error("خطا در updatePolygons:", error);
    } finally {
      isProcessingRef.current = false;
    }
  }, [
    onPolygonsUpdate,
    createAreaTooltip,
    rebuildDrawnIndex,
    removeLayerSafely,
  ]);

  // ═══════════════════════════════════════════════════════════
  // handleCreated — Snap فقط با savedIndex
  // ═══════════════════════════════════════════════════════════
  const handleCreated = useCallback(
    (event) => {
      const layer = event.layer;
      if (!(layer instanceof L.Polygon)) return;

      // ─── ۱. Snap ───
      if (snapEnabledRef.current) {
        try {
          const tolerance = getToleranceMeters();
          const sIdx = savedIndexRef.current;

          if (sIdx?.hasAny()) {
            const latlngs = layer.getLatLngs();
            const isNested = Array.isArray(latlngs[0]);
            const rings = isNested ? latlngs : [latlngs];

            const snappedRings = rings.map((ring) =>
              snapLatLngArray(ring, sIdx, tolerance),
            );

            if (isNested) {
              const allRingsValid = snappedRings.every(
                (ring, idx) => {
                  if (idx === 0) return isValidLatLngArray(ring);
                  return (
                    Array.isArray(ring) &&
                    ring.every(
                      (p) =>
                        Array.isArray(p) &&
                        p.length >= 2 &&
                        Number.isFinite(Number(p[0])) &&
                        Number.isFinite(Number(p[1])),
                    )
                  );
                },
              );

              if (allRingsValid) {
                layer.setLatLngs(snappedRings);
              }
            } else {
              const flatRing = snappedRings[0];
              if (isValidLatLngArray(flatRing)) {
                layer.setLatLngs(flatRing);
              }
            }
          }
        } catch (err) {
          console.warn("Snap on created failed:", err);
        }
      }

      // ─── ۲. اعتبارسنجی همپوشانی ───
      // ✅ فقط overlap واقعی را reject کن (نه unverifiable)
      if (
        snapEnabledRef.current &&
        savedIndexRef.current?.polygons?.length > 0
      ) {
        try {
          const geojson = layer.toGeoJSON();
          const validation = validateNoOverlap(
            geojson,
            savedIndexRef.current,
          );

          if (!validation.valid && validation.reason === "overlap") {
            const farmLabel =
              validation.conflictingFarm?.farm_id ||
              validation.conflictingFarm?.farmer_name ||
              "ثبت‌شده";
            const msg = `این مزرعه با مزرعه‌ی «${farmLabel}» به مقدار ${validation.overlapArea.toFixed(1)} متر مربع همپوشانی دارد.`;

            window.dispatchEvent(
              new CustomEvent("map:overlap-detected", {
                detail: {
                  message: msg,
                  conflictingFarm: validation.conflictingFarm,
                  overlapArea: validation.overlapArea,
                },
              }),
            );

            try {
              drawnItems.current.removeLayer(layer);
            } catch {
              /* ignore */
            }
            removeLayerSafely(layer);
            return;
          }
          // reason دیگری (unverifiable) → نادیده بگیر و ادامه بده
        } catch (err) {
          console.warn("Overlap validation failed:", err);
        }
      }

      // ─── ۳. افزودن به drawnItems ───
      drawnItems.current.addLayer(layer);

      const geojson = layer.toGeoJSON();
      const areaHa = calculateAreaInHectares(geojson);
      createAreaTooltip(layer, areaHa);

      updatePolygons();
    },
    [
      updatePolygons,
      createAreaTooltip,
      getToleranceMeters,
      removeLayerSafely,
    ],
  );

  const handleDeleted = useCallback(() => {
    updatePolygons();
  }, [updatePolygons]);

  const handleEdited = useCallback(() => {
    updatePolygons();
  }, [updatePolygons]);

  // ═══════════════════════════════════════════════════════════
  // loadGeometriesForEdit
  // ═══════════════════════════════════════════════════════════
  const loadGeometriesForEdit = useCallback(
    (geojsons, options = {}) => {
      const { color = "#FF9800", fillOpacity = 0.3, weight = 3 } =
        options || {};
      try {
        clearPolygonsInternal();

        if (!geojsons || geojsons.length === 0) {
          setPolygons([]);
          setDrawnVertices([]);
          onPolygonsUpdate?.({ totalArea: 0, geojsons: [], count: 0 });
          return;
        }

        for (const geojson of geojsons) {
          let geometry = geojson;
          if (geojson.type === "Feature") geometry = geojson.geometry;
          if (!geometry) continue;

          const layers = geometryToLeafletPolygons(geometry, {
            color,
            weight,
            fillColor: color,
            fillOpacity,
          });

          for (const layer of layers) {
            drawnItems.current.addLayer(layer);
            const areaHa = calculateAreaInHectares(layer.toGeoJSON());
            createAreaTooltip(layer, areaHa);
          }
        }
        updatePolygons();
      } catch (error) {
        console.error("خطا در loadGeometriesForEdit:", error);
      }
    },
    [
      createAreaTooltip,
      updatePolygons,
      onPolygonsUpdate,
      clearPolygonsInternal,
    ],
  );

  // ═══════════════════════════════════════════════════════════
  // clearPolygons
  // ═══════════════════════════════════════════════════════════
  const clearPolygons = useCallback(() => {
    clearPolygonsInternal();

    setPolygons([]);
    setDrawnVertices([]);
    onPolygonsUpdate?.({ totalArea: 0, geojsons: [], count: 0 });
    isProcessingRef.current = false;
    drawnIndexRef.current = new SnapIndex();
  }, [clearPolygonsInternal, onPolygonsUpdate]);

  const hasPolygons = useCallback(() => {
    return drawnItems.current.getLayers().some((l) => l instanceof L.Polygon);
  }, []);

  const getPolygonCount = useCallback(() => {
    return drawnItems.current
      .getLayers()
      .filter((l) => l instanceof L.Polygon).length;
  }, []);

  const getDrawnGeojson = useCallback(() => {
    try {
      const layers = drawnItems.current.getLayers();
      const polygonLayers = layers.filter((l) => l instanceof L.Polygon);
      if (polygonLayers.length === 0) return null;

      return {
        type: "FeatureCollection",
        features: polygonLayers
          .map((layer) => layerToFeature(layer))
          .filter(Boolean),
      };
    } catch (error) {
      console.error("getDrawnGeojson error:", error);
      return null;
    }
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
    getDrawnGeojson,
    savedIndex,
    getToleranceMeters,
    getSavedIndexForValidation: () => savedIndexRef.current,
    getDrawnIndex: () => drawnIndexRef.current,
  };
};