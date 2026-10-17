// src/features/map/components/MapController.jsx
import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useMapDrawing } from "../hooks/useMapDrawing";
import { findSnapTarget } from "../utils/snapUtils";

// ═══════════════════════════════════════════════════════════
// CSS inline برای vertex indicator (بدون edge)
// ═══════════════════════════════════════════════════════════
const INDICATOR_STYLES = `
  .snap-vertex-indicator {
    pointer-events: none !important;
    animation: snap-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes snap-pop {
    0%   { transform: scale(0.4); opacity: 0; }
    70%  { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .snap-vertex-indicator {
      animation: none !important;
    }
  }
`;

let styleInjected = false;
const injectIndicatorStyles = () => {
  if (styleInjected) return;
  if (typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-snap-indicator-styles", "true");
  style.textContent = INDICATOR_STYLES;
  document.head.appendChild(style);
  styleInjected = true;
};

// ═══════════════════════════════════════════════════════════
// MapController
// ═══════════════════════════════════════════════════════════
const MapController = ({
  onPolygonsUpdate,
  savedFarms = [],
  clearTrigger = null,
  editGeometryTrigger = null,
  geometriesToEdit = null,
  editGeometryOptions = null,
  snapEnabled = false,
  onDrawnItemsReady,
  onDrawingApiReady,
}) => {
  const map = useMap();

  const {
    drawnItems,
    handleCreated,
    handleDeleted,
    handleEdited,
    clearPolygons,
    loadGeometriesForEdit,
    getDrawnGeojson,
    getToleranceMeters,
    getSavedIndexForValidation,
    getDrawnIndex,
  } = useMapDrawing(onPolygonsUpdate, snapEnabled, savedFarms);

  // refs برای جلوگیری از stale closure
  const snapEnabledRef = useRef(snapEnabled);
  const getToleranceMetersRef = useRef(getToleranceMeters);
  const getSavedIndexRef = useRef(getSavedIndexForValidation);
  const getDrawnIndexRef = useRef(getDrawnIndex);

  useEffect(() => {
    snapEnabledRef.current = snapEnabled;
  }, [snapEnabled]);
  useEffect(() => {
    getToleranceMetersRef.current = getToleranceMeters;
  }, [getToleranceMeters]);
  useEffect(() => {
    getSavedIndexRef.current = getSavedIndexForValidation;
  }, [getSavedIndexForValidation]);
  useEffect(() => {
    getDrawnIndexRef.current = getDrawnIndex;
  }, [getDrawnIndex]);

  // ═══════════════════════════════════════════════════════════
  // Setup Draw controls + Snap indicator (فقط vertex)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    injectIndicatorStyles();

    map.addLayer(drawnItems.current);

    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: {
          shapeOptions: {
            color: "#4CAF50", weight: 3,
            fillColor: "#4CAF50", fillOpacity: 0.25,
          },
        },
        polygon: {
          shapeOptions: {
            color: "#4CAF50", weight: 3,
            fillColor: "#4CAF50", fillOpacity: 0.25,
          },
          allowIntersection: false,
          showArea: false,
          showLength: false,
        },
      },
      edit: { featureGroup: drawnItems.current, remove: true },
    });

    map.addControl(drawControl);

    // ═══════════════════════════════════════════════════════════
    // Snap indicator — فقط vertex (دایره نارنجی)
    // ═══════════════════════════════════════════════════════════
    let snapIndicator = null;
    let currentKey = null;

    const clearSnapIndicator = () => {
      if (snapIndicator) {
        try {
          snapIndicator.remove();
        } catch {
          /* ignore */
        }
        snapIndicator = null;
      }
      currentKey = null;
    };

    const createVertexIcon = () =>
      L.divIcon({
        className: "snap-vertex-indicator",
        html: `
          <div style="
            width: 18px; height: 18px;
            background: #FF6B35;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow:
              0 0 0 2px #FF6B35,
              0 0 12px rgba(255,107,53,0.9),
              0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

    // ═══════════════════════════════════════════════════════════
    // Mousemove handler
    // ═══════════════════════════════════════════════════════════
    const handleSnapMouseMove = (e) => {
      if (!snapEnabledRef.current) {
        clearSnapIndicator();
        return;
      }

      const sIdx = getSavedIndexRef.current?.();
      if (!sIdx?.hasAny()) {
        clearSnapIndicator();
        return;
      }

      const tolerance = getToleranceMetersRef.current?.() || 10;
      const hit = findSnapTarget(e.latlng, sIdx, tolerance);

      // ✅ فقط vertex — edge و inside نادیده گرفته می‌شوند
      if (!hit || hit.kind !== "vertex") {
        clearSnapIndicator();
        return;
      }

      // اگر روی همون vertex هستیم، فقط به‌روزرسانی نکن
      const newKey = `${hit.lat.toFixed(7)}:${hit.lng.toFixed(7)}`;
      if (currentKey === newKey && snapIndicator) {
        return;
      }

      // اگر از vertex قبلی رفتیم → موقعیت را عوض کن
      if (snapIndicator) {
        snapIndicator.setLatLng([hit.lat, hit.lng]);
      } else {
        snapIndicator = L.marker([hit.lat, hit.lng], {
          icon: createVertexIcon(),
          interactive: false,
          zIndexOffset: 1000,
          pane: "markerPane",
        }).addTo(map);
      }
      currentKey = newKey;
    };

    // ═══════════════════════════════════════════════════════════
    // Draw start/stop
    // ═══════════════════════════════════════════════════════════
    const handleDrawStart = () => {
      if (map.getContainer()) {
        map.getContainer().style.cursor = "crosshair";
      }
      map.on("mousemove", handleSnapMouseMove);
    };

    const handleDrawStop = () => {
      if (map.getContainer()) {
        map.getContainer().style.cursor = "";
      }
      map.off("mousemove", handleSnapMouseMove);
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
      map.off("mousemove", handleSnapMouseMove);
      clearSnapIndicator();
      map.removeControl(drawControl);
      map.removeLayer(drawnItems.current);
      if (map.getContainer()) {
        map.getContainer().style.cursor = "";
      }
    };
  }, [map, handleCreated, handleDeleted, handleEdited, drawnItems]);

  // ═══════════════════════════════════════════════════════════
  // پاس دادن API به بیرون
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (typeof onDrawnItemsReady === "function") {
      onDrawnItemsReady(drawnItems.current);
    }
    if (typeof onDrawingApiReady === "function") {
      onDrawingApiReady({
        getDrawnGeojson,
        clearPolygons,
        loadGeometriesForEdit,
        getPolygonCount: () =>
          drawnItems.current
            .getLayers()
            .filter((l) => l instanceof L.Polygon).length,
      });
    }
  }, [
    drawnItems,
    onDrawnItemsReady,
    onDrawingApiReady,
    getDrawnGeojson,
    clearPolygons,
    loadGeometriesForEdit,
  ]);

  // Clear trigger
  useEffect(() => {
    if (clearTrigger !== null && clearTrigger !== undefined) {
      const timeoutId = setTimeout(() => clearPolygons(), 10);
      return () => clearTimeout(timeoutId);
    }
  }, [clearTrigger, clearPolygons]);

  // Edit geometry trigger
  useEffect(() => {
    if (
      editGeometryTrigger !== null &&
      editGeometryTrigger !== undefined &&
      geometriesToEdit
    ) {
      const timeoutId = setTimeout(() => {
        loadGeometriesForEdit(
          geometriesToEdit,
          editGeometryOptions || undefined,
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