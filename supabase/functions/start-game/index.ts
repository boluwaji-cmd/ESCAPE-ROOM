// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { game_id } = await req.json();
    if (!game_id) {
      return new Response(JSON.stringify({ error: "game_id mancante" }), { status: 400 });
    }

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", game_id)
      .eq("status", "lobby")
      .single();
    if (gameError || !game) {
      return new Response(JSON.stringify({ error: "Partita non trovata o non in lobby" }), { status: 404 });
    }

    // Verifica partita singola: nessun'altra partita attiva
    const { data: activeGame } = await supabase
      .from("games")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    if (activeGame) {
      return new Response(JSON.stringify({ error: "Una partita e gia attiva. Fermala prima di avviarne un'altra." }), { status: 409 });
    }

    const { data: gamePoints } = await supabase.from("game_points").select("*").eq("game_id", game_id);
    const { data: teams } = await supabase.from("teams").select("*").eq("game_id", game_id);

    if (!teams || teams.length === 0) {
      return new Response(JSON.stringify({ error: "Nessuna squadra trovata. Crea almeno una squadra prima di avviare." }), { status: 400 });
    }

    // Assegna punti di partenza casuali DIVERSI per ogni squadra
    const availablePoints = [...gamePoints];
    for (const team of teams) {
      if (availablePoints.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availablePoints.length);
      const assignedPoint = availablePoints.splice(randomIndex, 1)[0];
      await supabase.from("teams").update({ current_game_point_id: assignedPoint.id }).eq("id", team.id);
    }

    // === Generazione Domande (chiama generate-enigma) ===
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const questionTheme = game.question_theme || "cultura_generale";
    const enigmas: any[] = [];

    for (const point of gamePoints) {
      // Fetch POI details for richer prompt context
      const { data: poi } = await supabase
        .from("points_of_interest")
        .select("name, zone, description")
        .eq("id", point.point_of_interest_id)
        .single();

      const zone = poi?.zone || "Perugia";
      const description = poi?.description || poi?.name || "Luogo storico di Perugia";

      // Generate 5 enigmas per point (US32), difficulty cycles 1→4
      const enigmaPromises = [];
      for (let i = 0; i < 5; i++) {
        const difficulty = (i % 4) + 1;
        enigmaPromises.push(
          fetch(`${SUPABASE_URL}/functions/v1/generate-enigma`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              zone,
              description,
              difficulty,
              companyInfo: game.company_info || "",
              previousFails: 0,
              questionTheme,
            }),
          }).then(async (r) => {
            if (!r.ok) throw new Error(`generate-enigma HTTP ${r.status}`);
            return r.json();
          }).catch((err) => {
            console.error(`Generazione enigma fallita per ${zone} diff ${difficulty}:`, err.message);
            return null; // fallback a placeholder sotto
          })
        );
      }

      const results = await Promise.all(enigmaPromises);

      for (let i = 0; i < results.length; i++) {
        const generated = results[i];
        const difficulty = (i % 4) + 1;
        if (generated && generated.question && !generated.error) {
          enigmas.push({
            game_id,
            point_of_interest_id: point.point_of_interest_id,
            difficulty_level: difficulty,
            question: generated.question,
            options: JSON.stringify(generated.options || ["Vero", "Falso"]),
            correct_answer: generated.correctAnswer || generated.options?.[0] || "",
            hint: generated.hint || "Osserva bene i dettagli intorno a te...",
            explanation: generated.explanation || "",
            type: generated.type || "multiple_choice",
          });
        } else {
          // Fallback placeholder se la generazione fallisce
          enigmas.push({
            game_id,
            point_of_interest_id: point.point_of_interest_id,
            difficulty_level: difficulty,
            question: `Cosa rende speciale ${zone} a Perugia? (difficoltà ${difficulty})`,
            options: JSON.stringify(["Vero", "Falso"]),
            correct_answer: "Vero",
            hint: "Pensa alla storia di questo luogo",
            explanation: `Questo è un enigma su ${zone}`,
            type: "true_false",
          });
        }
      }
    }

    if (enigmas.length > 0) {
      await supabase.from("enigma_pool").insert(enigmas);
    }

    await supabase.from("games").update({ status: "active", started_at: new Date().toISOString() }).eq("id", game_id);

    const { data: updatedTeams } = await supabase.from("teams").select("*").eq("game_id", game_id);
    return new Response(JSON.stringify({ success: true, teams: updatedTeams }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
