// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BUCKET = "audio-guides";

serve(async (req: Request) => {
  try {
    const { zoneName } = await req.json();
    if (!zoneName) {
      return new Response(JSON.stringify({ error: "zoneName obbligatorio" }), { status: 400 });
    }
    const fileName = `${zoneName.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(fileName, 3600);
    if (signed?.signedUrl) {
      return new Response(JSON.stringify({ audioUrl: signed.signedUrl, cached: true }));
    }
    return new Response(JSON.stringify({ error: "File audio non trovato. Carica un MP3 nel bucket audio-guides." }), { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
