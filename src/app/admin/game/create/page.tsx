"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateGamePage() {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("perugia_italia");
  const [message, setMessage] = useState("");

  const createGame = async () => {
    const { data, error } = await supabase.from("games").insert({ name, question_theme: theme, status: "lobby" }).select("id").single();
    if (error) setMessage("Errore: " + error.message);
    else setMessage(`Gioco creato! ID: ${data.id}. Ora aggiungi le squadre e avvia.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto card bg-white shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Crea Nuovo Gioco</h1>
        <input className="input input-bordered w-full mb-4" placeholder="Nome del gioco" value={name} onChange={e => setName(e.target.value)} />
        <select className="select select-bordered w-full mb-4" value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="perugia_italia">Perugia e Italia</option>
          <option value="cultura_generale">Cultura Generale</option>
        </select>
        <button className="btn btn-primary w-full" onClick={createGame}>Crea Gioco</button>
        {message && <div className="alert mt-4">{message}</div>}
      </div>
    </div>
  );
}
