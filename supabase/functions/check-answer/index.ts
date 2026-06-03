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

serve(async (req) => {
  try {
    const { enigma_id, answer, team_id, question_started_at } = await req.json();
    if (!enigma_id || !answer || !team_id) {
      return new Response(JSON.stringify({ correct: false, message: "Dati mancanti" }), { status: 400 });
    }

    // Fetch the enigma being answered
    const { data: enigma, error: enigmaError } = await supabase
      .from("enigma_pool")
      .select("*, point_of_interest_id")
      .eq("id", enigma_id)
      .single();
    if (enigmaError || !enigma) {
      return new Response(JSON.stringify({ correct: false, message: "Domanda non trovata" }), { status: 404 });
    }

    // Validate 10-second timer
    let timedOut = false;
    if (question_started_at) {
      const started = new Date(question_started_at).getTime();
      const now = Date.now();
      timedOut = (now - started) > (QUESTION_TIMEOUT_SECONDS * 1000);
    }

    const isCorrect = !timedOut && enigma.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();

    // Track failed enigmas for this team/POI
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

    // --- WRONG ANSWER OR TIMEOUT ---
    if (!isCorrect) {
      await supabase.rpc("increment_penalty_seconds", { p_team_id: team_id, p_seconds: PENALTY_SECONDS });

      // Record the failed attempt
      await supabase.from("enigma_sessions").upsert({
        team_id,
        enigma_pool_id: enigma_id,
        status: "active",
        attempts: (existingSession?.attempts || 0) + 1,
        failed_enigma_ids: failedIds,
        question_started_at: question_started_at || new Date().toISOString(),
        started_at: existingSession?.started_at || new Date().toISOString(),
      }, { onConflict: "team_id, enigma_pool_id" });

      // Fetch a NEW different question for the same POI
      let query = supabase
        .from("enigma_pool")
        .select("*")
        .eq("point_of_interest_id", enigma.point_of_interest_id);

      // Only exclude failed IDs if there are any
      if (failedIds.length > 0) {
        query = query.not("id", "in", `(${failedIds.map(id => `'${id}'`).join(",")})`);
      }

      const { data: newQuestions } = await query.limit(1);

      const newQuestion = newQuestions?.[0] || null;
      const reason = timedOut ? "Tempo scaduto" : "Risposta sbagliata";

      return new Response(JSON.stringify({
        correct: false,
        message: `${reason}, +${PENALTY_SECONDS} secondi. Nuova domanda.`,
        penalty_seconds: PENALTY_SECONDS,
        new_enigma: newQuestion ? {
          id: newQuestion.id,
          question: newQuestion.question,
          type: newQuestion.type,
          options: typeof newQuestion.options === "string" ? JSON.parse(newQuestion.options) : newQuestion.options,
          hint: newQuestion.hint,
        } : null,
        failed_ids: failedIds,
      }));
    }

    // --- CORRECT ANSWER ---
    await supabase.rpc("increment_location_bonus", { p_team_id: team_id });

    await supabase.from("enigma_sessions").upsert({
      team_id,
      enigma_pool_id: enigma_id,
      status: "solved",
      attempts: (existingSession?.attempts || 0) + 1,
      started_at: existingSession?.started_at || question_started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      question_started_at: question_started_at || new Date().toISOString(),
      failed_enigma_ids: failedIds,
    }, { onConflict: "team_id, enigma_pool_id" });

    // Advance to next point
    const { data: team } = await supabase.from("teams").select("current_game_point_id, location_bonus").eq("id", team_id).single();
    let nextPointId = null;
    let isBlindChoice = false;
    let gameCompleted = false;

    if (team) {
      const { data: currentPoint } = await supabase
        .from("game_points")
        .select("order_index, game_id")
        .eq("id", team.current_game_point_id)
        .single();

      if (currentPoint) {
        const { data: nextPoint } = await supabase
          .from("game_points")
          .select("*")
          .eq("game_id", currentPoint.game_id)
          .gt("order_index", currentPoint.order_index)
          .order("order_index", { ascending: true })
          .limit(1)
          .single();

        if (nextPoint) {
          if (nextPoint.is_branch) {
            isBlindChoice = true;
            nextPointId = nextPoint.id;
          } else {
            await supabase.from("teams").update({ current_game_point_id: nextPoint.id }).eq("id", team_id);
            nextPointId = nextPoint.id;
          }
        } else {
          await supabase.from("teams").update({ completed_at: new Date().toISOString() }).eq("id", team_id);
          gameCompleted = true;
        }
      }
    }

    // Broadcast to team
    const channel = supabase.channel(`team-${team_id}`);
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "enigma_solved",
      payload: { enigma_id, correct: true, next_point_id: nextPointId, blind_choice: isBlindChoice, game_completed: gameCompleted },
    });

    return new Response(JSON.stringify({
      correct: true,
      message: `Corretto! Bonus -1s sulla tappa (max ${MAX_LOCATION_BONUS}s).`,
      location_bonus: (team?.location_bonus || 0) + 1,
      next_point_id: nextPointId,
      blind_choice: isBlindChoice,
      game_completed: gameCompleted,
    }));
  } catch (error) {
    return new Response(JSON.stringify({ correct: false, message: error.message }), { status: 500 });
  }
});
