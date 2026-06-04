"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const STEPS = ["Dati Partita", "Seleziona POI", "Crea Squadre", "Riepilogo & Avvia"];

interface Team {
  name: string;
  color: string;
  difficulty: number;
}

export default function CreateGamePage() {
  const [step, setStep] = useState(0);
  const [gameName, setGameName] = useState("");
  const [theme, setTheme] = useState("perugia_italia");
  const [selectedPois, setSelectedPois] = useState<string[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState("#3B82F6");
  const [teamDifficulty, setTeamDifficulty] = useState(2);
  const [accessCodes, setAccessCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const availablePois = [
    { id: "poi-1", name: "Fontana Maggiore", zone: "Perugia Centro" },
    { id: "poi-2", name: "Cattedrale San Lorenzo", zone: "Perugia Centro" },
    { id: "poi-3", name: "Rocca Paolina", zone: "Perugia Centro" },
    { id: "poi-4", name: "Pozzo Etrusco", zone: "Perugia Centro" },
    { id: "poi-5", name: "Arco Etrusco", zone: "Perugia Centro" },
    { id: "poi-6", name: "Via dei Priori", zone: "Perugia Centro" },
    { id: "poi-7", name: "Porta Sole", zone: "Perugia Centro" },
  ];

  const togglePoi = (id: string) => {
    setSelectedPois(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const addTeam = () => {
    if (!teamName.trim()) return;
    setTeams([...teams, { name: teamName, color: teamColor, difficulty: teamDifficulty }]);
    setTeamName("");
  };

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const generateAccessCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const startGame = async () => {
    if (selectedPois.length < 3) { setMessage("Seleziona almeno 3 POI."); return; }
    if (teams.length < 2) { setMessage("Crea almeno 2 squadre."); return; }
    setLoading(true);
    setMessage("");

    try {
      const { data: game, error: gameErr } = await supabase.from("games").insert({
        name: gameName || "Partita " + new Date().toLocaleDateString("it-IT"),
        question_theme: theme,
        status: "lobby",
      }).select("id").single();
      if (gameErr) throw new Error("Errore creazione gioco: " + gameErr.message);

      const codes: string[] = [];
      for (const team of teams) {
        const code = generateAccessCode();
        codes.push(code);
        const { error: teamErr } = await supabase.from("teams").insert({
          game_id: game.id, name: team.name, color: team.color,
          difficulty: team.difficulty, access_code: code,
          total_penalty_seconds: 0, location_bonus: 0,
        });
        if (teamErr) throw new Error("Errore creazione squadra: " + teamErr.message);
      }

      for (let i = 0; i < selectedPois.length; i++) {
        const { error: poiErr } = await supabase.from("game_points").insert({
          game_id: game.id, point_of_interest_id: selectedPois[i], order_index: i + 1,
        });
        if (poiErr) throw new Error("Errore collegamento POI: " + poiErr.message);
      }

      const { error: startErr } = await supabase.functions.invoke("start-game", {
        body: { game_id: game.id },
      });
      if (startErr) throw new Error("Errore avvio partita: " + startErr.message);

      setAccessCodes(codes);
      setMessage("Partita avviata con successo!");
      setStep(4);
    } catch (err: any) {
      setMessage("Errore: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black py-8 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-900 text-sm font-medium mb-1">Pannello Operatore</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Crea Nuova Partita</h1>
          <p className="text-amber-900 mt-2 text-lg">Wizard guidato passo dopo passo</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <ul className="steps steps-horizontal w-full">
            {STEPS.map((s, i) => (
              <li key={s} className={`step text-sm ${i <= step ? "step-primary" : ""}`}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Dati della Partita</h2>
                  <p className="text-gray-500 mt-1">Scegli il nome e il tema delle domande</p>
                </div>
                <div className="form-control">
                  <label className="label font-semibold text-gray-700">Nome partita</label>
                  <input className="input input-bordered input-lg w-full focus:border-amber-500" placeholder="Es. Team Building 15 Giugno" value={gameName} onChange={e => setGameName(e.target.value)} />
                </div>
                <div className="form-control">
                  <label className="label font-semibold text-gray-700">Tema delle domande</label>
                  <select className="select select-bordered select-lg w-full focus:border-amber-500" value={theme} onChange={e => setTheme(e.target.value)}>
                    <option value="perugia_italia">Perugia e Italia — storia locale, monumenti, tradizioni</option>
                    <option value="cultura_generale">Cultura Generale — scienza, arte, geografia</option>
                  </select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Punti di Interesse</h2>
                  <p className="text-gray-500 mt-1">Seleziona almeno 3 luoghi. Consigliati 5-7 per una partita completa.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {availablePois.map(poi => {
                    const selected = selectedPois.includes(poi.id);
                    return (
                      <div key={poi.id}
                        onClick={() => togglePoi(poi.id)}
                        className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                          selected
                            ? "border-amber-500 bg-amber-50 shadow-md scale-[1.01]"
                            : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            selected ? "bg-amber-500 border-amber-500" : "border-gray-300"
                          }`}>
                            {selected && <span className="text-white text-sm font-bold">✓</span>}
                          </div>
                          <span className="font-semibold text-gray-800">{poi.name}</span>
                          <span className="badge badge-outline badge-sm ml-auto">{poi.zone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center text-sm font-medium text-gray-500 mt-2">
                  {selectedPois.length} su {availablePois.length} selezionati
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Crea le Squadre</h2>
                  <p className="text-gray-500 mt-1">Aggiungi almeno 2 squadre. I codici di accesso verranno generati all&apos;avvio.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Nome</label>
                      <input className="input input-bordered w-full focus:border-amber-500" placeholder="Es. Leoni" value={teamName} onChange={e => setTeamName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Colore</label>
                      <input type="color" className="w-full h-10 rounded-lg cursor-pointer border" value={teamColor} onChange={e => setTeamColor(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">Diff.</label>
                        <input type="number" className="input input-bordered w-full" min={1} max={4} value={teamDifficulty} onChange={e => setTeamDifficulty(+e.target.value)} />
                      </div>
                      <button className="btn btn-warning btn-sm self-end" onClick={addTeam}>+</button>
                    </div>
                  </div>
                </div>
                {teams.length > 0 && (
                  <div className="space-y-2">
                    {teams.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <span className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: t.color }} />
                        <span className="font-semibold flex-1">{t.name}</span>
                        <span className="badge badge-ghost">Liv. {t.difficulty}</span>
                        <button className="btn btn-ghost btn-xs text-red-500" onClick={() => removeTeam(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-center text-sm text-gray-500">{teams.length} squadre create</p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Riepilogo</h2>
                  <p className="text-gray-500 mt-1">Controlla i dati prima di avviare</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Nome partita</span>
                    <strong className="text-lg">{gameName || "Partita del giorno"}</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tema</span>
                    <strong>{theme === "perugia_italia" ? "Perugia e Italia" : "Cultura Generale"}</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Punti di Interesse</span>
                    <strong>{selectedPois.length} selezionati</strong>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Squadre</span>
                    <strong>{teams.length} create</strong>
                  </div>
                </div>
                {message && (
                  <div className={`p-4 rounded-xl text-center font-medium ${message.includes("successo") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {message}
                  </div>
                )}
                <button
                  className={`btn btn-lg w-full h-14 text-lg font-bold shadow-lg ${loading ? "loading bg-amber-400" : "bg-amber-500 hover:bg-amber-600"} text-black border-0`}
                  onClick={startGame} disabled={loading}
                >
                  {loading ? "Avvio in corso..." : "AVVIA PARTITA"}
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="text-6xl font-bold text-green-600">&#10003;</div>
                <h2 className="text-3xl font-bold text-green-600">Partita Avviata!</h2>
                <p className="text-gray-500">Comunica questi codici alle squadre:</p>
                <div className="grid gap-3">
                  {teams.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: t.color }} />
                        <span className="font-bold text-lg">{t.name}</span>
                      </div>
                      <code className="text-2xl font-mono font-bold text-amber-600 tracking-widest bg-white px-4 py-1 rounded-lg border">{accessCodes[i]}</code>
                    </div>
                  ))}
                </div>
                <a href="/admin/monitor" className="btn btn-lg w-full bg-amber-500 hover:bg-amber-600 text-black border-0 mt-2">
                  Vai al Monitoraggio
                </a>
              </div>
            )}

            {step < 3 && (
              <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                <button className="btn btn-ghost text-gray-500" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                  ← Indietro
                </button>
                <button className="btn btn-warning px-8 text-black" onClick={() => setStep(step + 1)}>
                  {step === 2 ? "Riepilogo" : "Avanti"} →
                </button>
              </div>
            )}
            {step === 4 && (
              <div className="text-center mt-6">
                <button className="btn btn-ghost text-amber-600" onClick={() => { setStep(0); setAccessCodes([]); setMessage(""); setTeams([]); setSelectedPois([]); }}>
                  ← Crea un&apos;altra partita
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
