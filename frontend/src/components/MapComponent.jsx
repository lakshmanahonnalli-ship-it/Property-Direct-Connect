import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon URL issue in React/Vite bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks for coordinate selection
const LocationMarkerPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      if (setPosition) {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]}>
      <Popup>Selected Property Location</Popup>
    </Marker>
  ) : null;
};

const MapComponent = ({
  center = { lat: 12.9716, lng: 77.5946 }, // Default Bengaluru
  zoom = 13,
  interactive = false,
  onPositionChange,
  title = 'Property Location',
}) => {
  const position = [center.lat || 12.9716, center.lng || 77.5946];

  return (
    <div className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {interactive ? (
          <LocationMarkerPicker position={center} setPosition={onPositionChange} />
        ) : (
          <Marker position={position}>
            <Popup>{title}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
