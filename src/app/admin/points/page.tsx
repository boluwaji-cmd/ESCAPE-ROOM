"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

// Leaflet components dynamically imported with SSR disabled
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  const [useMapEventsHook, setUseMapEventsHook] = useState<any>(null);
  useState(() => {
    import("react-leaflet").then(m => setUseMapEventsHook(() => m.useMapEvents));
  });
  if (!useMapEventsHook) return null;
  // eslint-disable-next-line
  const InnerClickHandler = () => { useMapEventsHook()({ click(e: any) { onMapClick(e.latlng.lat, e.latlng.lng) } }); return null; };
  return <InnerClickHandler />;
}

export default function AdminPointsPage() {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    name: "",
    zone: "",
    radius: 40,
    description: "",
    accessibility_notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async () => {
    if (!point) return;
    setSaving(true);
    setSaveResult(null);
    const { error } = await supabase.from("points_of_interest").insert({
      name: form.name,
      zone: form.zone,
      latitude: point.lat,
      longitude: point.lng,
      activation_radius_meters: form.radius,
      description: form.description,
      accessibility_notes: form.accessibility_notes,
    });
    if (error) {
      setSaveResult({ ok: false, message: error.message });
    } else {
      setSaveResult({ ok: true, message: `Punto "${form.name}" salvato con successo!` });
      setPoint(null);
      setForm({ name: "", zone: "", radius: 40, description: "", accessibility_notes: "" });
    }
    setSaving(false);
  };

  return (
    <div className="flex h-screen">
      <div className="w-2/3 h-full relative">
        <MapContainer center={[43.1107, 12.3908]} zoom={16} className="h-full w-full" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={(lat, lng) => setPoint({ lat, lng })} />
          {point && <Marker position={[point.lat, point.lng]} />}
        </MapContainer>
      </div>
      <div className="w-1/3 p-6 bg-base-200 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Nuovo Punto di Interesse</h2>
        {point && (
          <div className="alert alert-info mb-4">
            Posizione: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
          </div>
        )}
        <div className="form-control mb-3">
          <label className="label">Nome</label>
          <input className="input input-bordered" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="form-control mb-3">
          <label className="label">Zona</label>
          <select className="select select-bordered" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
            <option value="">Seleziona...</option>
            <option>Fontana/Chiesa</option>
            <option>Parco</option>
            <option>Parco Bimbi</option>
            <option>Scale Mobili</option>
            <option>Negozi Particolari</option>
            <option>Comune/Ambasciata</option>
          </select>
        </div>
        <div className="form-control mb-3">
          <label className="label">Raggio (m)</label>
          <input type="number" className="input input-bordered" value={form.radius} onChange={e => setForm({...form, radius: +e.target.value})} />
        </div>
        <div className="form-control mb-3">
          <label className="label">Descrizione</label>
          <textarea className="textarea textarea-bordered" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className="form-control mb-3">
          <label className="label">Note accessibilità</label>
          <textarea className="textarea textarea-bordered" value={form.accessibility_notes} onChange={e => setForm({...form, accessibility_notes: e.target.value})} />
        </div>
        <button
          className="btn btn-primary w-full"
          onClick={handleSubmit}
          disabled={!point || saving}
        >
          {saving ? <span className="loading loading-spinner"></span> : "Salva Punto"}
        </button>
        {saveResult && (
          <div className={`alert mt-4 ${saveResult.ok ? "alert-success text-white" : "alert-error text-white"}`}>
            {saveResult.message}
          </div>
        )}
      </div>
    </div>
  );
}
