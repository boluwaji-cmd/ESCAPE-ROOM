"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon (AdminMap is only loaded client-side via dynamic import)
L.Marker.prototype.options.icon = L.icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'%3E%3Cpath fill='%23e67e22' stroke='%23844c10' stroke-width='1.5' d='M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z'/%3E%3Ccircle cx='12.5' cy='12.5' r='5' fill='white'/%3E%3C/svg%3E",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

export interface PoiData {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  activation_radius_meters: number;
  description: string;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: { latlng: { lat: number; lng: number } }) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Pans the map when center/zoom props change
function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.5 });
  }, [map, lat, lng, zoom]);
  return null;
}

export default function AdminMap({
  pois,
  onMapClick,
  center,
  zoom = 15,
}: {
  pois: PoiData[];
  onMapClick: (lat: number, lng: number) => void;
  center: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterUpdater center={center} zoom={zoom} />
      <MapClickHandler onClick={onMapClick} />
      {pois.map((poi) => (
        <Marker key={poi.id} position={[poi.latitude, poi.longitude]}>
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="font-bold text-base">{poi.name}</p>
              <p className="text-gray-500 text-xs">{poi.zone}</p>
              {poi.description && <p className="mt-1 text-gray-600">{poi.description}</p>}
              <p className="mt-1 text-xs text-gray-400">Raggio: {poi.activation_radius_meters}m</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
