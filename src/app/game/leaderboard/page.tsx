"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useGameStore } from "@/lib/gameStore";

export default function LeaderboardPage() {
  const { teamId, gameId } = useGameStore();
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    if (!gameId) return;
    supabase.from("teams").select("*").eq("game_id", gameId).order("total_penalty_seconds", { ascending: true }).then(({ data }) => { if (data) setTeams(data); });
    const channel = supabase.channel("teams-changes").on("postgres_changes", { event: "UPDATE", schema: "public", table: "teams", filter: `game_id=eq.${gameId}` }, () => {
      supabase.from("teams").select("*").eq("game_id", gameId).order("total_penalty_seconds", { ascending: true }).then(({ data }) => { if (data) setTeams(data); });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gameId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Classifica</h1>
      <div className="overflow-x-auto">
        <table className="table w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
          <thead><tr><th>Pos</th><th>Squadra</th><th>Tempo</th></tr></thead>
          <tbody>
            {teams.map((t, i) => (
              <tr key={t.id} className={t.id === teamId ? "bg-primary text-primary-content" : ""}>
                <td>{i + 1}</td><td>{t.name}</td><td>{t.total_penalty_seconds || 0}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
