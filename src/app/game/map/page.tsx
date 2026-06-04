"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/lib/gameStore";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });

export default function MapPage() {
  const { gameId } = useGameStore();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [_points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    if (!gameId) return;
    supabase.from("game_points").select("id, point_of_interest_id").eq("game_id", gameId).then(({ data }) => { if (data) setPoints(data); });
  }, [gameId]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => console.warn("GPS non disponibile"),
      { maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  return (
    <div className="h-screen w-full">
      {typeof window !== "undefined" && (
        <MapContainer center={position || [43.1122, 12.3888]} zoom={15} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {position && <Marker position={position} />}
        </MapContainer>
      )}
    </div>
  );
}
