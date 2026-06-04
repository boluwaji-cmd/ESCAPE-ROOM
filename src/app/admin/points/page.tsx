"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const SUPABASE_URL = "https://onenmczbncokymqishxh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sZ9G9E-p_dnYn8RYuIVGsA_6FfToqJR";

const AdminMap = dynamic(() => import("@/components/AdminMap"), { ssr: false });

interface Poi {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  activation_radius_meters: number;
  description: string;
}

// Zone coordinates for map centering
const ZONE_COORDS: Record<string, [number, number]> = {
  "Perugia Centro": [43.1122, 12.3888],
  "Assisi": [43.0707, 12.6196],
  "Orvieto": [42.7185, 12.1087],
  "Gubbio": [43.3522, 12.5766],
  "Spoleto": [42.7407, 12.7383],
  "Spello": [42.9908, 12.6715],
};

export default function AdminPointsPage() {
  const [form, setForm] = useState({ name: "", zone: "", radius: 40, description: "" });
  const [mounted, setMounted] = useState(false);
  const [pois, setPois] = useState<Poi[]>([]);
  const [message, setMessage] = useState("");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    // Load POIs on mount
    supabase.from("points_of_interest").select("*").order("name").then(({ data }) => {
      if (data) setPois(data as Poi[]);
    });
  }, []);

  const refreshPois = () => {
    supabase.from("points_of_interest").select("*").order("name").then(({ data }) => {
      if (data) setPois(data as Poi[]);
    });
  };

  // Compute map center based on selected zone
  const mapCenter = useMemo((): [number, number] => {
    if (form.zone && ZONE_COORDS[form.zone]) return ZONE_COORDS[form.zone];
    return [43.1122, 12.3888]; // default: Perugia
  }, [form.zone]);

  const mapZoom = form.zone ? 14 : 15;

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (!form.name || !form.zone) {
      setMessage("Compila Nome e Zona prima di cliccare sulla mappa.");
      return;
    }
    setMessage("Salvataggio in corso...");
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-create-poi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        name: form.name, zone: form.zone, latitude: lat, longitude: lng,
        radius: form.radius, description: form.description,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setMessage("Errore: " + (data.message || "Errore sconosciuto"));
    } else {
      setMessage("POI salvato con successo!");
      setForm(prev => ({ ...prev, name: "", description: "" }));
      refreshPois();
    }
  }, [form]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow-2xl z-10 flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black p-6">
          <p className="text-amber-900 text-sm font-medium">Pannello Operatore</p>
          <h1 className="text-2xl font-bold">Gestione POI</h1>
          <p className="text-amber-900 text-sm mt-1">Crea e gestisci i punti di interesse</p>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Feedback message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              message.includes("Errore") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}>
              {message}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Nome del luogo</label>
            <input className="input input-bordered w-full mt-1 focus:border-amber-500" placeholder="Es. Fontana Maggiore" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Zona</label>
            <select className="select select-bordered w-full mt-1 focus:border-amber-500" value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}>
              <option value="">Seleziona zona...</option>
              <option value="Perugia Centro">Perugia Centro</option>
              <option value="Assisi">Assisi</option>
              <option value="Orvieto">Orvieto</option>
              <option value="Gubbio">Gubbio</option>
              <option value="Spoleto">Spoleto</option>
              <option value="Spello">Spello</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Raggio attivazione (metri)</label>
            <input className="input input-bordered w-full mt-1 focus:border-amber-500" type="number" min={20} max={100} value={form.radius} onChange={e => setForm({...form, radius: +e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Descrizione</label>
            <textarea className="textarea textarea-bordered w-full mt-1 h-24 focus:border-amber-500" placeholder="Breve descrizione del luogo..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Come fare</p>
            <p>1. Compila i campi qui sopra</p>
            <p>2. Clicca su un punto della mappa</p>
            <p>3. Il POI verra salvato automaticamente</p>
          </div>

          {/* Existing POIs list */}
          {pois.length > 0 && (
            <div className="border-t pt-4 mt-2">
              <h3 className="font-bold text-gray-700 mb-2">POI esistenti ({pois.length})</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {pois.map(poi => (
                  <div key={poi.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="font-medium truncate">{poi.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{poi.zone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {mounted && <AdminMap pois={pois} onMapClick={handleMapClick} center={mapCenter} zoom={mapZoom} />}
      </div>
    </div>
  );
}
