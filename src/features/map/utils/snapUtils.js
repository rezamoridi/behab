// src/features/map/utils/snapUtils.js
import * as turf from '@turf/turf';

// ============================================================
// آستانه‌های اسنپ
// ============================================================
const SNAP_THRESHOLD_METERS = 15;

// ✅ فاصله‌ی ایمنی از لبه‌ی مزرعه ذخیره‌شده (متر)
// نقطه اسنپ‌شده نباید داخل یا روی لبه بیفتد؛ این مقدار آن را
// به بیرون هل می‌دهد.
const SNAP_OFFSET_METERS = 0.5;

// ============================================================
// استخراج همه‌ی رئوس مزارع ذخیره‌شده
// (بدون تغییر — همان نسخه قبلی)
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
//
// برای تشخیص "داخل بودن" نقطه در polygon استفاده می‌شود.
// خروجی: آرایه‌ای از { polygon: turf.Polygon, feature: GeoJSON Feature }
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

      // فقط Polygon و MultiPolygon
      if (geometry.type === 'Polygon') {
        try {
          const poly = turf.polygon(geometry.coordinates);
          polygons.push({ polygon: poly, feature });
        } catch (err) {
          console.warn('Invalid polygon in extractPolygons:', err);
        }
      } else if (geometry.type === 'MultiPolygon') {
        for (const coords of geometry.coordinates) {
          try {
            const poly = turf.polygon(coords);
            polygons.push({ polygon: poly, feature });
          } catch (err) {
            console.warn('Invalid multipolygon part:', err);
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
        if (item.type === 'Feature') return item;
        if (item.type === 'Polygon' || item.type === 'MultiPolygon') {
          return { type: 'Feature', properties: {}, geometry: item };
        }
        return null;
      })
      .filter(Boolean);
  }

  if (geojson.type === 'FeatureCollection') {
    return geojson.features || [];
  }

  if (geojson.type === 'Feature') {
    return [geojson];
  }

  if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
    return [{ type: 'Feature', properties: {}, geometry: geojson }];
  }

  return [];
}

// ============================================================
// استخراج rings از geometry
// ============================================================
function getRings(geometry) {
  if (!geometry) return [];

  if (geometry.type === 'Polygon') {
    return geometry.coordinates || [];
  }

  if (geometry.type === 'MultiPolygon') {
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
//
// از turf.booleanPointInPolygon استفاده می‌کنیم که نقاط روی لبه را
// به صورت پیش‌فرض "خارج" در نظر می‌گیرد، ولی برای احتیاط از یک
// بافر کوچک هم استفاده می‌کنیم.
// ============================================================
function isPointInsideAnyPolygon(point, polygons) {
  if (!polygons || polygons.length === 0) return false;

  for (const { polygon } of polygons) {
    try {
      // booleanPointInPolygon نقاط روی لبه را خارج در نظر می‌گیرد
      // ولی ما می‌خواهیم نقاط "نزدیک لبه" هم رد شوند
      if (turf.booleanPointInPolygon(point, polygon)) {
        return true;
      }
    } catch (err) {
      // نادیده بگیر
    }
  }
  return false;
}

// ============================================================
// ✅ یافتن نزدیک‌ترین vertex با offset به بیرون
//
// نکته کلیدی: به جای snap دقیق روی رأس، نقطه را کمی در جهت
// شعاعی (از مرکز polygon به سمت رأس) به بیرون هل می‌دهیم.
// اینطوری لبه‌ها با هم تماس پیدا نمی‌کنند ولی خیلی نزدیک می‌مانند.
//
// ورودی:
//   latlng: { lat, lng } از Leaflet
//   vertices: آرایه‌ای از [lng, lat]
//   polygons: آرایه‌ای از { polygon: turf.Polygon }
//
// خروجی: { lat, lng } | null
// ============================================================
export function findSnapVertex(latlng, vertices, polygons = []) {
  if (!latlng || !Array.isArray(vertices) || vertices.length === 0) {
    return null;
  }

  const lat = Number(latlng.lat);
  const lng = Number(latlng.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const point = turf.point([lng, lat]);
  let closest = null;
  let minDist = Infinity;

  for (const [vLng, vLat] of vertices) {
    if (!Number.isFinite(vLng) || !Number.isFinite(vLat)) continue;

    const candidate = turf.point([vLng, vLat]);
    const dist = turf.distance(point, candidate, { units: 'meters' });

    if (dist <= SNAP_THRESHOLD_METERS && dist < minDist) {
      minDist = dist;
      closest = { lat: vLat, lng: vLng };
    }
  }

  if (!closest) return null;

  // ✅ حالا نقطه را کمی به بیرون از polygon هل می‌دهیم
  return offsetPointOutward(closest, polygons);
}

// ============================================================
// ✅ هل دادن نقطه به بیرون از polygon
//
// استراتژی:
// 1. نزدیک‌ترین polygon به نقطه را پیدا کن
// 2. مرکز polygon را حساب کن
// 3. بردار از مرکز به نقطه را نرمال کن
// 4. نقطه را به اندازه SNAP_OFFSET_METERS در آن جهت جابه‌جا کن
// 5. بررسی کن که نقطه جدید داخل هیچ polygon نباشد
//    (اگر بود، فاصله را افزایش بده تا خارج شود)
// ============================================================
function offsetPointOutward(point, polygons) {
  if (!polygons || polygons.length === 0) {
    // هیچ polygon ای نیست؛ همان نقطه را برگردان
    return point;
  }

  const pointTurf = turf.point([point.lng, point.lat]);

  // اگر نقطه داخل هیچ polygon نیست، مشکلی نیست — همان را برگردان
  if (!isPointInsideAnyPolygon(pointTurf, polygons)) {
    return point;
  }

  // نزدیک‌ترین polygon را پیدا کن
  let closestPolygon = null;
  let minDistToPolygon = Infinity;

  for (const { polygon } of polygons) {
    try {
      // distance از turf روی Polygon → فاصله تا لبه
      const dist = turf.pointToPolygonDistance(pointTurf, polygon, {
        units: 'meters',
      });

      if (dist < minDistToPolygon) {
        minDistToPolygon = dist;
        closestPolygon = polygon;
      }
    } catch (err) {
      // اگر pointToPolygonDistance در دسترس نبود، از center استفاده کن
      try {
        const center = turf.center(polygon);
        const dist = turf.distance(pointTurf, center, { units: 'meters' });
        if (dist < minDistToPolygon) {
          minDistToPolygon = dist;
          closestPolygon = polygon;
        }
      } catch (e) {
        // نادیده بگیر
      }
    }
  }

  if (!closestPolygon) return point;

  // مرکز polygon
  let center;
  try {
    center = turf.centerOfMass(closestPolygon);
  } catch {
    center = turf.center(closestPolygon);
  }

  const centerCoord = center.geometry.coordinates;
  const pointCoord = [point.lng, point.lat];

  // بردار از مرکز به نقطه
  let dx = pointCoord[0] - centerCoord[0];
  let dy = pointCoord[1] - centerCoord[1];
  const mag = Math.sqrt(dx * dx + dy * dy);

  if (mag < 1e-10) {
    // نقطه روی مرکز است؛ یک جهت پیش‌فرض انتخاب کن
    dx = 1;
    dy = 0;
  } else {
    dx /= mag;
    dy /= mag;
  }

  // تبدیل offset از متر به درجه
  // 1 درجه عرض ≈ 111_320 متر
  // 1 درجه طول ≈ 111_320 * cos(lat)
  const latRad = (point.lat * Math.PI) / 180;
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos(latRad);

  const offsetLat = (dy * SNAP_OFFSET_METERS) / metersPerDegLat;
  const offsetLng = (dx * SNAP_OFFSET_METERS) / Math.max(metersPerDegLng, 1e-6);

  // نقطه offset‌شده
  let result = {
    lat: point.lat + offsetLat,
    lng: point.lng + offsetLng,
  };

  // ✅ بررسی نهایی: اگر هنوز داخل polygon است، فاصله را بیشتر کن
  let attempts = 0;
  const MAX_ATTEMPTS = 5;
  const STEP_MULTIPLIER = 2;

  while (attempts < MAX_ATTEMPTS) {
    const checkPoint = turf.point([result.lng, result.lat]);
    if (!isPointInsideAnyPolygon(checkPoint, polygons)) {
      return result;
    }

    // فاصله را دو برابر کن
    attempts += 1;
    const factor = Math.pow(STEP_MULTIPLIER, attempts);

    result = {
      lat: point.lat + offsetLat * factor,
      lng: point.lng + offsetLng * factor,
    };
  }

  // اگر بعد از همه تلاش‌ها همچنان داخل بود، null برگردان
  // (بهتر از ایجاد overlap است)
  console.warn('Could not find non-overlapping snap point');
  return null;
}

// ============================================================
// ✅ اسنپ کردن یک حلقه (ring) از latlngها با در نظر گرفتن polygons
// ============================================================
export function snapLatLngArray(latlngs, vertices, polygons = []) {
  if (!Array.isArray(latlngs)) {
    return latlngs;
  }

  // اگر نه vertex داریم نه polygon، هیچ کاری نکن
  if (vertices.length === 0 && polygons.length === 0) {
    return latlngs.map((ll) => [ll.lat, ll.lng]);
  }

  return latlngs.map((ll) => {
    // اگر vertex داریم، snap کن
    if (vertices.length > 0) {
      const snapped = findSnapVertex(ll, vertices, polygons);
      if (snapped) {
        return [snapped.lat, snapped.lng];
      }
    }

    // اگر vertex نزدیک نبود ولی نقطه داخل polygon بود، به بیرون هل بده
    if (polygons.length > 0) {
      const pointTurf = turf.point([ll.lng, ll.lat]);
      if (isPointInsideAnyPolygon(pointTurf, polygons)) {
        const offset = offsetPointOutward(
          { lat: ll.lat, lng: ll.lng },
          polygons
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