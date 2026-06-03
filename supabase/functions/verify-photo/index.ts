// @ts-nocheck — Deno runtime con moduli URL; la verifica tipi avviene al deploy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;

serve(async (req: Request) => {
  try {
    const { imageBase64, expectedLandmark } = await req.json().catch(() => ({}));

    if (!imageBase64 || !expectedLandmark) {
      // Text-only test using Groq
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Say OK in Italian" }],
        }),
      });

      const data = await response.json();
      if (data.error) {
        return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
      }
      return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
    }

    // Visione: Pollinations.ai (servizio gratuito multimodale)
    const prompt = `Questa foto è stata scattata davanti al monumento "${expectedLandmark}"?
Rispondi ESCLUSIVAMENTE con un oggetto JSON valido in italiano, senza markdown, con questi campi:
{
  "match": true/false,
  "confidence": numero da 0 a 100,
  "feedback": "breve messaggio in italiano che spiega perché hai dato questa risposta"
}`;

    const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) {
      return new Response(JSON.stringify({ match: false, feedback: data.error.message }), { status: 500 });
    }
    const content = data.choices?.[0]?.message?.content || "{}";
    return new Response(content, { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ match: false, feedback: error.message }), { status: 500 });
  }
});
