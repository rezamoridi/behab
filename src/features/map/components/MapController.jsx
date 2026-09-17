// src/features/map/components/MapController.jsx
import React, { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapDrawing } from '../hooks/useMapDrawing';
import {
  extractVertices,
  extractPolygons,
  findSnapVertex,
} from '../utils/snapUtils';

// ============================================================
// ✅ استخراج زنده‌ی رئوس از drawnItems
// ============================================================
const getLiveDrawnVertices = (drawnItems) => {
  const vertices = [];
  if (!drawnItems?.current) return vertices;

  try {
    const layers = drawnItems.current.getLayers();
    for (const layer of layers) {
      if (!(layer instanceof L.Polygon)) continue;

      const latlngs = layer.getLatLngs();
      const processRing = (ring) => {
        if (!Array.isArray(ring)) return;
        for (const ll of ring) {
          if (!ll) continue;
          if (typeof ll.lat === 'number' && typeof ll.lng === 'number') {
            vertices.push([ll.lng, ll.lat]);
          } else {
            processRing(ll);
          }
        }
      };
      processRing(latlngs);
    }
  } catch (err) {
    console.warn('getLiveDrawnVertices failed:', err);
  }

  return vertices;
};

const MapController = ({
  onPolygonsUpdate,
  savedFarms = [],
  clearTrigger = null,
  editGeometryTrigger = null,
  geometriesToEdit = null,
  editGeometryOptions = null,   // ✅ جدید
  snapEnabled = false,
}) => {
  const map = useMap();

  // ✅ رئوس و polygonهای مزارع ذخیره‌شده
  const snapVertices = useMemo(() => {
    if (!snapEnabled) return [];
    return extractVertices(savedFarms);
  }, [savedFarms, snapEnabled]);

  const snapPolygons = useMemo(() => {
    if (!snapEnabled) return [];
    return extractPolygons(savedFarms);
  }, [savedFarms, snapEnabled]);

  const {
    drawnItems,
    handleCreated,
    handleDeleted,
    handleEdited,
    clearPolygons,
    loadGeometriesForEdit,
  } = useMapDrawing(onPolygonsUpdate, snapEnabled, snapVertices, snapPolygons);

  const snapEnabledRef = useRef(snapEnabled);
  const snapVerticesRef = useRef(snapVertices);
  const snapPolygonsRef = useRef(snapPolygons);

  useEffect(() => {
    snapEnabledRef.current = snapEnabled;
    snapVerticesRef.current = snapVertices;
    snapPolygonsRef.current = snapPolygons;
  }, [snapEnabled, snapVertices, snapPolygons]);

  // ✅ Setup Draw controls + snap mousemove
  useEffect(() => {
    map.addLayer(drawnItems.current);

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: {
          shapeOptions: {
            color: '#4CAF50',
            weight: 3,
            fillColor: '#4CAF50',
            fillOpacity: 0.25,
          },
        },
        polygon: {
          shapeOptions: {
            color: '#4CAF50',
            weight: 3,
            fillColor: '#4CAF50',
            fillOpacity: 0.25,
          },
          allowIntersection: false,
          showArea: false,
          showLength: false,
        },
      },
      edit: {
        featureGroup: drawnItems.current,
        remove: true,
      },
    });

    map.addControl(drawControl);

    let snapIndicator = null;

    const clearSnapIndicator = () => {
      if (snapIndicator) {
        try {
          snapIndicator.remove();
        } catch {
          /* ignore */
        }
        snapIndicator = null;
      }
    };

    const handleSnapMouseMove = (e) => {
      if (!snapEnabledRef.current) {
        clearSnapIndicator();
        return;
      }

      const savedVerts = snapVerticesRef.current || [];
      const drawnVerts = getLiveDrawnVertices(drawnItems);
      const combinedVertices = [...savedVerts, ...drawnVerts];

      if (combinedVertices.length === 0) {
        clearSnapIndicator();
        return;
      }

      const snapped = findSnapVertex(
        e.latlng,
        combinedVertices,
        snapPolygonsRef.current
      );

      if (snapped) {
        if (!snapIndicator) {
          snapIndicator = L.circleMarker(snapped, {
            radius: 6,
            color: '#FF6B35',
            fillColor: '#FF6B35',
            fillOpacity: 0.85,
            weight: 2,
            interactive: false,
            pane: 'markerPane',
          }).addTo(map);
        } else {
          snapIndicator.setLatLng(snapped);
        }
      } else {
        clearSnapIndicator();
      }
    };

    const handleDrawStart = () => {
      map.getContainer().style.cursor = 'crosshair';
      map.on('mousemove', handleSnapMouseMove);
    };

    const handleDrawStop = () => {
      map.getContainer().style.cursor = '';
      map.off('mousemove', handleSnapMouseMove);
      clearSnapIndicator();
    };

    map.on(L.Draw.Event.DRAWSTART, handleDrawStart);
    map.on(L.Draw.Event.DRAWSTOP, handleDrawStop);

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);
    map.on(L.Draw.Event.EDITED, handleEdited);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DRAWSTART, handleDrawStart);
      map.off(L.Draw.Event.DRAWSTOP, handleDrawStop);
      map.off('mousemove', handleSnapMouseMove);
      clearSnapIndicator();
      map.removeControl(drawControl);
      map.removeLayer(drawnItems.current);
      map.getContainer().style.cursor = '';
    };
  }, [map, handleCreated, handleDeleted, handleEdited, drawnItems]);

  // Clear trigger
  useEffect(() => {
    if (clearTrigger !== null && clearTrigger !== undefined) {
      const timeoutId = setTimeout(() => {
        clearPolygons();
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [clearTrigger, clearPolygons]);

  // Edit geometry trigger — ✅ با options
  useEffect(() => {
    if (
      editGeometryTrigger !== null &&
      editGeometryTrigger !== undefined &&
      geometriesToEdit
    ) {
      const timeoutId = setTimeout(() => {
        loadGeometriesForEdit(
          geometriesToEdit,
          editGeometryOptions || undefined
        );
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [
    editGeometryTrigger,
    geometriesToEdit,
    editGeometryOptions,
    loadGeometriesForEdit,
  ]);

  return null;
};

export default React.memo(MapController);