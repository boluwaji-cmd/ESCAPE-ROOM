"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });

export default function AdminPointsPage() {
  const [form, setForm] = useState({ name: "", zone: "", radius: 40, description: "" });

  const handleMapClick = async (lat: number, lng: number) => {
    const { error } = await supabase.from("points_of_interest").insert({
      name: form.name, zone: form.zone, latitude: lat, longitude: lng,
      activation_radius_meters: form.radius, description: form.description,
    });
    if (!error) alert("POI salvato!");
  };

  return (
    <div className="flex h-screen">
      <div className="w-96 p-4 bg-white shadow-lg overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Crea POI</h1>
        <input className="input input-bordered w-full mb-2" placeholder="Nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input className="input input-bordered w-full mb-2" placeholder="Zona" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} />
        <input className="input input-bordered w-full mb-2" type="number" placeholder="Raggio (m)" value={form.radius} onChange={e => setForm({...form, radius: +e.target.value})} />
        <textarea className="textarea textarea-bordered w-full mb-2" placeholder="Descrizione" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <p className="text-sm text-gray-500">Clicca sulla mappa per posizionare il POI</p>
      </div>
      <div className="flex-1">
        {typeof window !== "undefined" && (
          <MapContainer center={[43.1122, 12.3888]} zoom={15} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
