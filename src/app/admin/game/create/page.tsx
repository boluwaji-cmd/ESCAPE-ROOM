"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface POI {
  id: string
  name: string
  zone: string
}

export default function AdminGameCreate() {
  const [gameName, setGameName] = useState("")
  const [companyInfo, setCompanyInfo] = useState("")
  const [questionTheme, setQuestionTheme] = useState("cultura_generale")
  const [gameId, setGameId] = useState<string | null>(null)
  const [points, setPoints] = useState<POI[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const createGame = async () => {
    if (!gameName.trim()) return
    setLoading(true)
    setError("")
    const { data, error: insertError } = await supabase
      .from("games")
      .insert({ name: gameName, company_info: companyInfo, question_theme: questionTheme, status: "lobby" })
      .select()
      .single()
    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }
    setGameId(data.id)
    setLoading(false)
  }

  useEffect(() => {
    if (gameId) {
      supabase.from("points_of_interest").select("*").then(({ data }) => {
        setPoints(data || [])
      })
    }
  }, [gameId])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const startGame = async () => {
    if (!gameId || selected.length === 0) return
    setLoading(true)
    setError("")
    const inserts = selected.map((poiId, idx) => ({
      game_id: gameId,
      point_of_interest_id: poiId,
      order_index: idx + 1,
    }))
    const { error: pointsError } = await supabase.from("game_points").insert(inserts)
    if (pointsError) {
      setError(pointsError.message)
      setLoading(false)
      return
    }

    const { data: fnData, error: fnError } = await supabase.functions.invoke("start-game", {
      body: { game_id: gameId },
    })
    if (fnError) {
      setError(fnError.message)
    } else {
      setResult(fnData)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Crea Nuovo Gioco</h1>
      {!gameId ? (
        <div className="card bg-white shadow-xl p-6 border border-gray-200">
          <div className="form-control mb-4">
            <label className="label text-gray-800">Nome Gioco</label>
            <input className="input input-bordered bg-white text-gray-900" value={gameName} onChange={(e) => setGameName(e.target.value)} />
          </div>
          <div className="form-control mb-4">
            <label className="label text-gray-800">Info Azienda (opzionale)</label>
            <textarea className="textarea textarea-bordered bg-white text-gray-900" value={companyInfo} onChange={(e) => setCompanyInfo(e.target.value)} />
          </div>
          <div className="form-control mb-4">
            <label className="label text-gray-800">Tema Domande</label>
            <select className="select select-bordered bg-white text-gray-900" value={questionTheme} onChange={(e) => setQuestionTheme(e.target.value)}>
              <option value="cultura_generale">Cultura Generale</option>
              <option value="perugia_italia">Perugia e Italia</option>
            </select>
            <label className="label text-xs text-gray-500">
              <span>Cultura Generale: domande su storia, scienza, arte mondiale.</span>
              <span>Perugia e Italia: domande su storia locale, monumenti, tradizioni umbre.</span>
            </label>
          </div>
          {error && <div className="alert alert-error mb-4 text-white">{error}</div>}
          <button
            className="btn btn-primary"
            onClick={createGame}
            disabled={loading || !gameName.trim()}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Crea Gioco"}
          </button>
        </div>
      ) : (
        <div>
          <div className="alert alert-success mb-4 text-white">Gioco creato con ID: {gameId}</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">Seleziona i punti di interesse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {points.map((p) => (
              <div key={p.id} className="form-control">
                <label className="cursor-pointer label justify-start gap-2 text-gray-800">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selected.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                  <span>{p.name} ({p.zone})</span>
                </label>
              </div>
            ))}
          </div>
          {error && <div className="alert alert-error mb-4 text-white">{error}</div>}
          <button
            className="btn btn-secondary"
            onClick={startGame}
            disabled={loading || selected.length === 0}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Assegna Punti e Avvia Gioco"}
          </button>
          {result && (
            <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto text-gray-800">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
