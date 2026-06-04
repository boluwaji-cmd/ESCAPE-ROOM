// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

serve(async (req) => {
  try {
    const { zoneName } = await req.json();
    const { data } = await supabase.storage.from("audio-guides").createSignedUrl(`${zoneName}.mp3`, 3600);
    if (!data?.signedUrl) {
      return new Response(JSON.stringify({ audioUrl: null, message: "Audio non disponibile per questa zona" }), { status: 404 });
    }
    return new Response(JSON.stringify({ audioUrl: data.signedUrl, cached: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ audioUrl: null, message: "Errore nel recupero audio" }), { status: 500 });
  }
});
