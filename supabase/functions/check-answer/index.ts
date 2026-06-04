// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const QUESTION_TIMEOUT_SECONDS = 10;
const PENALTY_SECONDS = 10;
const MAX_LOCATION_BONUS = 5;

// Validazione robusta dell'input
function validateInput(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') return { valid: false, error: 'Body JSON mancante' };
  if (!body.enigma_id || typeof body.enigma_id !== 'string') return { valid: false, error: 'enigma_id mancante o non valido' };
  if (!body.team_id || typeof body.team_id !== 'string') return { valid: false, error: 'team_id mancante o non valido' };
  if (body.answer === undefined || body.answer === null) return { valid: false, error: 'answer mancante' };
  return { valid: true };
}

serve(async (req) => {
  try {
    const body = await req.json();
    const validation = validateInput(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ correct: false, message: validation.error }), { status: 400 });
    }

    const { enigma_id, answer, team_id, question_started_at } = body;

    // Recupera la domanda dall'enigma_pool
    const { data: enigma, error: enigmaError } = await supabase
      .from("enigma_pool")
      .select("*, point_of_interest_id")
      .eq("id", enigma_id)
      .single();
    if (enigmaError || !enigma) {
      return new Response(JSON.stringify({ correct: false, message: "Domanda non trovata" }), { status: 404 });
    }

    // Verifica timeout 10 secondi
    let timedOut = false;
    if (question_started_at) {
      const started = new Date(question_started_at).getTime();
      const now = Date.now();
      timedOut = (now - started) > (QUESTION_TIMEOUT_SECONDS * 1000);
    }

    const isCorrect = !timedOut && enigma.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();

    // Tracciamento domande fallite per questa squadra/POI
    const { data: existingSession } = await supabase
      .from("enigma_sessions")
      .select("failed_enigma_ids")
      .eq("team_id", team_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const failedIds: string[] = existingSession?.failed_enigma_ids || [];
    if (!isCorrect && !failedIds.includes(enigma_id)) {
      failedIds.push(enigma_id);
    }

    // --- RISPOSTA SBAGLIATA O TIMEOUT ---
    if (!isCorrect) {
      await supabase.rpc("increment_penalty_seconds", { p_team_id: team_id, p_seconds: PENALTY_SECONDS });

      // Registra il tentativo fallito
      await supabase.from("enigma_sessions").insert({
        team_id,
        enigma_pool_id: enigma_id,
        status: "failed",
        attempts: 1,
        failed_enigma_ids: failedIds,
      });

      // Genera una NUOVA domanda diversa (non la stessa)
      const { data: newEnigma } = await supabase
        .from("enigma_pool")
        .select("*")
        .eq("point_of_interest_id", enigma.point_of_interest_id)
        .neq("id", enigma_id)
        .not("id", "in", `(${failedIds.join(",")})`)
        .limit(1)
        .maybeSingle();

      return new Response(JSON.stringify({
        correct: false,
        timed_out: timedOut,
        message: timedOut ? "Tempo scaduto! +10 secondi. Nuova domanda." : "Risposta sbagliata! +10 secondi. Nuova domanda.",
        penalty_seconds: PENALTY_SECONDS,
        new_enigma: newEnigma || null,
      }), { status: 200 });
    }

    // --- RISPOSTA CORRETTA ---
    // Incrementa il bonus tappe (max -5s)
    const { data: team } = await supabase
      .from("teams")
      .select("location_bonus")
      .eq("id", team_id)
      .single();

    const currentBonus = team?.location_bonus || 0;
    if (currentBonus < MAX_LOCATION_BONUS) {
      await supabase.rpc("increment_location_bonus", { p_team_id: team_id });
    }

    // Registra la sessione come risolta
    await supabase.from("enigma_sessions").insert({
      team_id,
      enigma_pool_id: enigma_id,
      status: "solved",
      attempts: 1,
    });

    // Recupera il prossimo game_point
    const { data: currentPoint } = await supabase
      .from("teams")
      .select("current_game_point_id")
      .eq("id", team_id)
      .single();

    const { data: nextPoint } = await supabase
      .from("game_points")
      .select("*")
      .eq("game_id", body.game_id || (await supabase.from("teams").select("game_id").eq("id", team_id).single()).data?.game_id)
      .gt("order_index", 0) // verrà raffinato con l'ordine effettivo
      .limit(1)
      .maybeSingle();

    // Controlla se è un bivio (branch)
    const isBranch = nextPoint?.is_branch || false;

    // Aggiorna la posizione corrente della squadra
    if (nextPoint) {
      await supabase
        .from("teams")
        .update({ current_game_point_id: nextPoint.id })
        .eq("id", team_id);
    }

    // Registra l'evento
    await supabase.from("game_events").insert({
      game_id: body.game_id,
      team_id,
      event_type: "enigma_solved",
      payload: { enigma_id, correct: true, next_point_id: nextPoint?.id || null },
    });

    // Broadcast alla squadra via Realtime
    const channel = supabase.channel(`team-${team_id}`);
    await channel.send({
      type: "broadcast",
      event: "enigma_solved",
      payload: {
        enigma_id,
        correct: true,
        next_point_id: nextPoint?.id || null,
        blind_choice: isBranch,
        game_completed: !nextPoint,
      },
    });

    return new Response(JSON.stringify({
      correct: true,
      location_bonus: Math.min(currentBonus + 1, MAX_LOCATION_BONUS),
      next_point_id: nextPoint?.id || null,
      blind_choice: isBranch,
      game_completed: !nextPoint,
      message: "Risposta corretta!",
    }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ correct: false, message: "Errore interno del server", error: err.message }), { status: 500 });
  }
});
