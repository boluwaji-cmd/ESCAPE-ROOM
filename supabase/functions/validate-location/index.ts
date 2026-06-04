// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  try {
    const { team_id, latitude, longitude, timestamp } = await req.json();
    const { data: lastEvent } = await supabase.from("game_events")
      .select("payload").eq("team_id", team_id).eq("event_type", "location_update")
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (lastEvent?.payload) {
      const prev = lastEvent.payload;
      const R = 6371000;
      const toRad = (d: number) => d * Math.PI / 180;
      const dLat = toRad(latitude - prev.latitude), dLon = toRad(longitude - prev.longitude);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(prev.latitude)) * Math.cos(toRad(latitude)) * Math.sin(dLon/2)**2;
      const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const timeDelta = (new Date(timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
      const speed = distance / timeDelta;
      if (speed > 50) {
        await supabase.from("game_events").insert({ team_id, event_type: "suspicious_gps", payload: { speed, distance, timeDelta } });
        return new Response(JSON.stringify({ valid: false, reason: "Velocita sospetta", speed }), { status: 200 });
      }
    }
    await supabase.from("game_events").insert({ team_id, event_type: "location_update", payload: { latitude, longitude, timestamp } });

    // Check proximity to team's current assigned POI
    const { data: team } = await supabase.from("teams")
      .select("current_game_point_id, game_id").eq("id", team_id).maybeSingle();
    if (team?.current_game_point_id) {
      const { data: gp } = await supabase.from("game_points")
        .select("point_of_interest_id").eq("id", team.current_game_point_id).maybeSingle();
      if (gp?.point_of_interest_id) {
        const { data: poi } = await supabase.from("points_of_interest")
          .select("latitude, longitude, activation_radius_meters").eq("id", gp.point_of_interest_id).maybeSingle();
        if (poi) {
          const R = 6371000;
          const toRad = (d: number) => d * Math.PI / 180;
          const dLat = toRad(latitude - poi.latitude), dLon = toRad(longitude - poi.longitude);
          const a = Math.sin(dLat/2)**2 + Math.cos(toRad(poi.latitude)) * Math.cos(toRad(latitude)) * Math.sin(dLon/2)**2;
          const distToPoi = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const radius = poi.activation_radius_meters || 40;
          if (distToPoi <= radius) {
            return new Response(JSON.stringify({ valid: true, atPoi: true, distance: Math.round(distToPoi) }), { status: 200 });
          }
        }
      }
    }
    return new Response(JSON.stringify({ valid: true, atPoi: false }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, message: err.message }), { status: 500 });
  }
});
