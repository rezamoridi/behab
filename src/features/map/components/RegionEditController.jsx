// src/features/map/components/RegionEditController.jsx
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useRegionQuery } from "../../regions/hooks/useRegions";

// ============================================================
// تبدیل geojson به L.Polygon
// ============================================================
const geometryToPolygons = (geometry, styleOptions = {}) => {
  if (!geometry) return [];

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  const defaultStyle = {
    color: "#7C3AED",
    weight: 3,
    fillColor: "#7C3AED",
    fillOpacity: 0.15,
    dashArray: "10, 6",
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
      console.warn("Invalid region polygon:", err);
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

const getFeatures = (geojson) => {
  if (!geojson) return [];
  try {
    if (geojson.type === "FeatureCollection") return geojson.features || [];
    if (geojson.type === "Feature") return [geojson];
    if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
      return [{ type: "Feature", properties: {}, geometry: geojson }];
    }
    return [];
  } catch {
    return [];
  }
};

// ============================================================
// RegionEditController
// ============================================================
const RegionEditController = ({
  editRegionId = null,
  drawnItemsRef,
  onLoaded,
  onError,
}) => {
  const map = useMap();

  const {
    data: region,
    isLoading,
    isError,
    error,
  } = useRegionQuery(editRegionId, { enabled: !!editRegionId });

  const loadedRegionIdRef = useRef(null);
  const [retry, setRetry] = useState(0);

  // ============================================================
  // بارگذاری geojson منطقه — با retry
  // ============================================================
  useEffect(() => {
    if (!editRegionId) {
      loadedRegionIdRef.current = null;
      return;
    }

    // اگر region هنوز لود نشده
    if (isLoading) return;

    // اگر خطای لود
    if (isError) {
      onError?.(error);
      return;
    }

    // اگر region یافت نشد
    if (!region) {
      onLoaded?.(null, 0);
      loadedRegionIdRef.current = editRegionId;
      return;
    }

    // قبلاً بارگذاری شده؟
    if (loadedRegionIdRef.current === editRegionId) return;

    // ⚠️ drawnItemsRef آماده نیست؟ → retry
    const drawnItems = drawnItemsRef?.current;
    if (!drawnItems) {
      if (retry < 20) {
        const timer = setTimeout(() => {
          setRetry((r) => r + 1);
        }, 100);
        return () => clearTimeout(timer);
      }

      // بعد از ۲۰ تلاش، رها کن ولی onLoaded را صدا بزن
      console.warn("drawnItemsRef never became available");
      onLoaded?.(region, 0);
      loadedRegionIdRef.current = editRegionId;
      return;
    }

    // ✅ drawnItemsRef آماده است → بارگذاری
    try {
      drawnItems.clearLayers();

      const features = getFeatures(region.geojson);

      if (features.length === 0) {
        onLoaded?.(region, 0);
        loadedRegionIdRef.current = editRegionId;
        return;
      }

      let totalPolygons = 0;

      for (const feature of features) {
        const geometry = feature.geometry || feature;
        if (!geometry) continue;

        const polygons = geometryToPolygons(geometry, {
          color: "#7C3AED",
          weight: 3,
          fillColor: "#7C3AED",
          fillOpacity: 0.15,
          dashArray: "10, 6",
        });

        for (const polygon of polygons) {
          drawnItems.addLayer(polygon);
          totalPolygons++;
        }
      }

      // zoom
      if (drawnItems.getLayers().length > 0) {
        try {
          const bounds = drawnItems.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [80, 80] });
          }
        } catch {
          /* ignore */
        }
      }

      loadedRegionIdRef.current = editRegionId;
      onLoaded?.(region, totalPolygons);
    } catch (err) {
      console.error("RegionEditController error:", err);
      onError?.(err);
      loadedRegionIdRef.current = editRegionId;
    }
  }, [
    editRegionId,
    region,
    isLoading,
    isError,
    error,
    map,
    drawnItemsRef,
    onLoaded,
    onError,
    retry,
  ]);

  return null;
};

export default RegionEditController;
