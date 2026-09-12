// src/features/farm-registration/utils/geometryUtils.js
import { calculateAreaInHectares } from '../../map/utils/areaCalculations';

/**
 * استخراج هندسه نهایی از geojson
 */
export const extractGeometry = (geojson) => {
  if (!geojson) return null;

  try {
    if (Array.isArray(geojson)) {
      if (geojson.length === 0) return null;
      const first = geojson[0];

      if (first?.type === 'FeatureCollection') {
        return featuresToGeometry(first.features || []);
      }
      if (first?.type === 'Feature') {
        return featuresToGeometry(geojson);
      }
      if (first?.type === 'Polygon') {
        if (geojson.length === 1) return geojson[0];
        return {
          type: 'MultiPolygon',
          coordinates: geojson.map((g) => g.coordinates),
        };
      }
      if (first?.type === 'MultiPolygon') {
        if (geojson.length === 1) return geojson[0];
        return {
          type: 'MultiPolygon',
          coordinates: geojson.flatMap((g) => g.coordinates),
        };
      }
      return first;
    }

    if (geojson.type === 'FeatureCollection') {
      return featuresToGeometry(geojson.features || []);
    }
    if (geojson.type === 'Feature') {
      return geojson.geometry;
    }
    if (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon') {
      return geojson;
    }

    return geojson;
  } catch (error) {
    console.error('Error extracting geometry:', error);
    return null;
  }
};

const featuresToGeometry = (features) => {
  if (!features || features.length === 0) return null;
  if (features.length === 1) return features[0].geometry;

  const allPolygons = features.every((f) => f.geometry?.type === 'Polygon');
  if (allPolygons) {
    return {
      type: 'MultiPolygon',
      coordinates: features.map((f) => f.geometry.coordinates),
    };
  }

  return features[0].geometry;
};

export const calculateTotalArea = (geojson) => {
  if (!geojson) return 0;

  try {
    if (Array.isArray(geojson)) {
      let total = 0;
      geojson.forEach((item) => {
        if (item?.properties?.areaHa) {
          total += Number(item.properties.areaHa);
        } else if (item?.geometry || item?.type === 'Polygon') {
          total += calculateAreaInHectares(item);
        }
      });
      return total;
    }

    if (geojson.properties?.areaHa) {
      return Number(geojson.properties.areaHa);
    }

    return calculateAreaInHectares(geojson);
  } catch (error) {
    console.error('Error calculating total area:', error);
    return 0;
  }
};

export const getPolygonArea = (poly) => {
  if (!poly) return 0;
  if (poly.properties?.areaHa) return Number(poly.properties.areaHa);
  if (poly.geometry) {
    try {
      return calculateAreaInHectares(poly);
    } catch {
      return 0;
    }
  }
  return 0;
};