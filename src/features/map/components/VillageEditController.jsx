// src/features/map/components/VillageEditController.jsx
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useVillageQuery } from "../../villages/hooks/useVillages";

// ============================================================
// تبدیل geojson به L.Polygon (سبز)
// ============================================================
const geometryToPolygons = (geometry, styleOptions = {}) => {
  if (!geometry) return [];

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  const defaultStyle = {
    color: "#10B981",
    weight: 3,
    fillColor: "#10B981",
    fillOpacity: 0.15,
    dashArray: "6, 4",
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
      console.warn("Invalid village polygon:", err);
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
    if (geojson.type === "FeatureCollection")
      return geojson.features || [];
    if (geojson.type === "Feature") return [geojson];
    if (
      geojson.type === "Polygon" ||
      geojson.type === "MultiPolygon"
    ) {
      return [
        { type: "Feature", properties: {}, geometry: geojson },
      ];
    }
    return [];
  } catch {
    return [];
  }
};

// ============================================================
// VillageEditController
// ============================================================
const VillageEditController = ({
  editVillageId = null,
  drawnItemsRef,
  onLoaded,
  onError,
}) => {
  const map = useMap();

  const {
    data: village,
    isLoading,
    isError,
    error,
  } = useVillageQuery(editVillageId, {
    enabled: !!editVillageId,
  });

  const loadedVillageIdRef = useRef(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!editVillageId) {
      loadedVillageIdRef.current = null;
      return;
    }

    if (isLoading) return;

    if (isError) {
      onError?.(error);
      return;
    }

    if (!village) {
      onLoaded?.(null, 0);
      loadedVillageIdRef.current = editVillageId;
      return;
    }

    if (loadedVillageIdRef.current === editVillageId) return;

    const drawnItems = drawnItemsRef?.current;
    if (!drawnItems) {
      if (retry < 20) {
        const timer = setTimeout(() => {
          setRetry((r) => r + 1);
        }, 100);
        return () => clearTimeout(timer);
      }

      console.warn("drawnItemsRef never became available");
      onLoaded?.(village, 0);
      loadedVillageIdRef.current = editVillageId;
      return;
    }

    try {
      drawnItems.clearLayers();

      const features = getFeatures(village.geojson);

      if (features.length === 0) {
        onLoaded?.(village, 0);
        loadedVillageIdRef.current = editVillageId;
        return;
      }

      let totalPolygons = 0;

      for (const feature of features) {
        const geometry = feature.geometry || feature;
        if (!geometry) continue;

        const polygons = geometryToPolygons(geometry, {
          color: "#10B981",
          weight: 3,
          fillColor: "#10B981",
          fillOpacity: 0.15,
          dashArray: "6, 4",
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

      loadedVillageIdRef.current = editVillageId;
      onLoaded?.(village, totalPolygons);
    } catch (err) {
      console.error("VillageEditController error:", err);
      onError?.(err);
      loadedVillageIdRef.current = editVillageId;
    }
  }, [
    editVillageId,
    village,
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

export default VillageEditController;