// src/features/map/components/RegionsLayer.jsx
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { createRoot } from "react-dom/client";
import { useRegionsQuery } from "../../regions/hooks/useRegions";

// ============================================================
// رنگ‌های منطقه
// ============================================================
const REGION_STYLE = {
  // حالت عادی
  normal: {
    color: "#7C3AED",        // بنفش
    weight: 2.5,
    opacity: 0.75,
    fillColor: "#7C3AED",
    fillOpacity: 0.08,
    dashArray: "10, 6",      // خط تیره برای تفکیک از مزارع
  },
  // حالت hover
  hover: {
    color: "#6D28D9",
    weight: 3.5,
    opacity: 1,
    fillColor: "#7C3AED",
    fillOpacity: 0.18,
    dashArray: "10, 6",
  },
};

// ============================================================
// تبدیل geojson به L.Polygon
// ============================================================
const geometryToPolygons = (geometry, styleOptions = {}) => {
  if (!geometry) return [];

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  const defaultStyle = {
    color: REGION_STYLE.normal.color,
    weight: REGION_STYLE.normal.weight,
    opacity: REGION_STYLE.normal.opacity,
    fillColor: REGION_STYLE.normal.fillColor,
    fillOpacity: REGION_STYLE.normal.fillOpacity,
    dashArray: REGION_STYLE.normal.dashArray,
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

// ============================================================
// getFeatures
// ============================================================
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
// RegionsLayer
// ============================================================
const RegionsLayer = ({
  visible = true,
  selectedRegionId = null,
  onRegionClick,
}) => {
  const map = useMap();
  const layerGroupRef = useRef(null);
  const polygonsByRegionRef = useRef(new Map());

  const { data: regions = [] } = useRegionsQuery({ activeOnly: true });

  // handlers ref
  const handlersRef = useRef({ onRegionClick });
  useEffect(() => {
    handlersRef.current = { onRegionClick };
  }, [onRegionClick]);

  // ============================================================
  // cleanup
  // ============================================================
  const cleanupAll = useCallback(() => {
    polygonsByRegionRef.current.forEach((polygons) => {
      polygons.forEach((polygon) => {
        try {
          polygon.off();
          polygon.unbindTooltip();
          if (map.hasLayer(polygon)) map.removeLayer(polygon);
        } catch {
          /* ignore */
        }
      });
    });
    polygonsByRegionRef.current.clear();

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
  // Main Effect
  // ============================================================
  useEffect(() => {
    if (!map) return;

    cleanupAll();

    if (!visible) return;
    if (!regions || regions.length === 0) return;

    const layerGroup = L.layerGroup();
    layerGroupRef.current = layerGroup;

    regions.forEach((region) => {
      if (!region || !region.geojson || !region.id) return;

      const features = getFeatures(region.geojson);
      if (features.length === 0) return;

      const regionPolygons = [];

      for (const feature of features) {
        const geometry = feature.geometry || feature;
        if (!geometry) continue;

        const polygons = geometryToPolygons(geometry, REGION_STYLE.normal);

        for (const polygon of polygons) {
          // ✅ tooltip با نام منطقه
          const tooltipHtml = `
            <div style="
              font-family: Vazirmatn, sans-serif;
              direction: rtl;
              font-weight: 700;
              font-size: 12px;
              padding: 2px 4px;
              color: #5B21B6;
              white-space: nowrap;
            ">
              <span style="opacity: 0.6; font-weight: 500; font-size: 10px;">منطقه:</span>
              ${region.name}
              ${
                region.user_count > 0
                  ? `<span style="margin-right: 6px; opacity: 0.5; font-size: 10px;">(${region.user_count.toLocaleString("fa-IR")} مسئول)</span>`
                  : ""
              }
            </div>
          `;

          polygon.bindTooltip(tooltipHtml, {
            sticky: true,
            direction: "top",
            className: "region-tooltip",
            opacity: 1,
          });

          // ✅ hover effect
          polygon.on("mouseover", () => {
            polygon.setStyle(REGION_STYLE.hover);
          });
          polygon.on("mouseout", () => {
            polygon.setStyle(REGION_STYLE.normal);
          });

          // ✅ کلیک
          polygon.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            const { onRegionClick: cb } = handlersRef.current;
            if (typeof cb === "function") {
              cb(region);
            }
          });

          layerGroup.addLayer(polygon);
          regionPolygons.push(polygon);
        }
      }

      if (regionPolygons.length > 0) {
        polygonsByRegionRef.current.set(String(region.id), regionPolygons);
      }
    });

    layerGroup.addTo(map);

    return () => {
      cleanupAll();
    };
  }, [map, regions, visible, cleanupAll]);

  // ============================================================
  // Selected Effect
  // ============================================================
  useEffect(() => {
    polygonsByRegionRef.current.forEach((polygons, regionId) => {
      const isSelected = String(regionId) === String(selectedRegionId);
      const style = isSelected
        ? {
            color: "#6D28D9",
            weight: 4,
            opacity: 1,
            fillColor: "#7C3AED",
            fillOpacity: 0.22,
            dashArray: "10, 6",
          }
        : REGION_STYLE.normal;

      polygons.forEach((polygon) => {
        try {
          polygon.setStyle(style);
        } catch {
          /* ignore */
        }
      });
    });
  }, [selectedRegionId]);

  return null;
};

export default RegionsLayer;