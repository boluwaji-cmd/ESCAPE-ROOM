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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const { name, zone, latitude, longitude, radius, description } = await req.json();

    if (!name || !zone) {
      return new Response(JSON.stringify({ success: false, message: "Nome e zona obbligatori" }), { status: 400, headers: CORS });
    }

    const { data, error } = await supabase.from("points_of_interest").insert({
      name, zone, latitude, longitude,
      activation_radius_meters: radius || 40,
      description: description || "",
    }).select("id").single();

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500, headers: CORS });
  }
});
