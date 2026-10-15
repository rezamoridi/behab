// src/features/map/components/VillagesLayer.jsx
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useVillagesQuery } from "../../villages/hooks/useVillages";
import { useAgricultureSettingsQuery } from "../../settings/hooks/useAgricultureSettings";
import { getDashArray } from "../../settings/hooks/useLayerStyle";

// ============================================================
// استایل از تنظیمات DB
// ============================================================
const buildStyles = (settings) => {
  const color = settings?.village_layer_color || "#10B981";
  const weight = Number(settings?.village_layer_stroke_weight ?? 2);
  const style = settings?.village_layer_stroke_style || "dashed";
  const fillOpacity = Number(
    settings?.village_layer_fill_opacity ?? 0.06,
  );

  const dashArray = getDashArray(style);

  return {
    normal: {
      color,
      weight,
      opacity: 0.75,
      fillColor: color,
      fillOpacity,
      dashArray,
    },
    hover: {
      color,
      weight: weight + 1,
      opacity: 1,
      fillColor: color,
      fillOpacity: fillOpacity + 0.09,
      dashArray,
    },
    selected: {
      color,
      weight: weight + 1.5,
      opacity: 1,
      fillColor: color,
      fillOpacity: fillOpacity + 0.14,
      dashArray,
    },
  };
};

// ============================================================
// geometryToPolygons
// ============================================================
const geometryToPolygons = (geometry, styleOptions = {}) => {
  if (!geometry) return [];

  const type = geometry.type;
  const coordinates = geometry.coordinates;

  const defaultStyle = {
    color: "#10B981",
    weight: 2,
    opacity: 0.75,
    fillColor: "#10B981",
    fillOpacity: 0.06,
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

// ============================================================
// getFeatures
// ============================================================
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
// VillagesLayer
// ============================================================
const VillagesLayer = ({
  visible = true,
  selectedVillageId = null,
  onVillageClick,
  regionFilterId = null,
}) => {
  const map = useMap();
  const layerGroupRef = useRef(null);
  const polygonsByVillageRef = useRef(new Map());
  const stylesRef = useRef(null);

  // ✅ تنظیمات ظاهر
  const { data: agricultureSettings } = useAgricultureSettingsQuery();

  const styles = buildStyles(agricultureSettings);
  useEffect(() => {
    stylesRef.current = styles;
  }, [agricultureSettings]);

  // ✅ فاز ۴/۵: query فقط وقتی visible
  // ⚠️ این خطا را رفع می‌کند: دهیار روی /map می‌رفت و 403 می‌گرفت
  // چون useVillagesQuery همیشه enabled بود، حتی وقتی visible=false
  const { data: villages = [] } = useVillagesQuery({
    activeOnly: true,
    regionId: regionFilterId,
    enabled: visible,        // ✅ فقط وقتی visible
  });

  const handlersRef = useRef({ onVillageClick });
  useEffect(() => {
    handlersRef.current = { onVillageClick };
  }, [onVillageClick]);

  // cleanup
  const cleanupAll = useCallback(() => {
    polygonsByVillageRef.current.forEach((polygons) => {
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
    polygonsByVillageRef.current.clear();

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

  // Main Effect
  useEffect(() => {
    if (!map) return;

    cleanupAll();

    if (!visible) return;
    if (!villages || villages.length === 0) return;

    const layerGroup = L.layerGroup();
    layerGroupRef.current = layerGroup;

    const currentStyles = stylesRef.current;

    villages.forEach((village) => {
      if (!village || !village.geojson || !village.id) return;

      const features = getFeatures(village.geojson);
      if (features.length === 0) return;

      const villagePolygons = [];

      for (const feature of features) {
        const geometry = feature.geometry || feature;
        if (!geometry) continue;

        const polygons = geometryToPolygons(
          geometry,
          currentStyles.normal,
        );

        for (const polygon of polygons) {
          const tooltipHtml = `
            <div style="
              font-family: Vazirmatn, sans-serif;
              direction: rtl;
              font-weight: 700;
              font-size: 12px;
              padding: 2px 4px;
              color: #047857;
              white-space: nowrap;
            ">
              <span style="opacity: 0.6; font-weight: 500; font-size: 10px;">روستا:</span>
              ${village.name}
              ${
                village.farm_count > 0
                  ? `<span style="margin-right: 6px; opacity: 0.5; font-size: 10px;">(${village.farm_count.toLocaleString("fa-IR")} مزرعه)</span>`
                  : ""
              }
            </div>
          `;

          polygon.bindTooltip(tooltipHtml, {
            sticky: true,
            direction: "top",
            className: "village-tooltip",
            opacity: 1,
          });

          polygon.on("mouseover", () => {
            polygon.setStyle(stylesRef.current.hover);
          });
          polygon.on("mouseout", () => {
            polygon.setStyle(stylesRef.current.normal);
          });

          polygon.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            const { onVillageClick: cb } = handlersRef.current;
            if (typeof cb === "function") {
              cb(village);
            }
          });

          layerGroup.addLayer(polygon);
          villagePolygons.push(polygon);
        }
      }

      if (villagePolygons.length > 0) {
        polygonsByVillageRef.current.set(
          String(village.id),
          villagePolygons,
        );
      }
    });

    layerGroup.addTo(map);

    return () => {
      cleanupAll();
    };
  }, [map, villages, visible, cleanupAll, agricultureSettings]);

  // Selected Effect
  useEffect(() => {
    polygonsByVillageRef.current.forEach((polygons, villageId) => {
      const isSelected =
        String(villageId) === String(selectedVillageId);
      const style = isSelected
        ? stylesRef.current.selected
        : stylesRef.current.normal;

      polygons.forEach((polygon) => {
        try {
          polygon.setStyle(style);
        } catch {
          /* ignore */
        }
      });
    });
  }, [selectedVillageId, agricultureSettings]);

  return null;
};

export default VillagesLayer;