"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useGameStore } from "@/lib/gameStore"

export default function LoginPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDoor, setShowDoor] = useState(false)
  const router = useRouter()
  const setTeam = useGameStore((s) => s.setTeam)

  const handleLogin = async () => {
    setError("")
    setLoading(true)
    const { data: team, error: fetchError } = await supabase
      .from("teams")
      .select("*")
      .eq("access_code", code)
      .single()

    if (fetchError || !team) {
      setError("Codice squadra non valido.")
      setLoading(false)
      return
    }

    setTeam(team)
    setShowDoor(true)
    setTimeout(() => router.push("/game/map"), 1500)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551622378-3e5f6e4b3c9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')" }}
    >
      <div className={`transition-transform duration-1000 ${showDoor ? "scale-150 opacity-0" : "scale-100 opacity-100"}`}>
        <div className="card w-96 bg-white/90 shadow-xl backdrop-blur-sm">
          <div className="card-body">
            <h1 className="card-title text-2xl justify-center text-gray-900">Escape Room Perugia</h1>
            <p className="text-center text-sm text-gray-700">Inserisci il codice della tua squadra</p>
            <input
              type="text"
              placeholder="Codice squadra"
              className="input input-bordered w-full mt-4 text-gray-900 placeholder-gray-400 bg-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && <div className="alert alert-error mt-2 text-white">{error}</div>}
            <button
              className="btn btn-primary mt-4"
              onClick={handleLogin}
              disabled={loading || !code}
            >
              {loading ? <span className="loading loading-spinner"></span> : "Entra"}
            </button>
          </div>
        </div>
      </div>
      {showDoor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-white text-4xl font-bold animate-ping">Porta che si apre...</div>
        </div>
      )}
    </div>
  )
}
