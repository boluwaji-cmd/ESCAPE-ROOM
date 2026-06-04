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

function validateInput(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') return { valid: false, error: 'Body JSON mancante' };
  if (!body.enigma_id || typeof body.enigma_id !== 'string') return { valid: false, error: 'enigma_id mancante' };
  if (!body.team_id || typeof body.team_id !== 'string') return { valid: false, error: 'team_id mancante' };
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
    const { data: enigma, error: enigmaError } = await supabase
      .from("enigma_pool").select("*, point_of_interest_id").eq("id", enigma_id).single();
    if (enigmaError || !enigma) {
      return new Response(JSON.stringify({ correct: false, message: "Domanda non trovata" }), { status: 404 });
    }
    let timedOut = false;
    if (question_started_at) {
      const started = new Date(question_started_at).getTime();
      timedOut = (Date.now() - started) > (QUESTION_TIMEOUT_SECONDS * 1000);
    }
    const isCorrect = !timedOut && enigma.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();
    if (!isCorrect) {
      await supabase.rpc("increment_penalty_seconds", { p_team_id: team_id, p_seconds: PENALTY_SECONDS });
      return new Response(JSON.stringify({
        correct: false, timed_out: timedOut,
        message: timedOut ? "Tempo scaduto! +10s. Nuova domanda." : "Risposta sbagliata! +10s. Nuova domanda.",
        penalty_seconds: PENALTY_SECONDS,
      }), { status: 200 });
    }
    const { data: team } = await supabase.from("teams").select("location_bonus").eq("id", team_id).single();
    const currentBonus = team?.location_bonus || 0;
    if (currentBonus < MAX_LOCATION_BONUS) {
      await supabase.rpc("increment_location_bonus", { p_team_id: team_id });
    }
    return new Response(JSON.stringify({
      correct: true, location_bonus: Math.min(currentBonus + 1, MAX_LOCATION_BONUS),
      message: "Risposta corretta!",
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ correct: false, message: "Errore interno" }), { status: 500 });
  }
});
