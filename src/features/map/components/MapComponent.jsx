// src/features/map/components/MapComponent.jsx
import React, { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, ScaleControl } from 'react-leaflet';
import SearchLocationController from './SearchLocationController';
import MapController from './MapController';
import SavedFarmsLayer from './SavedFarmsLayer';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const MapComponent = ({
  selectedLocation,
  onPolygonsUpdate,
  savedFarms = [],
  clearTrigger = null,
  onFarmClick,
  onFarmEdit,
  onFarmEditGeometry,
  selectedFarmId = null,
  editGeometryTrigger = null,
  geometriesToEdit = null,
}) => {
  const mapCenter = useMemo(() => [35.6892, 51.389], []);
  const mapStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const handlePolygonsUpdate = useCallback(
    (data) => {
      onPolygonsUpdate?.(data);
    },
    [onPolygonsUpdate]
  );

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={mapStyle}
      zoomControl={true}
      attributionControl={true}
      className="leaflet-container"
    >
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        maxZoom={22}
        attribution="&copy; Google Maps"
      />

      <ScaleControl position="bottomleft" imperial={false} metric={true} />

      <SearchLocationController selectedLocation={selectedLocation} />
      <MapController
        onPolygonsUpdate={handlePolygonsUpdate}
        savedFarms={savedFarms}
        clearTrigger={clearTrigger}
        editGeometryTrigger={editGeometryTrigger}
        geometriesToEdit={geometriesToEdit}
      />
      <SavedFarmsLayer
        farms={savedFarms}
        onFarmClick={onFarmClick}
        onFarmEdit={onFarmEdit}
        onFarmEditGeometry={onFarmEditGeometry}
        selectedFarmId={selectedFarmId}
      />
    </MapContainer>
  );
};

export default React.memo(MapComponent);