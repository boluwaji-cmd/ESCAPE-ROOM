"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/lib/gameStore";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setTeam = useGameStore((s) => s.setTeam);

  const handleLogin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const { data: team } = await supabase.from("teams").select("id, game_id").eq("access_code", code.trim()).single();
    if (team) { setTeam(team.id, team.game_id); router.push("/game/map"); }
    else { setError("Codice squadra non valido"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559827291-baf8ef4d2782?w=1200')" }}>
      <div className="card bg-white/90 shadow-xl backdrop-blur-sm p-8 w-96">
        <h1 className="text-3xl font-bold text-center mb-6">Escape Room Perugia</h1>
        <input className="input input-bordered w-full mb-3" placeholder="Codice squadra" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button className="btn btn-primary w-full" onClick={handleLogin} disabled={loading}>{loading ? "Accesso..." : "Entra"}</button>
      </div>
    </div>
  );
}
