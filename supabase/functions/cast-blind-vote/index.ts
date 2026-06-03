// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { game_id, team_id, branch_point_id, symbol } = await req.json();
    if (!game_id || !team_id || !branch_point_id || !symbol) {
      return new Response(JSON.stringify({ error: "Dati mancanti" }), { status: 400 });
    }

    // Check if team already voted on this branch
    const { data: existingVote } = await supabase
      .from("blind_choice_votes")
      .select("*")
      .eq("game_id", game_id)
      .eq("team_id", team_id)
      .eq("branch_point_id", branch_point_id)
      .single();

    if (existingVote) {
      return new Response(JSON.stringify({ error: "La squadra ha già votato" }), { status: 409 });
    }

    // Insert the vote
    await supabase.from("blind_choice_votes").insert({
      game_id,
      team_id,
      branch_point_id,
      symbol,
    });

    // Count votes for this branch
    const { data: votes } = await supabase
      .from("blind_choice_votes")
      .select("symbol")
      .eq("game_id", game_id)
      .eq("branch_point_id", branch_point_id);

    const totalVotes = votes.length;
    const voteCounts: Record<string, number> = {};
    votes.forEach((v: any) => {
      voteCounts[v.symbol] = (voteCounts[v.symbol] || 0) + 1;
    });

    // Check if any symbol has >50%
    const winningSymbol = Object.keys(voteCounts).find(
      (sym) => voteCounts[sym] > totalVotes / 2
    );

    if (winningSymbol) {
      // Resolve: find the branch point with this symbol
      const { data: branchPoints } = await supabase
        .from("game_points")
        .select("*")
        .eq("game_id", game_id)
        .eq("is_branch", true)
        .eq("branch_symbol", winningSymbol);

      if (branchPoints && branchPoints.length > 0) {
        const nextBranch = branchPoints[0];
        await supabase
          .from("teams")
          .update({ current_game_point_id: nextBranch.id })
          .eq("id", team_id);

        return new Response(JSON.stringify({
          resolved: true,
          symbol: winningSymbol,
          next_zone: nextBranch.branch_symbol,
          message: `La squadra ha scelto il simbolo ${winningSymbol}!`,
        }));
      }
    }

    // Check if all teams have voted
    const { data: teams } = await supabase
      .from("teams")
      .select("id")
      .eq("game_id", game_id);
    const totalTeams = teams.length;

    if (totalVotes >= totalTeams) {
      return new Response(JSON.stringify({
        tie: true,
        message: "Pareggio! Ballottaggio necessario.",
      }));
    }

    return new Response(JSON.stringify({
      waiting: true,
      message: "In attesa che altre squadre votino...",
      votes_so_far: voteCounts,
    }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
