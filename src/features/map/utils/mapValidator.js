// src/features/map/utils/mapValidator.js
import intersect from "@turf/intersect";
import area from "@turf/area";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point as turfPoint } from "@turf/helpers";

/**
 * اعتبارسنجی کامل یک polygon جدید در برابر مزارع موجود.
 *
 * @param {Object} newPolygonFeature - GeoJSON Feature با Polygon geometry
 * @param {Array}  existingFarms     - لیست مزارع ثبت‌شده
 * @param {Object} options
 *   - options.minOverlapArea (پیش‌فرض 1 m²) — زیر این مقدار، مماس حساب می‌شود
 * @returns {Object} { valid, reason?, conflictingFarm?, overlapArea? }
 */
export function validateFarmAgainstExisting(
  newPolygonFeature,
  existingFarms,
  options = {}
) {
  const { minOverlapArea = 1 } = options;

  if (!newPolygonFeature) {
    return { valid: false, reason: "empty-polygon" };
  }

  if (!Array.isArray(existingFarms) || existingFarms.length === 0) {
    return { valid: true };
  }

  for (const farm of existingFarms) {
    if (!farm?.geojson) continue;

    const features = normalizeToFeatures(farm.geojson);

    for (const feature of features) {
      const geometry = feature?.geometry || feature;
      if (!geometry) continue;

      try {
        // ── محاسبه‌ی مساحت اشتراک ──
        const intersection = intersect(newPolygonFeature, {
          type: "Feature",
          properties: {},
          geometry,
        });

        if (!intersection) continue; // بدون اشتراک

        const overlapAreaM2 = area(intersection);

        if (overlapAreaM2 < minOverlapArea) {
          // فقط مماس — مجاز است
          continue;
        }

        return {
          valid: false,
          reason: "overlap",
          conflictingFarm: farm,
          overlapArea: overlapAreaM2,
        };
      } catch (err) {
        console.warn("validateFarmAgainstExisting error:", err);
      }
    }
  }

  return { valid: true };
}

function normalizeToFeatures(geojson) {
  if (!geojson) return [];
  if (geojson.type === "FeatureCollection") return geojson.features || [];
  if (geojson.type === "Feature") return [geojson];
  if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
    return [{ type: "Feature", properties: {}, geometry: geojson }];
  }
  return [];
}