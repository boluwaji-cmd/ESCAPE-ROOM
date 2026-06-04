"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/lib/gameStore";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });

interface Poi {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  activation_radius_meters: number;
  description: string;
}

export default function MapPage() {
  const { gameId } = useGameStore();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydration guard — must run only on client (Leaflet needs window)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    import("leaflet").then(L => {
      const icon = L.icon({
        iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'%3E%3Cpath fill='%233498db' stroke='%231a5276' stroke-width='1.5' d='M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z'/%3E%3Ccircle cx='12.5' cy='12.5' r='5' fill='white'/%3E%3C/svg%3E",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
      });
      L.Marker.prototype.options.icon = icon;
    });
  }, []);

  useEffect(() => {
    if (!gameId) return;
    // Load game POIs
    supabase.from("game_points")
      .select("point_of_interest_id")
      .eq("game_id", gameId)
      .then(async ({ data: gamePoints }) => {
        if (gamePoints && gamePoints.length > 0) {
          const ids = gamePoints.map(gp => gp.point_of_interest_id);
          const { data } = await supabase.from("points_of_interest")
            .select("*").in("id", ids);
          if (data) setPois(data as Poi[]);
        }
      });
  }, [gameId]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => console.warn("GPS non disponibile"),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const defaultCenter: [number, number] = [43.1122, 12.3888];

  return (
    <div className="h-screen w-full">
      {mounted && (
        <MapContainer center={position || defaultCenter} zoom={15} className="h-full w-full" zoomControl={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Player position marker */}
          {position && (
            <Marker position={position}>
              <Popup>La tua posizione</Popup>
            </Marker>
          )}
          {/* POI markers */}
          {pois.map(poi => (
            <Marker key={poi.id} position={[poi.latitude, poi.longitude]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{poi.name}</p>
                  <p className="text-gray-500 text-xs">{poi.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          {/* Activation radius circles */}
          {pois.map(poi => (
            <Circle
              key={`circle-${poi.id}`}
              center={[poi.latitude, poi.longitude]}
              radius={poi.activation_radius_meters}
              pathOptions={{ color: "#3498db", fillOpacity: 0.1, weight: 1 }}
            />
          ))}
        </MapContainer>
      )}
    </div>
  );
}
