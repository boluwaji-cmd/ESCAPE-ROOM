// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  try {
    const { game_id } = await req.json();
    const { data: teams } = await supabase.from("teams").select("id").eq("game_id", game_id);
    const { data: points } = await supabase.from("game_points").select("id, point_of_interest_id").eq("game_id", game_id);
    if (!teams?.length || !points?.length) {
      return new Response(JSON.stringify({ success: false, message: "Nessuna squadra o punto configurato" }), { status: 400 });
    }
    const assigned = new Set();
    for (const team of teams) {
      const available = points.filter((p: any) => !assigned.has(p.id));
      const start = available[Math.floor(Math.random() * available.length)];
      assigned.add(start.id);
      await supabase.from("teams").update({ current_game_point_id: start.id }).eq("id", team.id);
      const enigmaPromises = [];
      for (let i = 0; i < 5; i++) {
        enigmaPromises.push(
          supabase.functions.invoke("generate-enigma", { body: { zone: `punto-${start.id}`, difficulty: (i % 4) + 1, questionTheme: "perugia_italia" } })
        );
      }
      await Promise.all(enigmaPromises);
    }
    await supabase.from("games").update({ status: "active", started_at: new Date().toISOString() }).eq("id", game_id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
});
