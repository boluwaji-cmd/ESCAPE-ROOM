// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

serve(async (req: Request) => {
  try {
    const { team_id, latitude, longitude, timestamp } = await req.json();
    if (!team_id || latitude == null || longitude == null || !timestamp) {
      return new Response(JSON.stringify({ valid: false, reason: "Dati mancanti" }), { status: 400 });
    }

    // Fetch last location
    const { data: lastEvent } = await supabase
      .from("game_events")
      .select("payload, created_at")
      .eq("team_id", team_id)
      .eq("event_type", "location_update")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Store this location
    await supabase.from("game_events").insert({
      team_id,
      event_type: "location_update",
      payload: { latitude, longitude, timestamp },
    });

    // Debug info
    let debug = { lastEvent: null as any, distance: 0, timeDelta: 0, speed: 0 };

    if (lastEvent?.payload) {
      const prev = lastEvent.payload;
      const prevTime = new Date(prev.timestamp || lastEvent.created_at).getTime();
      const currTime = new Date(timestamp).getTime();
      const timeDelta = (currTime - prevTime) / 1000;
      debug.timeDelta = timeDelta;

      if (timeDelta > 0) {
        const distance = haversineDistance(prev.latitude, prev.longitude, latitude, longitude);
        debug.distance = distance;
        const speed = distance / timeDelta;
        debug.speed = speed;
        debug.lastEvent = prev;

        if (speed > 50) {
          await supabase.from("game_events").insert({
            team_id,
            event_type: "suspicious_gps",
            payload: { speed, distance, timeDelta },
          });
          return new Response(JSON.stringify({ valid: false, reason: "Velocità sospetta", speed, debug }));
        }
      }
    }

    return new Response(JSON.stringify({ valid: true, debug }));
  } catch (error) {
    return new Response(JSON.stringify({ valid: false, reason: error.message }), { status: 500 });
  }
});
