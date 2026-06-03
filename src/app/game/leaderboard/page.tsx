"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useGameStore } from "@/lib/gameStore"
import Link from "next/link"

interface Team {
  id: string
  name: string
  color: string
  time_penalty_seconds: number
  location_bonus: number
}

export default function LeaderboardPage() {
  const { gameId, teamId } = useGameStore()
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    if (!gameId) return
    supabase
      .from("teams")
      .select("id, name, time_penalty_seconds, location_bonus, color")
      .eq("game_id", gameId)
      .order("time_penalty_seconds", { ascending: true })
      .then(({ data }) => setTeams(data || []))

    const channel = supabase
      .channel("teams-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "teams", filter: `game_id=eq.${gameId}` },
        (payload) => {
          setTeams((prev) =>
            prev
              .map((t) => (t.id === payload.new.id ? { ...t, time_penalty_seconds: payload.new.time_penalty_seconds, location_bonus: payload.new.location_bonus } : t))
              .sort((a, b) => (a.time_penalty_seconds - a.location_bonus) - (b.time_penalty_seconds - b.location_bonus))
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId])

  return (
    <div className="min-h-screen p-4 bg-base-200">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Classifica a Tempo</h1>
        <div className="space-y-2">
          {teams.map((team, index) => {
            const totalSeconds = (team.time_penalty_seconds || 0) - (team.location_bonus || 0)
            return (
            <div
              key={team.id}
              className={`card card-side shadow-xl p-4 ${team.id === teamId ? "bg-primary text-primary-content" : "bg-base-100"}`}
            >
              <div className="text-2xl font-bold mr-4">{index + 1}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }}></div>
                  <span className="font-semibold">{team.name}</span>
                </div>
                <div className="text-sm opacity-80">{totalSeconds}s totali</div>
              </div>
            </div>
          )})}
        </div>
        <Link href="/game/map" className="btn btn-outline btn-block mt-6">Torna alla Mappa</Link>
      </div>
    </div>
  )
}
