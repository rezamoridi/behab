// src/features/map/components/MapController.jsx
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMapDrawing } from '../hooks/useMapDrawing';

const MapController = ({
  onPolygonsUpdate,
  savedFarms = [],
  clearTrigger = null,
  editGeometryTrigger = null,
  geometriesToEdit = null,
}) => {
  const map = useMap();
  const {
    drawnItems,
    handleCreated,
    handleDeleted,
    handleEdited,
    clearPolygons,
    loadGeometriesForEdit,
  } = useMapDrawing(onPolygonsUpdate);

  // Setup Draw controls
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

    map.on(L.Draw.Event.DRAWSTART, () => {
      map.getContainer().style.cursor = 'crosshair';
    });

    map.on(L.Draw.Event.DRAWSTOP, () => {
      map.getContainer().style.cursor = '';
    });

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);
    map.on(L.Draw.Event.EDITED, handleEdited);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DRAWSTART);
      map.off(L.Draw.Event.DRAWSTOP);
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

  // ✅ Edit geometry trigger
  useEffect(() => {
    if (
      editGeometryTrigger !== null &&
      editGeometryTrigger !== undefined &&
      geometriesToEdit
    ) {
      const timeoutId = setTimeout(() => {
        loadGeometriesForEdit(geometriesToEdit);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [editGeometryTrigger, geometriesToEdit, loadGeometriesForEdit]);

  return null;
};

export default React.memo(MapController);