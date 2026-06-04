// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  try {
    const { game_id, team_id, branch_point_id, symbol } = await req.json();
    const { error: insertErr } = await supabase.from("blind_choice_votes").insert({ game_id, team_id, branch_point_id, symbol });
    if (insertErr) {
      return new Response(JSON.stringify({ resolved: false, message: "Voto gia registrato" }), { status: 409 });
    }
    const { data: votes } = await supabase.from("blind_choice_votes").select("symbol").eq("branch_point_id", branch_point_id);
    const { count: totalTeams } = await supabase.from("teams").select("*", { count: "exact" }).eq("game_id", game_id);
    const voteCounts: Record<string, number> = {};
    for (const v of votes || []) { voteCounts[v.symbol] = (voteCounts[v.symbol] || 0) + 1; }
    const totalVotes = (votes || []).length;
    for (const [sym, count] of Object.entries(voteCounts)) {
      if (count > totalVotes / 2) {
        return new Response(JSON.stringify({ resolved: true, symbol: sym, message: `Il simbolo ${sym} ha vinto!` }), { status: 200 });
      }
    }
    if (totalVotes >= (totalTeams?.count || 0)) {
      return new Response(JSON.stringify({ tie: true, message: "Pareggio! Spareggio in corso..." }), { status: 200 });
    }
    return new Response(JSON.stringify({ waiting: true, message: "In attesa degli altri voti..." }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ resolved: false, message: err.message }), { status: 500 });
  }
});
