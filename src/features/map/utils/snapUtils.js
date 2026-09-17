// src/features/map/utils/snapUtils.js
import { point as turfPoint, polygon } from "@turf/helpers";
import distance from "@turf/distance";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import pointToPolygonDistance from "@turf/point-to-polygon-distance";
import center from "@turf/center";
import { centroid } from "@turf/centroid";

// ============================================================
// آستانه‌های اسنپ
// ============================================================
const SNAP_THRESHOLD_METERS = 15;

// ✅ فاصله‌ی ایمنی از لبه‌ی مزرعه ذخیره‌شده (متر)
const SNAP_OFFSET_METERS = 0.5;

// ============================================================
// استخراج همه‌ی رئوس مزارع ذخیره‌شده
// ============================================================
export function extractVertices(farms) {
  const vertices = [];
  if (!Array.isArray(farms) || farms.length === 0) return vertices;

  for (const farm of farms) {
    if (!farm) continue;
    const geojson = farm.geojson;
    if (!geojson) continue;

    const features = normalizeToFeatures(geojson);

    for (const feature of features) {
      const geometry = feature?.geometry || feature;
      if (!geometry) continue;

      const rings = getRings(geometry);
      for (const ring of rings) {
        if (!Array.isArray(ring)) continue;
        for (const coord of ring) {
          if (
            Array.isArray(coord) &&
            coord.length >= 2 &&
            Number.isFinite(coord[0]) &&
            Number.isFinite(coord[1])
          ) {
            vertices.push([coord[0], coord[1]]);
          }
        }
      }
    }
  }

  return vertices;
}

// ============================================================
// ✅ استخراج polygonهای کامل مزارع ذخیره‌شده
// ============================================================
export function extractPolygons(farms) {
  const polygons = [];
  if (!Array.isArray(farms) || farms.length === 0) return polygons;

  for (const farm of farms) {
    if (!farm) continue;
    const geojson = farm.geojson;
    if (!geojson) continue;

    const features = normalizeToFeatures(geojson);

    for (const feature of features) {
      const geometry = feature?.geometry || feature;
      if (!geometry) continue;

      if (geometry.type === "Polygon") {
        try {
          const poly = polygon(geometry.coordinates);
          polygons.push({ polygon: poly, feature });
        } catch (err) {
          console.warn("Invalid polygon in extractPolygons:", err);
        }
      } else if (geometry.type === "MultiPolygon") {
        for (const coords of geometry.coordinates) {
          try {
            const poly = polygon(coords);
            polygons.push({ polygon: poly, feature });
          } catch (err) {
            console.warn("Invalid multipolygon part:", err);
          }
        }
      }
    }
  }

  return polygons;
}

// ============================================================
// نرمال‌سازی geojson به آرایه‌ای از Feature
// ============================================================
function normalizeToFeatures(geojson) {
  if (!geojson) return [];

  if (Array.isArray(geojson)) {
    return geojson
      .map((item) => {
        if (!item) return null;
        if (item.type === "Feature") return item;
        if (item.type === "Polygon" || item.type === "MultiPolygon") {
          return { type: "Feature", properties: {}, geometry: item };
        }
        return null;
      })
      .filter(Boolean);
  }

  if (geojson.type === "FeatureCollection") {
    return geojson.features || [];
  }

  if (geojson.type === "Feature") {
    return [geojson];
  }

  if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
    return [{ type: "Feature", properties: {}, geometry: geojson }];
  }

  return [];
}

// ============================================================
// استخراج rings از geometry
// ============================================================
function getRings(geometry) {
  if (!geometry) return [];

  if (geometry.type === "Polygon") {
    return geometry.coordinates || [];
  }

  if (geometry.type === "MultiPolygon") {
    const rings = [];
    for (const polygonCoords of geometry.coordinates || []) {
      for (const ring of polygonCoords || []) {
        rings.push(ring);
      }
    }
    return rings;
  }

  return [];
}

// ============================================================
// ✅ بررسی آیا نقطه داخل یا روی لبه‌ی هر polygon است
// ============================================================
function isPointInsideAnyPolygon(pointFeature, polygons) {
  if (!polygons || polygons.length === 0) return false;

  for (const { polygon: poly } of polygons) {
    try {
      if (booleanPointInPolygon(pointFeature, poly)) {
        return true;
      }
    } catch {
      // نادیده بگیر
    }
  }
  return false;
}

// ============================================================
// ✅ یافتن نزدیک‌ترین vertex با offset به بیرون
// ============================================================
export function findSnapVertex(latlng, vertices, polygons = []) {
  if (!latlng || !Array.isArray(vertices) || vertices.length === 0) {
    return null;
  }

  const lat = Number(latlng.lat);
  const lng = Number(latlng.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const searchPoint = turfPoint([lng, lat]);
  let closest = null;
  let minDist = Infinity;

  for (const [vLng, vLat] of vertices) {
    if (!Number.isFinite(vLng) || !Number.isFinite(vLat)) continue;

    const candidate = turfPoint([vLng, vLat]);
    const dist = distance(searchPoint, candidate, { units: "meters" });

    if (dist <= SNAP_THRESHOLD_METERS && dist < minDist) {
      minDist = dist;
      closest = { lat: vLat, lng: vLng };
    }
  }

  if (!closest) return null;

  return offsetPointOutward(closest, polygons);
}

// ============================================================
// ✅ هل دادن نقطه به بیرون از polygon
// ============================================================
function offsetPointOutward(pointObj, polygons) {
  if (!polygons || polygons.length === 0) {
    return pointObj;
  }

  const pointFeature = turfPoint([pointObj.lng, pointObj.lat]);

  if (!isPointInsideAnyPolygon(pointFeature, polygons)) {
    return pointObj;
  }

  let closestPolygon = null;
  let minDistToPolygon = Infinity;

  for (const { polygon: poly } of polygons) {
    try {
      const dist = pointToPolygonDistance(pointFeature, poly, {
        units: "meters",
      });

      if (dist < minDistToPolygon) {
        minDistToPolygon = dist;
        closestPolygon = poly;
      }
    } catch {
      try {
        const centerFeature = center(poly);
        const dist = distance(pointFeature, centerFeature, { units: "meters" });
        if (dist < minDistToPolygon) {
          minDistToPolygon = dist;
          closestPolygon = poly;
        }
      } catch {
        // نادیده بگیر
      }
    }
  }

  if (!closestPolygon) return pointObj;

  let centerFeature;
  try {
    centerFeature = centroid(closestPolygon);
  } catch {
    centerFeature = center(closestPolygon);
  }

  const centerCoord = centerFeature.geometry.coordinates;
  const pointCoord = [pointObj.lng, pointObj.lat];

  let dx = pointCoord[0] - centerCoord[0];
  let dy = pointCoord[1] - centerCoord[1];
  const mag = Math.sqrt(dx * dx + dy * dy);

  if (mag < 1e-10) {
    dx = 1;
    dy = 0;
  } else {
    dx /= mag;
    dy /= mag;
  }

  const latRad = (pointObj.lat * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos(latRad);

  const offsetLat = (dy * SNAP_OFFSET_METERS) / metersPerDegLat;
  const offsetLng = (dx * SNAP_OFFSET_METERS) / Math.max(metersPerDegLng, 1e-6);

  let result = {
    lat: pointObj.lat + offsetLat,
    lng: pointObj.lng + offsetLng,
  };

  let attempts = 0;
  const MAX_ATTEMPTS = 5;
  const STEP_MULTIPLIER = 2;

  while (attempts < MAX_ATTEMPTS) {
    const checkFeature = turfPoint([result.lng, result.lat]);
    if (!isPointInsideAnyPolygon(checkFeature, polygons)) {
      return result;
    }

    attempts += 1;
    const factor = Math.pow(STEP_MULTIPLIER, attempts);

    result = {
      lat: pointObj.lat + offsetLat * factor,
      lng: pointObj.lng + offsetLng * factor,
    };
  }

  console.warn("Could not find non-overlapping snap point");
  return null;
}

// ============================================================
// ✅ اسنپ کردن یک حلقه (ring) از latlngها
// ============================================================
export function snapLatLngArray(latlngs, vertices, polygons = []) {
  if (!Array.isArray(latlngs)) {
    return latlngs;
  }

  if (vertices.length === 0 && polygons.length === 0) {
    return latlngs.map((ll) => [ll.lat, ll.lng]);
  }

  return latlngs.map((ll) => {
    if (vertices.length > 0) {
      const snapped = findSnapVertex(ll, vertices, polygons);
      if (snapped) {
        return [snapped.lat, snapped.lng];
      }
    }

    if (polygons.length > 0) {
      const pointFeature = turfPoint([ll.lng, ll.lat]);
      if (isPointInsideAnyPolygon(pointFeature, polygons)) {
        const offset = offsetPointOutward(
          { lat: ll.lat, lng: ll.lng },
          polygons,
        );
        if (offset) {
          return [offset.lat, offset.lng];
        }
      }
    }

    return [ll.lat, ll.lng];
  });
}

// ============================================================
// Export thresholds
// ============================================================
export const SNAP_DISTANCE_METERS = SNAP_THRESHOLD_METERS;
export const SNAP_OFFSET = SNAP_OFFSET_METERS;
