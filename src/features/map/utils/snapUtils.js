// src/features/map/utils/snapUtils.js
import {
  point as turfPoint,
  polygon as turfPolygon,
} from "@turf/helpers";
import distance from "@turf/distance";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import booleanDisjoint from "@turf/boolean-disjoint";
import area from "@turf/area";
import intersect from "@turf/intersect";
import RBush from "rbush";

// ═══════════════════════════════════════════════════════════
// ثابت‌ها
// ═══════════════════════════════════════════════════════════

export const DEFAULT_SNAP_TOLERANCE_PX = 25;

const MIN_TOLERANCE_METERS = 1;
const MAX_TOLERANCE_METERS = 100;

export const OVERLAP_TOLERANT_M2 = 1.0;
export const OVERLAP_WARNING_M2 = 30.0;

const EARTH_RADIUS_M = 6378137;

// ═══════════════════════════════════════════════════════════
// Sanity bounds
// ═══════════════════════════════════════════════════════════
const MAX_ORIGIN_DISTANCE_DEG = 0.5;    // ~50km
const MAX_SNAP_DRIFT_DEG = 0.005;       // ~550m

// ═══════════════════════════════════════════════════════════
// validate helper — مختصات معتبر؟
// ═══════════════════════════════════════════════════════════
function isFiniteLngLat(lng, lat) {
  return (
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng >= -180 && lng <= 180 &&
    lat >= -90 && lat <= 90 &&
    !(lng === 0 && lat === 0)
  );
}

// ═══════════════════════════════════════════════════════════
// ✅ چک ساده‌ی صحت poly (فقط area)
//
// چرا فقط area؟ چون intersect(poly, poly) برای مزارع بزرگ
// گاهی floating-point error می‌دهد و همه را رد می‌کند.
// booleanDisjoint در validateNoOverlap خودش اگر poly معیوب
// باشد throw می‌کند → اونجا skip می‌کنیم (fail-open).
// ═══════════════════════════════════════════════════════════
function isPolygonValid(poly) {
  if (!poly) return false;
  try {
    const a = area(poly);
    return Number.isFinite(a) && a >= 0.01;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// تصویر lat/lng → متر محلی (forward)
// ═══════════════════════════════════════════════════════════
export function lngLatToMeters(lng, lat, originLng, originLat) {
  const latRad = (lat * Math.PI) / 180;
  const originLatRad = (originLat * Math.PI) / 180;
  const dLng = ((lng - originLng) * Math.PI) / 180;

  const x = dLng * EARTH_RADIUS_M * Math.cos((latRad + originLatRad) / 2);
  const y = (lat - originLat) * (Math.PI / 180) * EARTH_RADIUS_M;
  return [x, y];
}

// ═══════════════════════════════════════════════════════════
// ✅ inverse متقارن با forward (mid-lat)
// ═══════════════════════════════════════════════════════════
export function metersToLngLat(x, y, originLng, originLat) {
  const originLatRad = (originLat * Math.PI) / 180;
  const midLatRad = originLatRad + y / (2 * EARTH_RADIUS_M);
  const cosLat = Math.max(Math.cos(midLatRad), 1e-6);

  const lng = originLng + (x / (EARTH_RADIUS_M * cosLat)) * (180 / Math.PI);
  const lat = originLat + (y / EARTH_RADIUS_M) * (180 / Math.PI);
  return [lng, lat];
}

// ═══════════════════════════════════════════════════════════
// tolerancePxToMeters
// ═══════════════════════════════════════════════════════════
export function tolerancePxToMeters(map, tolerancePx = DEFAULT_SNAP_TOLERANCE_PX) {
  if (!map) return MIN_TOLERANCE_METERS;

  try {
    const zoom = map.getZoom();
    const center = map.getCenter();
    const latRad = (center.lat * Math.PI) / 180;

    const metersPerPixel =
      (156543.03392 * Math.cos(latRad)) / Math.pow(2, zoom);
    const meters = tolerancePx * metersPerPixel;

    return Math.max(MIN_TOLERANCE_METERS, Math.min(MAX_TOLERANCE_METERS, meters));
  } catch {
    return MIN_TOLERANCE_METERS;
  }
}

// ═══════════════════════════════════════════════════════════
// SnapIndex
// ═══════════════════════════════════════════════════════════
export class SnapIndex {
  constructor() {
    this.vertexTree = new RBush(16);
    this.edgeTree = new RBush(16);
    this.polygons = [];
    this.origin = null;
  }

  clear() {
    this.vertexTree.clear();
    this.edgeTree.clear();
    this.polygons = [];
    this.origin = null;
  }

  // ✅ بر اساس polygons هم چک کن (نه فقط trees)
  hasAny() {
    return (
      this.polygons.length > 0 ||
      this.vertexTree.all().length > 0 ||
      this.edgeTree.all().length > 0
    );
  }

  addFeature(feature) {
    if (!feature) return;

    const geometry = feature.geometry || feature;
    if (!geometry) return;

    const polygonsCoords = geometryToPolygonsCoords(geometry);

    for (const rings of polygonsCoords) {
      if (!rings || rings.length === 0) continue;

      // ─── validate poly ───
      let poly;
      try {
        poly = turfPolygon(rings);
      } catch {
        continue;
      }

      // ✅ چک ساده (فقط area)
      if (!isPolygonValid(poly)) {
        continue;
      }

      this.polygons.push({ polygon: poly, farm: feature.properties || {} });

      // ─── extract vertices/edges ───
      const outer = rings[0];
      if (!Array.isArray(outer) || outer.length < 2) continue;

      for (let i = 0; i < outer.length - 1; i++) {
        const [lngA, latA] = outer[i];
        const [lngB, latB] = outer[i + 1];

        if (!isFiniteLngLat(lngA, latA)) continue;
        if (!isFiniteLngLat(lngB, latB)) continue;

        // ✅ origin فقط یک‌بار set (بدون drift)
        if (!this.origin) {
          this.origin = { lat: latA, lng: lngA };
        }

        this.vertexTree.insert({
          minX: lngA, minY: latA, maxX: lngA, maxY: latA,
          lat: latA, lng: lngA,
        });

        this.edgeTree.insert({
          minX: Math.min(lngA, lngB), minY: Math.min(latA, latB),
          maxX: Math.max(lngA, lngB), maxY: Math.max(latA, latB),
          a: [latA, lngA], b: [latB, lngB],
        });
      }
    }
  }

  build(farms) {
    this.clear();
    if (!Array.isArray(farms) || farms.length === 0) return;

    for (const farm of farms) {
      if (!farm?.geojson) continue;
      const features = normalizeToFeatures(farm.geojson);
      for (const feature of features) {
        const enriched = {
          ...feature,
          properties: { ...(feature.properties || {}), _farm: farm },
        };
        this.addFeature(enriched);
      }
    }

    if (!this.origin) {
      const all = this.vertexTree.all();
      if (all.length > 0) {
        let sumLat = 0, sumLng = 0;
        for (const v of all) {
          sumLat += v.lat;
          sumLng += v.lng;
        }
        this.origin = { lat: sumLat / all.length, lng: sumLng / all.length };
      }
    }
  }

  searchVertices(bbox) {
    return this.vertexTree.search(bbox);
  }

  searchEdges(bbox) {
    return this.edgeTree.search(bbox);
  }
}

// ═══════════════════════════════════════════════════════════
// findNearestVertex
// ═══════════════════════════════════════════════════════════
function findNearestVertex(index, lat, lng, toleranceMeters) {
  if (!index?.origin) return null;

  const { lat: oLat, lng: oLng } = index.origin;

  const latDelta = toleranceMeters / 111320;
  const lngDelta =
    toleranceMeters /
    (111320 * Math.max(Math.cos((lat * Math.PI) / 180), 1e-6));

  const candidates = index.searchVertices({
    minX: lng - lngDelta, minY: lat - latDelta,
    maxX: lng + lngDelta, maxY: lat + latDelta,
  });

  if (candidates.length === 0) return null;

  const [px, py] = lngLatToMeters(lng, lat, oLng, oLat);
  const tolSq = toleranceMeters * toleranceMeters;

  let best = null;
  let bestDistSq = Infinity;

  for (const v of candidates) {
    if (!isFiniteLngLat(v.lng, v.lat)) continue;

    const [vx, vy] = lngLatToMeters(v.lng, v.lat, oLng, oLat);
    const d2 = (vx - px) ** 2 + (vy - py) ** 2;
    if (d2 < bestDistSq && d2 <= tolSq) {
      bestDistSq = d2;
      best = v;
    }
  }

  if (!best) return null;

  return {
    kind: "vertex",
    lat: best.lat, lng: best.lng,
    distance: Math.sqrt(bestDistSq),
  };
}

// ═══════════════════════════════════════════════════════════
// findNearestEdge
// ═══════════════════════════════════════════════════════════
function findNearestEdge(index, lat, lng, toleranceMeters) {
  if (!index?.origin) return null;

  const { lat: oLat, lng: oLng } = index.origin;

  const latDelta = toleranceMeters / 111320;
  const lngDelta =
    toleranceMeters /
    (111320 * Math.max(Math.cos((lat * Math.PI) / 180), 1e-6));

  const candidates = index.searchEdges({
    minX: lng - lngDelta, minY: lat - latDelta,
    maxX: lng + lngDelta, maxY: lat + latDelta,
  });

  if (candidates.length === 0) return null;

  const [px, py] = lngLatToMeters(lng, lat, oLng, oLat);
  const tolSq = toleranceMeters * toleranceMeters;

  let best = null;
  let bestDistSq = Infinity;

  for (const e of candidates) {
    if (!Array.isArray(e.a) || !Array.isArray(e.b)) continue;
    if (!Number.isFinite(e.a[0]) || !Number.isFinite(e.a[1])) continue;
    if (!Number.isFinite(e.b[0]) || !Number.isFinite(e.b[1])) continue;

    const [ax, ay] = lngLatToMeters(e.a[1], e.a[0], oLng, oLat);
    const [bx, by] = lngLatToMeters(e.b[1], e.b[0], oLng, oLat);

    const { x, y } = closestPointOnSegment(px, py, ax, ay, bx, by);
    const d2 = (x - px) ** 2 + (y - py) ** 2;

    if (d2 < bestDistSq && d2 <= tolSq) {
      bestDistSq = d2;
      const [projLng, projLat] = metersToLngLat(x, y, oLng, oLat);
      best = {
        lat: projLat,
        lng: projLng,
        edge: { a: e.a, b: e.b },
      };
    }
  }

  if (!best) return null;

  return {
    kind: "edge",
    lat: best.lat, lng: best.lng,
    distance: Math.sqrt(bestDistSq),
    edge: best.edge,
  };
}

function closestPointOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;

  const abLenSq = abx * abx + aby * aby;
  if (abLenSq < 1e-12) return { x: ax, y: ay };

  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));

  return { x: ax + t * abx, y: ay + t * aby };
}

// ═══════════════════════════════════════════════════════════
// findSnapTarget
// ═══════════════════════════════════════════════════════════
export function findSnapTarget(latlng, index, toleranceMeters) {
  if (!latlng || !index?.origin) return null;

  const lat = Number(latlng.lat);
  const lng = Number(latlng.lng);
  if (!isFiniteLngLat(lng, lat)) return null;

  // sanity: محدوده‌ی امن از origin
  const origin = index.origin;
  if (
    Math.abs(lat - origin.lat) > MAX_ORIGIN_DISTANCE_DEG ||
    Math.abs(lng - origin.lng) > MAX_ORIGIN_DISTANCE_DEG
  ) {
    return null;
  }

  const pt = turfPoint([lng, lat]);
  for (const { polygon } of index.polygons) {
    try {
      if (booleanPointInPolygon(pt, polygon)) {
        return { kind: "inside", lat, lng, distance: 0 };
      }
    } catch {
      /* ignore */
    }
  }

  const vertexHit = findNearestVertex(index, lat, lng, toleranceMeters);
  if (
    vertexHit &&
    Number.isFinite(vertexHit.lat) &&
    Number.isFinite(vertexHit.lng)
  ) {
    return vertexHit;
  }

  const edgeHit = findNearestEdge(index, lat, lng, toleranceMeters);
  if (
    edgeHit &&
    Number.isFinite(edgeHit.lat) &&
    Number.isFinite(edgeHit.lng) &&
    edgeHit.edge
  ) {
    return edgeHit;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════
// snapLatLngArray
// ═══════════════════════════════════════════════════════════
export function snapLatLngArray(latlngs, index, toleranceMeters, options = {}) {
  const { allowInside = false } = options;

  if (!Array.isArray(latlngs) || !index) return latlngs;

  return latlngs.map((ll) => {
    if (!ll) return ll;

    // ─── آرایه [lat, lng] ───
    if (Array.isArray(ll)) {
      const lat = Number(ll[0]);
      const lng = Number(ll[1]);

      if (!isFiniteLngLat(lng, lat)) return ll;

      const hit = findSnapTarget({ lat, lng }, index, toleranceMeters);
      if (hit && (allowInside || hit.kind !== "inside")) {
        if (Number.isFinite(hit.lat) && Number.isFinite(hit.lng)) {
          const drift = Math.sqrt(
            (hit.lat - lat) ** 2 + (hit.lng - lng) ** 2,
          );
          if (drift <= MAX_SNAP_DRIFT_DEG) {
            return [hit.lat, hit.lng];
          }
        }
      }
      return [lat, lng];
    }

    // ─── LatLng object ───
    const llLat = typeof ll.lat === "number" ? ll.lat : null;
    const llLng = typeof ll.lng === "number" ? ll.lng : null;

    if (llLat === null || llLng === null) return ll;
    if (!isFiniteLngLat(llLng, llLat)) return ll;

    const hit = findSnapTarget(
      { lat: llLat, lng: llLng },
      index,
      toleranceMeters,
    );

    if (hit && (allowInside || hit.kind !== "inside")) {
      if (Number.isFinite(hit.lat) && Number.isFinite(hit.lng)) {
        const drift = Math.sqrt(
          (hit.lat - llLat) ** 2 + (hit.lng - llLng) ** 2,
        );
        if (drift <= MAX_SNAP_DRIFT_DEG) {
          return [hit.lat, hit.lng];
        }
      }
    }
    return [llLat, llLng];
  });
}

// ═══════════════════════════════════════════════════════════
// ✅ validateNoOverlap — fail-open
//
// اگر turf روی polygon معیوب throw کرد → skip (نه reject).
// چرا؟
//   - newPolygonFeature ممکن است سالم باشد
//   - فقط یک polygon ذخیره‌شده معیوب است
//   - نباید کل رسم را بلاک کنیم
// ═══════════════════════════════════════════════════════════
export function validateNoOverlap(newPolygonFeature, index) {
  if (!newPolygonFeature || !index?.polygons?.length) {
    return { valid: true };
  }

  let checked = 0;
  let failed = 0;

  for (const { polygon, farm } of index.polygons) {
    let isDisjoint = true;
    try {
      isDisjoint = booleanDisjoint(newPolygonFeature, polygon);
    } catch (err) {
      failed++;
      continue; // ✅ fail-open
    }

    if (isDisjoint) continue;

    let overlapAreaM2 = 0;
    try {
      const intersection = intersect(newPolygonFeature, polygon);
      if (!intersection) continue;
      overlapAreaM2 = area(intersection);
    } catch (err) {
      failed++;
      continue; // ✅ fail-open
    }

    checked++;

    if (!Number.isFinite(overlapAreaM2) || overlapAreaM2 < OVERLAP_TOLERANT_M2) {
      continue;
    }

    if (overlapAreaM2 < OVERLAP_WARNING_M2) {
      continue;
    }

    return {
      valid: false,
      reason: "overlap",
      conflictingFarm: farm?._farm || farm,
      overlapArea: overlapAreaM2,
    };
  }

  if (failed > 0 && import.meta.env.DEV) {
    console.info(
      `[Overlap] ${failed} polygon(s) skipped (checked: ${checked})`,
    );
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════
function normalizeToFeatures(geojson) {
  if (!geojson) return [];
  if (Array.isArray(geojson)) {
    return geojson
      .map((g) => {
        if (!g) return null;
        if (g.type === "Feature") return g;
        if (g.type === "Polygon" || g.type === "MultiPolygon") {
          return { type: "Feature", properties: {}, geometry: g };
        }
        return null;
      })
      .filter(Boolean);
  }
  if (geojson.type === "FeatureCollection") return geojson.features || [];
  if (geojson.type === "Feature") return [geojson];
  if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
    return [{ type: "Feature", properties: {}, geometry: geojson }];
  }
  return [];
}

function geometryToPolygonsCoords(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

// ═══════════════════════════════════════════════════════════
// API قدیمی
// ═══════════════════════════════════════════════════════════
export function extractVertices(farms) {
  const index = new SnapIndex();
  index.build(farms);
  return index.vertexTree.all().map((v) => [v.lng, v.lat]);
}

export function extractPolygons(farms) {
  const index = new SnapIndex();
  index.build(farms);
  return index.polygons;
}

export function findSnapVertex(latlng, vertices, polygons = []) {
  if (!latlng || !Array.isArray(vertices) || vertices.length === 0) return null;

  const lat = Number(latlng.lat);
  const lng = Number(latlng.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const searchPoint = turfPoint([lng, lat]);
  let closest = null;
  let minDist = Infinity;

  for (const [vLng, vLat] of vertices) {
    if (!Number.isFinite(vLng) || !Number.isFinite(vLat)) continue;
    const d = distance(searchPoint, turfPoint([vLng, vLat]), { units: "meters" });
    if (d <= DEFAULT_SNAP_TOLERANCE_PX && d < minDist) {
      minDist = d;
      closest = { lat: vLat, lng: vLng };
    }
  }

  return closest;
}

export const SNAP_DISTANCE_METERS = DEFAULT_SNAP_TOLERANCE_PX;
export const SNAP_OFFSET = 0.3;