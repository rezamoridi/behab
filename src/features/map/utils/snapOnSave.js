// src/features/map/utils/snapOnSave.js
import {
  point as turfPoint,
  polygon as turfPolygon,
} from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import booleanDisjoint from "@turf/boolean-disjoint";
import area from "@turf/area";
import intersect from "@turf/intersect";

// ═══════════════════════════════════════════════════════════
// ثابت‌های قابل تنظیم
// ═══════════════════════════════════════════════════════════

const EDGE_ALIGN_METERS = 3.0;
const VERTEX_MERGE_METERS = 0.8;
const PARALLEL_THRESHOLD = 0.98;
const PUSH_OUT_METERS = 0.2;

/**
 * ✅ آستانه‌های همپوشانی — هماهنگ با snapUtils.js
 *    < 1 m²     → مماس (قبول)
 *    1-30 m²    → هشدار (قبول)
 *    > 30 m²    → مسدود
 */
const OVERLAP_TOLERANT_M2 = 1.0;
const OVERLAP_BLOCK_M2 = 30.0;

const EARTH_RADIUS_M = 6378137;

// ═══════════════════════════════════════════════════════════
// helpers
// ═══════════════════════════════════════════════════════════

function lngLatToMeters(lng, lat, oLng, oLat) {
  const latRad = (lat * Math.PI) / 180;
  const originLatRad = (oLat * Math.PI) / 180;
  const dLng = ((lng - oLng) * Math.PI) / 180;
  return [
    dLng * EARTH_RADIUS_M * Math.cos((latRad + originLatRad) / 2),
    (lat - oLat) * (Math.PI / 180) * EARTH_RADIUS_M,
  ];
}

function metersToLngLat(x, y, oLng, oLat) {
  const latRad = (oLat * Math.PI) / 180;
  const cosLat = Math.max(Math.cos(latRad), 1e-6);
  return [
    oLng + (x / (EARTH_RADIUS_M * cosLat)) * (180 / Math.PI),
    oLat + (y / EARTH_RADIUS_M) * (180 / Math.PI),
  ];
}

function closestPointOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq < 1e-12) return { x: ax, y: ay, t: 0 };

  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  return { x: ax + t * abx, y: ay + t * aby, t };
}

// ═══════════════════════════════════════════════════════════
// استخراج هندسه‌ی همسایه‌ها
// ═══════════════════════════════════════════════════════════

function extractNeighborGeometry(farms) {
  const edges = [];
  const polygons = [];
  const vertices = [];

  if (!Array.isArray(farms)) return { edges, polygons, vertices };

  for (const farm of farms) {
    if (!farm?.geojson) continue;
    const features = normalizeToFeatures(farm.geojson);

    for (const feature of features) {
      const geometry = feature?.geometry || feature;
      if (!geometry) continue;

      const ringsList =
        geometry.type === "Polygon"
          ? [geometry.coordinates]
          : geometry.type === "MultiPolygon"
            ? geometry.coordinates
            : [];

      for (const rings of ringsList) {
        // 🩹 ساخت polygon + اعتبارسنجی
        try {
          const poly = turfPolygon(rings);
          let polyArea = 0;
          try {
            polyArea = area(poly);
          } catch {
            continue;
          }
          if (!Number.isFinite(polyArea) || polyArea < 0.01) {
            continue;
          }
          polygons.push({ polygon: poly, farm });
        } catch {
          continue;
        }

        const outer = rings[0];
        if (!Array.isArray(outer) || outer.length < 2) continue;

        for (let i = 0; i < outer.length - 1; i++) {
          const [lngA, latA] = outer[i];
          const [lngB, latB] = outer[i + 1];
          if (!isFinite(lngA) || !isFinite(latA)) continue;
          if (!isFinite(lngB) || !isFinite(latB)) continue;

          edges.push({
            a: [latA, lngA],
            b: [latB, lngB],
            farm,
          });
          vertices.push({ lat: latA, lng: lngA });
        }
      }
    }
  }

  return { edges, polygons, vertices };
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

function isFinite(n) {
  return Number.isFinite(n);
}

// ═══════════════════════════════════════════════════════════
// فاز ۱: Edge-to-Edge Alignment
// ═══════════════════════════════════════════════════════════

function findSnappableEdge(P1, P2, existingEdges, origin) {
  const [px1, py1] = lngLatToMeters(P1[0], P1[1], origin.lng, origin.lat);
  const [px2, py2] = lngLatToMeters(P2[0], P2[1], origin.lng, origin.lat);

  const segLen = Math.hypot(px2 - px1, py2 - py1);
  if (segLen < 0.5) return null;

  const segDirX = (px2 - px1) / segLen;
  const segDirY = (py2 - py1) / segLen;

  let best = null;
  let bestScore = Infinity;

  for (const edge of existingEdges) {
    const [ax, ay] = lngLatToMeters(edge.a[1], edge.a[0], origin.lng, origin.lat);
    const [bx, by] = lngLatToMeters(edge.b[1], edge.b[0], origin.lng, origin.lat);

    const edgeLen = Math.hypot(bx - ax, by - ay);
    if (edgeLen < 0.5) continue;

    const edgeDirX = (bx - ax) / edgeLen;
    const edgeDirY = (by - ay) / edgeLen;

    const dot = Math.abs(segDirX * edgeDirX + segDirY * edgeDirY);
    if (dot < PARALLEL_THRESHOLD) continue;

    const d1 = Math.abs((px1 - ax) * edgeDirY - (py1 - ay) * edgeDirX);
    const d2 = Math.abs((px2 - ax) * edgeDirY - (py2 - ay) * edgeDirX);

    if (d1 > EDGE_ALIGN_METERS || d2 > EDGE_ALIGN_METERS) continue;

    const t1 = ((px1 - ax) * edgeDirX + (py1 - ay) * edgeDirY) / edgeLen;
    const t2 = ((px2 - ax) * edgeDirX + (py2 - ay) * edgeDirY) / edgeLen;

    if (t1 < -0.05 || t1 > 1.05) continue;
    if (t2 < -0.05 || t2 > 1.05) continue;

    const score = d1 + d2;
    if (score < bestScore) {
      bestScore = score;
      best = { ax, ay, bx, by, edgeLen, edgeDirX, edgeDirY };
    }
  }

  return best;
}

function alignSegmentsToEdges(ring, existingEdges, origin) {
  if (!Array.isArray(ring) || ring.length < 2) return ring;

  const result = ring.map((v) => [v[0], v[1]]);
  const n = result.length;

  for (let i = 0; i < n - 1; i++) {
    const P1 = result[i];
    const P2 = result[i + 1];

    const snap = findSnappableEdge(P1, P2, existingEdges, origin);
    if (!snap) continue;

    const projectOntoLine = (lng, lat) => {
      const [px, py] = lngLatToMeters(lng, lat, origin.lng, origin.lat);
      const t = (px - snap.ax) * snap.edgeDirX + (py - snap.ay) * snap.edgeDirY;
      const projX = snap.ax + t * snap.edgeDirX;
      const projY = snap.ay + t * snap.edgeDirY;
      return metersToLngLat(projX, projY, origin.lng, origin.lat);
    };

    result[i] = projectOntoLine(P1[0], P1[1]);
    result[i + 1] = projectOntoLine(P2[0], P2[1]);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════
// فاز ۲: Vertex Merge
// ═══════════════════════════════════════════════════════════

function mergeCloseVertices(ring, existingVertices, origin) {
  if (!Array.isArray(ring) || ring.length < 2) return ring;

  const ox = origin.lng;
  const oy = origin.lat;
  const thresholdSq = VERTEX_MERGE_METERS * VERTEX_MERGE_METERS;

  const merged = [];
  for (let i = 0; i < ring.length; i++) {
    const [lng, lat] = ring[i];
    let isDuplicate = false;

    for (let j = 0; j < merged.length; j++) {
      const [mLng, mLat] = merged[j];
      const [x1, y1] = lngLatToMeters(lng, lat, ox, oy);
      const [x2, y2] = lngLatToMeters(mLng, mLat, ox, oy);
      if ((x1 - x2) ** 2 + (y1 - y2) ** 2 < thresholdSq) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) merged.push([lng, lat]);
  }

  if (merged.length < 3) return ring;

  const final = merged.map(([lng, lat]) => {
    let bestDist = VERTEX_MERGE_METERS;
    let bestVert = null;

    for (const v of existingVertices) {
      const [x1, y1] = lngLatToMeters(lng, lat, ox, oy);
      const [x2, y2] = lngLatToMeters(v.lng, v.lat, ox, oy);
      const d = Math.hypot(x1 - x2, y1 - y2);
      if (d < bestDist) {
        bestDist = d;
        bestVert = v;
      }
    }

    return bestVert ? [bestVert.lng, bestVert.lat] : [lng, lat];
  });

  return final;
}

// ═══════════════════════════════════════════════════════════
// فاز ۳: Push Out
// ═══════════════════════════════════════════════════════════

function pushOutInsideVertices(ring, existingEdges, existingPolygons, origin) {
  if (!Array.isArray(ring) || ring.length < 3) return ring;

  return ring.map(([lng, lat]) => {
    const pt = turfPoint([lng, lat]);

    let isInside = false;
    for (const { polygon } of existingPolygons) {
      try {
        if (booleanPointInPolygon(pt, polygon)) {
          isInside = true;
          break;
        }
      } catch { /* ignore */ }
    }

    if (!isInside) return [lng, lat];

    const [px, py] = lngLatToMeters(lng, lat, origin.lng, origin.lat);

    let bestX = px;
    let bestY = py;
    let bestDistSq = Infinity;

    for (const edge of existingEdges) {
      const [ax, ay] = lngLatToMeters(edge.a[1], edge.a[0], origin.lng, origin.lat);
      const [bx, by] = lngLatToMeters(edge.b[1], edge.b[0], origin.lng, origin.lat);

      const { x, y } = closestPointOnSegment(px, py, ax, ay, bx, by);
      const d2 = (x - px) ** 2 + (y - py) ** 2;

      if (d2 < bestDistSq) {
        bestDistSq = d2;
        bestX = x;
        bestY = y;
      }
    }

    const dx = px - bestX;
    const dy = py - bestY;
    const mag = Math.hypot(dx, dy);
    let outX = bestX;
    let outY = bestY;

    if (mag > 1e-6) {
      outX = bestX - (dx / mag) * PUSH_OUT_METERS;
      outY = bestY - (dy / mag) * PUSH_OUT_METERS;
    } else {
      outX = bestX + PUSH_OUT_METERS;
    }

    return metersToLngLat(outX, outY, origin.lng, origin.lat);
  });
}

// ═══════════════════════════════════════════════════════════
// Origin computation
// ═══════════════════════════════════════════════════════════

function computeOrigin(geojson) {
  let sumLat = 0;
  let sumLng = 0;
  let count = 0;

  const walk = (coords) => {
    if (!Array.isArray(coords)) return;
    if (
      coords.length >= 2 &&
      Number.isFinite(coords[0]) &&
      Number.isFinite(coords[1]) &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number"
    ) {
      sumLng += coords[0];
      sumLat += coords[1];
      count++;
      return;
    }
    for (const c of coords) walk(c);
  };

  if (geojson.type === "Polygon") walk(geojson.coordinates);
  else if (geojson.type === "MultiPolygon") walk(geojson.coordinates);

  return count > 0
    ? { lat: sumLat / count, lng: sumLng / count }
    : { lat: 0, lng: 0 };
}

// ═══════════════════════════════════════════════════════════
// تابع اصلی
// ═══════════════════════════════════════════════════════════

export function smartAlignPolygon(rawGeojson, savedFarms) {
  if (!rawGeojson) return rawGeojson;

  const { edges, polygons, vertices } = extractNeighborGeometry(savedFarms);
  if (edges.length === 0) return rawGeojson;

  const origin = computeOrigin(rawGeojson);

  const alignRing = (ring) => {
    let r = ring;
    r = alignSegmentsToEdges(r, edges, origin);
    r = mergeCloseVertices(r, vertices, origin);
    r = pushOutInsideVertices(r, edges, polygons, origin);
    return r;
  };

  if (rawGeojson.type === "Polygon") {
    return {
      ...rawGeojson,
      coordinates: rawGeojson.coordinates.map(alignRing),
    };
  }

  if (rawGeojson.type === "MultiPolygon") {
    return {
      ...rawGeojson,
      coordinates: rawGeojson.coordinates.map((poly) => poly.map(alignRing)),
    };
  }

  return rawGeojson;
}

// ═══════════════════════════════════════════════════════════
// ✅ validateOverlap — نسخه‌ی اصلاح‌شده
//
// 🩹 تغییر اصلی: در catch، skip کن — نه مقدار بزرگ
// ═══════════════════════════════════════════════════════════

export function validateOverlap(newGeojson, savedFarms) {
  if (!newGeojson || !Array.isArray(savedFarms) || savedFarms.length === 0) {
    return { valid: true };
  }

  const newFeature = {
    type: "Feature",
    properties: {},
    geometry: newGeojson,
  };

  const { polygons } = extractNeighborGeometry(savedFarms);

  let failed = 0;

  for (const { polygon, farm } of polygons) {
    // ── booleanDisjoint ──
    let isDisjoint = true;
    try {
      isDisjoint = booleanDisjoint(newFeature, polygon);
    } catch (err) {
      console.warn(
        `[Overlap] booleanDisjoint failed for farm ${farm?.farm_id}:`,
        err.message,
      );
      failed++;
      continue;
    }

    if (isDisjoint) continue;

    // ── intersect ──
    let overlapM2 = 0;
    try {
      const inter = intersect(newFeature, polygon);
      if (!inter) continue;
      overlapM2 = area(inter);
    } catch (err) {
      // 🩹 skip، نه مقدار بزرگ
      console.warn(
        `[Overlap] intersect failed for farm ${farm?.farm_id}:`,
        err.message,
      );
      failed++;
      continue;
    }

    // ── آستانه‌ها ──
    if (!Number.isFinite(overlapM2) || overlapM2 < OVERLAP_TOLERANT_M2) {
      continue;
    }

    if (overlapM2 < OVERLAP_BLOCK_M2) {
      console.warn(
        `[Overlap] small overlap with ${farm?.farm_id}: ${overlapM2.toFixed(2)} m²`,
      );
      continue;
    }

    // ── مسدودسازی ──
    return {
      valid: false,
      reason: "overlap",
      conflictingFarm: farm,
      overlapArea: overlapM2,
    };
  }

  if (failed > 0) {
    console.info(
      `[Overlap] ${failed} polygon(s) skipped due to turf errors`,
    );
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════
// preparePolygonForSave — بدون تغییر
// ═══════════════════════════════════════════════════════════

export function preparePolygonForSave(rawGeojson, savedFarms) {
  if (!rawGeojson) {
    return { valid: false, message: "پلیگونی برای ذخیره وجود ندارد" };
  }

  const alignedGeojson = smartAlignPolygon(rawGeojson, savedFarms);
  const validation = validateOverlap(alignedGeojson, savedFarms);

  if (!validation.valid) {
    const farmLabel =
      validation.conflictingFarm?.farm_id ||
      validation.conflictingFarm?.farmer_name ||
      "ثبت‌شده";

    return {
      valid: false,
      message: `این مزرعه با مزرعه‌ی «${farmLabel}» به مقدار ${validation.overlapArea.toFixed(1)} متر مربع همپوشانی دارد. لطفاً مرز را اصلاح کنید.`,
      conflictingFarm: validation.conflictingFarm,
      overlapArea: validation.overlapArea,
    };
  }

  return {
    valid: true,
    geojson: alignedGeojson,
  };
}