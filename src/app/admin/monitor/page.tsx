"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface TeamData {
  id: string;
  name: string;
  color: string;
  difficulty: number;
  total_penalty_seconds: number;
  location_bonus: number;
}

interface GameEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  team_name?: string;
}

export default function MonitorPage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<string>("loading");
  const [message, setMessage] = useState("");

  const loadTeams = async (gid: string) => {
    const { data } = await supabase.from("teams").select("*").eq("game_id", gid).order("total_penalty_seconds", { ascending: true });
    if (data) setTeams(data);
  };

  const loadEvents = async (gid: string) => {
    const { data } = await supabase.from("game_events").select("*").eq("game_id", gid).order("created_at", { ascending: false }).limit(50);
    if (data) setEvents(data);
  };

  const subscribeToChanges = (gid: string) => {
    try {
      const teamChannel = supabase
        .channel(`monitor-teams-${gid}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "teams", filter: `game_id=eq.${gid}` }, () => {
          loadTeams(gid);
        })
        .subscribe();

      const eventChannel = supabase
        .channel(`monitor-events-${gid}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_events", filter: `game_id=eq.${gid}` }, (payload) => {
          setEvents(prev => [payload.new as GameEvent, ...prev].slice(0, 50));
        })
        .subscribe();

      return () => {
        supabase.removeChannel(teamChannel);
        supabase.removeChannel(eventChannel);
      };
    } catch {
      return () => {};
    }
  };

  const loadActiveGame = async () => {
    const { data: game, error } = await supabase.from("games").select("*").eq("status", "active").maybeSingle();
    if (error) { setGameStatus("error"); return; }
    if (game) {
      setGameId(game.id);
      setGameStatus("active");
      loadTeams(game.id);
      loadEvents(game.id);
      subscribeToChanges(game.id);
    } else {
      const { data: lobbyGame } = await supabase.from("games").select("*").eq("status", "lobby").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (lobbyGame) {
        setGameId(lobbyGame.id);
        setGameStatus("lobby");
        loadTeams(lobbyGame.id);
      } else {
        setGameStatus("none");
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadActiveGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopGame = async () => {
    if (!gameId) return;
    if (!confirm("Sei sicuro di voler fermare la partita?")) return;
    const { error } = await supabase.from("games").update({ status: "completed" }).eq("id", gameId);
    if (error) setMessage("Errore: " + error.message);
    else { setGameStatus("completed"); setMessage("Partita terminata!"); }
  };

  // Sort teams by effective time (penalties - bonuses)
  const rankedTeams = [...teams].sort((a, b) => (a.total_penalty_seconds - a.location_bonus) - (b.total_penalty_seconds - b.location_bonus));

  const getEventEmoji = (type: string) => {
    const map: Record<string, string> = {
      enigma_answered: "[R]",
      enigma_solved: "[OK]",
      bonus_location: "[B]",
      penalty_added: "[T]",
      blind_vote_cast: "[V]",
      game_started: "[S]",
      game_completed: "[F]",
      suspicious_gps: "[!]",
    };
    return map[type] || "[?]";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (gameStatus === "loading") {
    return <div className="flex min-h-screen items-center justify-center"><span className="loading loading-spinner loading-lg" /></div>;
  }

  if (gameStatus === "none") {
    return (
      <div className="min-h-screen bg-base-200 p-8 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl max-w-md w-full">
          <div className="card-body text-center">
            <h1 className="text-2xl font-bold mb-2">Nessuna Partita Attiva</h1>
            <p className="text-base-content/60 mb-4">Non ci sono partite in corso. Creane una nuova.</p>
            <a href="/admin/game/create" className="btn btn-primary">Crea Nuova Partita</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Monitoraggio Partita</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${gameStatus === "active" ? "badge-success" : gameStatus === "completed" ? "badge-ghost" : "badge-warning"}`}>
              {gameStatus === "active" ? "IN CORSO" : gameStatus === "completed" ? "TERMINATA" : "IN ATTESA"}
            </span>
            {message && <span className="text-sm text-base-content/70">{message}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/admin/game/create" className="btn btn-ghost btn-sm">Nuova Partita</a>
          {gameStatus === "active" && (
            <button className="btn btn-error btn-sm" onClick={stopGame}>FERMA PARTITA</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Classifica</h2>
              {rankedTeams.length === 0 ? (
                <p className="text-base-content/50">Nessuna squadra ancora in gara.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Squadra</th>
                        <th>Difficoltà</th>
                        <th>Penalità</th>
                        <th>Bonus</th>
                        <th>Tempo Effettivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedTeams.map((team, i) => {
                        const effectiveTime = team.total_penalty_seconds - team.location_bonus;
                        return (
                          <tr key={team.id} className={i === 0 ? "bg-success/10" : ""}>
                            <td className="font-bold text-lg">
                              {`${i + 1}°`}
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
                                <span className="font-medium">{team.name}</span>
                              </div>
                            </td>
                            <td>{team.difficulty}/4</td>
                            <td className="text-error">+{formatTime(team.total_penalty_seconds)}</td>
                            <td className="text-success">-{team.location_bonus}s</td>
                            <td className="font-mono font-bold">{formatTime(Math.max(0, effectiveTime))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div>
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h2 className="card-title">Log Eventi</h2>
              {events.length === 0 ? (
                <p className="text-base-content/50 text-sm">Nessun evento ancora. Gli eventi appariranno qui in tempo reale.</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {events.map((evt) => (
                    <div key={evt.id} className="flex items-start gap-2 p-2 rounded-box bg-base-200 text-sm">
                      <span className="text-lg">{getEventEmoji(evt.event_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-base-content/50">{new Date(evt.created_at).toLocaleTimeString("it-IT")}</p>
                        <p>{evt.description || evt.event_type}</p>
                        {evt.team_name && <span className="badge badge-sm">{evt.team_name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
