// @ts-nocheck — Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Content-Type": "application/json",
};

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const { gameName, theme, teams, selectedPois } = await req.json();

    if (!teams?.length || teams.length < 2) {
      return new Response(JSON.stringify({ success: false, message: "Almeno 2 squadre richieste" }), { status: 400, headers: CORS });
    }
    if (!selectedPois?.length || selectedPois.length < 3) {
      return new Response(JSON.stringify({ success: false, message: "Almeno 3 POI richiesti" }), { status: 400, headers: CORS });
    }

    // 1. Create game
    const { data: game, error: gameErr } = await supabase.from("games").insert({
      name: gameName || "Partita " + new Date().toLocaleDateString("it-IT"),
      question_theme: theme || "perugia_italia",
      status: "lobby",
    }).select("id").single();
    if (gameErr) throw new Error("Errore creazione gioco: " + gameErr.message);

    // 2. Create teams with access codes
    const codes = [];
    for (const team of teams) {
      const code = generateCode();
      codes.push(code);
      const { error: teamErr } = await supabase.from("teams").insert({
        game_id: game.id,
        name: team.name,
        color: team.color || "#3b82f6",
        difficulty: team.difficulty || 2,
        access_code: code,
      });
      if (teamErr) throw new Error("Errore creazione squadra: " + teamErr.message);
    }

    // 3. Link POIs to game
    for (let i = 0; i < selectedPois.length; i++) {
      const { error: poiErr } = await supabase.from("game_points").insert({
        game_id: game.id,
        point_of_interest_id: selectedPois[i],
        order_index: i + 1,
      });
      if (poiErr) throw new Error("Errore collegamento POI: " + poiErr.message);
    }

    // 4. Start the game (generate enigmas, assign starting points)
    const { error: startErr } = await supabase.functions.invoke("start-game", {
      body: { game_id: game.id },
    });
    if (startErr) throw new Error("Errore avvio partita: " + startErr.message);

    return new Response(JSON.stringify({
      success: true,
      gameId: game.id,
      accessCodes: codes,
    }), { status: 200, headers: CORS });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      message: err.message,
    }), { status: 500, headers: CORS });
  }
});
